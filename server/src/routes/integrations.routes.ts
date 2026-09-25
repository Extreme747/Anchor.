import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { processInboundMessage } from './webhook.routes.js';

const router = Router();

// GET /api/integrations
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { organizationId: req.user!.organizationId },
    });

    const defaults = [
      { provider: 'GOOGLE_SHEETS', name: 'Google Sheets 2-Way Sync', isEnabled: true, icon: '📊' },
      { provider: '99ACRES', name: '99acres Portal Direct Bridge', isEnabled: true, icon: '🏢' },
      { provider: 'MAGICBRICKS', name: 'MagicBricks Real Estate Leads', isEnabled: false, icon: '🧱' },
      { provider: 'TALLY_ERP', name: 'Tally Prime / ERP Bridge', isEnabled: true, icon: '📑' },
      { provider: 'ZOHO_BOOKS', name: 'Zoho Books Invoice Sync', isEnabled: false, icon: '💼' },
      { provider: 'AGENCY_PORTAL', name: 'Agency Partner 20% Rev-Share', isEnabled: true, icon: '🤝' },
    ];

    const result = defaults.map((def) => {
      const existing = integrations.find((i) => i.provider === def.provider);
      return {
        ...def,
        isEnabled: existing ? existing.isEnabled : def.isEnabled,
        lastSyncAt: existing?.lastSyncAt || new Date().toISOString(),
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/:provider/toggle
router.post('/:provider/toggle', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const { isEnabled } = req.body;

    const integration = await prisma.integration.upsert({
      where: { id: `${req.user!.organizationId}_${provider}` },
      update: { isEnabled, lastSyncAt: new Date() },
      create: {
        id: `${req.user!.organizationId}_${provider}`,
        organizationId: req.user!.organizationId,
        provider,
        isEnabled,
        credentials: '{}',
        config: '{}',
        lastSyncAt: new Date(),
      },
    });

    res.json({ success: true, integration });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/portal-inbound (99acres / MagicBricks Webhook)
router.post('/portal-inbound', async (req: Request, res: Response): Promise<void> => {
  try {
    const { portal, leadName, phone, propertyTitle, budget } = req.body;

    const org = await prisma.organization.findFirst();
    if (!org) {
      res.status(404).json({ error: 'Org not found' });
      return;
    }

    const simulatedMessage = {
      fromPhone: phone || '+91 99000 ' + Math.floor(10000 + Math.random() * 90000),
      senderName: leadName || 'Portal Lead',
      metaMessageId: `portal_${Date.now()}`,
      timestamp: new Date(),
      messageType: 'text',
      text: `Inquiry from ${portal || '99acres'}: Interested in ${propertyTitle || '3BHK Property'}. Budget: ${budget || '1.5 Cr'}`,
      rawPayload: req.body,
    };

    await processInboundMessage(org, simulatedMessage);

    res.json({ success: true, message: `Lead from ${portal || 'Portal'} ingested into Anchor` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
