import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { MetaProtocolService } from '../services/meta.service.js';
import { CostTrackerService } from '../services/cost.service.js';
import { SocketService } from '../services/socket.service.js';

const router = Router();

// GET /api/messages/:leadId
router.get('/:leadId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const leadId = req.params.leadId as string;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: orgId },
      select: { id: true, lastInboundAt: true },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Reset unread count when thread is opened
    await prisma.lead.update({
      where: { id: leadId },
      data: { unreadCount: 0 },
    });

    const messages = await prisma.message.findMany({
      where: { leadId, organizationId: orgId },
      orderBy: { createdAt: 'asc' },
    });

    const session = MetaProtocolService.getSessionWindow(lead.lastInboundAt);

    const formatted = messages.map((m) => ({
      id: m.id,
      from: m.senderType === 'LEAD' ? 'lead' : 'anchor',
      senderType: m.senderType,
      text: m.text,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      time: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: m.createdAt,
      auto: m.senderType === 'AUTO_REPLY',
      status: m.status.toLowerCase(),
      costINR: m.messageCostINR,
      category: m.category,
      isCtwaFree: m.isCtwaFree,
    }));

    res.json({
      session,
      messages: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages/send
router.post('/send', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { leadId, text, templateId } = req.body;

    if (!leadId || (!text && !templateId)) {
      res.status(400).json({ error: 'leadId and text or templateId are required' });
      return;
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: orgId },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    // Check 24-hour Meta Conversation Gate!
    const session = MetaProtocolService.getSessionWindow(lead.lastInboundAt);
    if (session.requiresTemplate && !templateId) {
      res.status(400).json({
        error:
          'Meta 24-Hour Policy Cliff: Session is closed. Outbound message requires an approved Meta Template.',
        code: 'META_SESSION_EXPIRED',
        requiresTemplate: true,
      });
      return;
    }

    let category = 'SERVICE';
    let messageType = 'TEXT';
    let contentToSend = text;

    if (templateId) {
      const template = await prisma.template.findFirst({
        where: { id: templateId, organizationId: orgId },
      });
      if (template) {
        category = template.category;
        messageType = 'TEMPLATE';
        contentToSend = text || template.bodyText;
      }
    }

    const costInfo = CostTrackerService.calculateCost(category, lead.isCtwa, Boolean(lead.isCtwa));

    // Dispatch message via Meta API or development simulator
    const dispatchResult = await MetaProtocolService.sendMessage({
      toPhone: lead.phone,
      text: contentToSend,
      templateId,
      phoneNumberId: org?.phoneNumberId,
      metaAccessToken: org?.metaAccessToken,
    });

    const savedMsg = await prisma.message.create({
      data: {
        organizationId: orgId,
        leadId: lead.id,
        senderType: 'AGENT',
        senderId: req.user!.id,
        text: contentToSend,
        messageType,
        templateId,
        metaMessageId: dispatchResult.metaMessageId,
        status: 'DELIVERED',
        category,
        messageCostINR: costInfo.costINR,
        isCtwaFree: costInfo.isCtwaFree,
      },
    });

    // Update lead timestamps and state
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        lastOutboundAt: new Date(),
        status: lead.status === 'NEW' ? 'CONTACTED' : lead.status,
      },
    });

    // Broadcast message to live sockets
    SocketService.broadcastToLead(lead.id, 'message:new', {
      id: savedMsg.id,
      from: 'anchor',
      senderType: 'AGENT',
      text: savedMsg.text,
      time: new Date(savedMsg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: savedMsg.createdAt,
      status: 'delivered',
      costINR: savedMsg.messageCostINR,
      category: savedMsg.category,
      isCtwaFree: savedMsg.isCtwaFree,
    });

    res.json({
      success: true,
      message: savedMsg,
      costInfo,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
