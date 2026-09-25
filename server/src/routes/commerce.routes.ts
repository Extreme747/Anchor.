import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { SocketService } from '../services/socket.service.js';

const router = Router();

// GET /api/commerce/flows
router.get('/flows', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const flows = await prisma.flow.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = flows.map((f) => ({
      ...f,
      screens: JSON.parse(f.screensJson || '[]'),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/commerce/flows
router.post('/flows', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, category, screens } = req.body;

    const flow = await prisma.flow.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        category: category || 'Real Estate',
        screensJson: JSON.stringify(screens || []),
        status: 'PUBLISHED',
      },
    });

    res.json(flow);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/commerce/payments
router.get('/payments', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.paymentLink.findMany({
      where: { organizationId: req.user!.organizationId },
      include: {
        lead: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/commerce/payments/create-link
router.post('/payments/create-link', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { leadId, amountINR, description, paymentMethod } = req.body;

    if (!leadId || !amountINR) {
      res.status(400).json({ error: 'leadId and amountINR are required' });
      return;
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: req.user!.organizationId },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const rzpId = `plink_${Date.now()}_${Math.random().toString(36).substring(4, 8)}`;
    const paymentUrl = `https://rzp.io/i/${rzpId}`;

    const payment = await prisma.paymentLink.create({
      data: {
        organizationId: req.user!.organizationId,
        leadId,
        amountINR: parseFloat(amountINR),
        description: description || 'Token Booking Amount',
        razorpayLinkId: rzpId,
        paymentUrl,
        status: 'SENT',
        paymentMethod: paymentMethod || 'UPI',
      },
    });

    // Also send payment link message in chat thread
    const msg = await prisma.message.create({
      data: {
        organizationId: req.user!.organizationId,
        leadId,
        senderType: 'AGENT',
        senderId: req.user!.id,
        text: `💳 Payment Request for ${description || 'Booking'}: ₹${Number(amountINR).toLocaleString('en-IN')}\n\nPay securely via UPI / Card: ${paymentUrl}`,
        status: 'DELIVERED',
        category: 'SERVICE',
        messageCostINR: 0.0,
      },
    });

    SocketService.broadcastToLead(leadId, 'message:new', msg);

    res.json({ success: true, payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/commerce/payments/simulate-success
router.post('/payments/simulate-success', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.body;

    const payment = await prisma.paymentLink.findFirst({
      where: { id: paymentId, organizationId: req.user!.organizationId },
      include: { lead: true },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const updatedPayment = await prisma.paymentLink.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        receiptUrl: `https://anchor.io/receipt/${payment.razorpayLinkId}`,
      },
    });

    // Auto-update lead status to WON upon booking confirmation!
    await prisma.lead.update({
      where: { id: payment.leadId },
      data: { status: 'WON' },
    });

    // Send confirmation message
    const msg = await prisma.message.create({
      data: {
        organizationId: req.user!.organizationId,
        leadId: payment.leadId,
        senderType: 'SYSTEM',
        text: `✅ Payment of ₹${payment.amountINR.toLocaleString('en-IN')} Received! Deal closed successfully. Receipt: ${updatedPayment.receiptUrl}`,
        status: 'DELIVERED',
        category: 'SERVICE',
        messageCostINR: 0.0,
      },
    });

    SocketService.broadcastToLead(payment.leadId, 'message:new', msg);
    SocketService.broadcastToOrg(req.user!.organizationId, 'lead:update', {
      id: payment.leadId,
      status: 'WON',
    });

    res.json({ success: true, payment: updatedPayment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY PRODUCTION WEBHOOK RECEIVER
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/commerce/webhooks/razorpay
router.post('/webhooks/razorpay', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_2026';

    // Verify cryptographic HMAC signature if provided
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Razorpay webhook signature mismatch!');
        res.status(400).json({ error: 'Invalid Razorpay signature' });
        return;
      }
    }

    const event = req.body.event; // e.g. 'payment_link.paid', 'payment.captured'
    const payload = req.body.payload;

    let razorpayLinkId = '';
    let amountINR = 0;
    let paymentId = '';

    if (payload?.payment_link?.entity) {
      razorpayLinkId = payload.payment_link.entity.id;
      amountINR = payload.payment_link.entity.amount / 100;
    } else if (payload?.payment?.entity) {
      paymentId = payload.payment.entity.id;
      amountINR = payload.payment.entity.amount / 100;
      razorpayLinkId = payload.payment.entity.description || '';
    }

    // Find matching PaymentLink in database
    let paymentLink = await prisma.paymentLink.findFirst({
      where: {
        OR: [
          ...(razorpayLinkId ? [{ razorpayLinkId }] : []),
          ...(amountINR ? [{ amountINR }] : []),
        ],
      },
      include: { lead: true, organization: true },
      orderBy: { createdAt: 'desc' },
    });

    if (paymentLink) {
      const updatedPayment = await prisma.paymentLink.update({
        where: { id: paymentLink.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          receiptUrl: `https://anchor.io/receipt/${paymentLink.razorpayLinkId || paymentId || 'rzp_paid'}`,
        },
      });

      // Update lead to WON
      await prisma.lead.update({
        where: { id: paymentLink.leadId },
        data: { status: 'WON' },
      });

      // Send WhatsApp payment confirmation in chat thread
      const msg = await prisma.message.create({
        data: {
          organizationId: paymentLink.organizationId,
          leadId: paymentLink.leadId,
          senderType: 'SYSTEM',
          text: `🎉 PAYMENT CONFIRMED (Razorpay): ₹${amountINR.toLocaleString('en-IN')} received successfully!\n\nBooking token is locked. Receipt: ${updatedPayment.receiptUrl}`,
          status: 'DELIVERED',
          category: 'SERVICE',
          messageCostINR: 0.0,
        },
      });

      SocketService.broadcastToLead(paymentLink.leadId, 'message:new', msg);
      SocketService.broadcastToOrg(paymentLink.organizationId, 'lead:update', {
        id: paymentLink.leadId,
        status: 'WON',
      });
      SocketService.broadcastToOrg(paymentLink.organizationId, 'payment:received', {
        payment: updatedPayment,
        lead: paymentLink.lead,
      });

      console.log(`✅ Razorpay Webhook Processed: ₹${amountINR} received for Lead ${paymentLink.lead.name}`);
    }

    res.json({ status: 'ok', event, processed: Boolean(paymentLink) });
  } catch (err: any) {
    console.error('Error processing Razorpay webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/commerce/webhooks/simulate
router.post('/webhooks/simulate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadId, amountINR } = req.body;

    const lead = await prisma.lead.findFirst({
      where: leadId ? { id: leadId } : {},
      include: { organization: true },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found for simulation' });
      return;
    }

    const testAmount = amountINR ? parseFloat(amountINR) : 25000;
    const rzpId = `plink_test_${Date.now()}`;

    // Create payment link if not exists
    const payment = await prisma.paymentLink.create({
      data: {
        organizationId: lead.organizationId,
        leadId: lead.id,
        amountINR: testAmount,
        description: 'Simulated Razorpay Token Payment',
        razorpayLinkId: rzpId,
        paymentUrl: `https://rzp.io/i/${rzpId}`,
        status: 'PAID',
        paidAt: new Date(),
        receiptUrl: `https://anchor.io/receipt/${rzpId}`,
        paymentMethod: 'UPI',
      },
    });

    // Update lead to WON
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'WON' },
    });

    const msg = await prisma.message.create({
      data: {
        organizationId: lead.organizationId,
        leadId: lead.id,
        senderType: 'SYSTEM',
        text: `⚡ RAZORPAY VERIFIED: ₹${testAmount.toLocaleString('en-IN')} Received via UPI!\n\nBooking token is confirmed. Receipt: ${payment.receiptUrl}`,
        status: 'DELIVERED',
        category: 'SERVICE',
        messageCostINR: 0.0,
      },
    });

    SocketService.broadcastToLead(lead.id, 'message:new', msg);
    SocketService.broadcastToOrg(lead.organizationId, 'lead:update', {
      id: lead.id,
      status: 'WON',
    });
    SocketService.broadcastToOrg(lead.organizationId, 'payment:received', {
      payment,
      lead,
    });

    res.json({
      success: true,
      message: `Razorpay webhook simulated successfully for ₹${testAmount.toLocaleString('en-IN')}`,
      payment,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
