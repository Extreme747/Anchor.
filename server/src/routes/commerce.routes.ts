import { Router, Response } from 'express';
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

export default router;
