import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { processInboundMessage } from './webhook.routes.js';

const router = Router();

// POST /api/simulator/send-inbound
router.post('/send-inbound', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, message, isCtwa, adHeadline, estimatedValue } = req.body;

    const org = await prisma.organization.findFirst();
    if (!org) {
      res.status(404).json({ error: 'No organization found' });
      return;
    }

    const senderName = name || 'Simulated Buyer';
    const fromPhone = phone || '+91 99887 ' + Math.floor(10000 + Math.random() * 90000);
    const text = message || 'Hi, interested in 3BHK at Sector 62. Site visit kab kar sakte hain?';

    const simulatedMessage = {
      fromPhone,
      senderName,
      metaMessageId: `sim_wamid_${Date.now()}`,
      timestamp: new Date(),
      messageType: 'text',
      text,
      ctwaReferral: isCtwa
        ? {
            adId: 'ad_simulated_meta_campaign',
            campaignId: 'cmp_gurugram_luxury',
            headline: adHeadline || 'Luxury 3BHK starting ₹1.2 Cr',
            sourceUrl: 'https://instagram.com/ad/simulated',
          }
        : undefined,
      rawPayload: { simulated: true },
    };

    await processInboundMessage(org, simulatedMessage);

    const lead = await prisma.lead.findFirst({
      where: { organizationId: org.id, phone: fromPhone },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    res.json({
      success: true,
      message: 'Inbound message simulated successfully!',
      lead,
    });
  } catch (err: any) {
    console.error('Simulator error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
