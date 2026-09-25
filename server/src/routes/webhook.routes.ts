import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { MetaProtocolService } from '../services/meta.service.js';
import { IntentScoringEngine } from '../services/intent.service.js';
import { AutoReplyEngine } from '../services/autoreply.service.js';
import { RoutingService } from '../services/routing.service.js';
import { SocketService } from '../services/socket.service.js';

const router = Router();

// GET /api/webhook/meta (Meta Webhook Handshake Verification)
router.get('/meta', (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.metaVerifyToken) {
    console.log('✅ Meta Webhook challenge verified successfully!');
    res.status(200).send(challenge);
    return;
  }

  res.status(403).json({ error: 'Verification token mismatch' });
});

// POST /api/webhook/meta (Inbound Message Webhook Receiver)
router.post('/meta', async (req: Request, res: Response): Promise<void> => {
  // 1. Immediately return 200 OK to Meta to prevent retry storms
  res.status(200).send('EVENT_RECEIVED');

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-hub-signature-256'] as string;

    // Verify cryptographic HMAC-SHA256 signature
    const isValid = MetaProtocolService.verifySignature(rawBody, signature);
    if (!isValid && config.nodeEnv === 'production') {
      console.warn('⚠️ Invalid HMAC signature received on Meta webhook');
      return;
    }

    const parsedMessages = MetaProtocolService.parseWebhookPayload(req.body);
    if (parsedMessages.length === 0) return;

    // In a multi-tenant setup, find the default or matching organization
    const org = await prisma.organization.findFirst({
      include: {
        autoReplyRules: true,
      },
    });

    if (!org) return;

    for (const msg of parsedMessages) {
      await processInboundMessage(org, msg);
    }
  } catch (err) {
    console.error('Error handling Meta webhook:', err);
  }
});

export async function processInboundMessage(org: any, msg: any) {
  const now = new Date();
  const sessionExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours Meta gate
  const slaDeadlineAt = new Date(now.getTime() + 7 * 60 * 1000); // 7 min SLA

  // Find or create lead
  let lead = await prisma.lead.findFirst({
    where: { organizationId: org.id, phone: msg.fromPhone },
  });

  const intentResult = IntentScoringEngine.calculateScore(msg.text || '', lead?.intentScore || 0);

  if (!lead) {
    const isCtwa = Boolean(msg.ctwaReferral);
    const ctwaWindowExpiresAt = isCtwa ? new Date(now.getTime() + 72 * 60 * 60 * 1000) : null;

    lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        name: msg.senderName,
        phone: msg.fromPhone,
        source: isCtwa ? 'Meta Ad (CTWA)' : 'Organic WhatsApp',
        status: 'NEW',
        intentScore: intentResult.score,
        estimatedValueINR: intentResult.estimatedValue || 0,
        unreadCount: 1,
        isCtwa,
        ctwaReferral: msg.ctwaReferral ? JSON.stringify(msg.ctwaReferral) : null,
        ctwaWindowExpiresAt,
        lastInboundAt: now,
        sessionExpiresAt,
        isSessionOpen: true,
        slaDeadlineAt,
      },
    });

    // Auto-assign lead via RoutingService
    const assignedAgentId = await RoutingService.assignLead(org.id, {
      id: lead.id,
      tags: [],
      estimatedValue: intentResult.estimatedValue,
    });

    if (assignedAgentId) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: { assignedAgentId },
      });
    }

    SocketService.broadcastToOrg(org.id, 'lead:new', lead);
  } else {
    lead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        intentScore: intentResult.score,
        estimatedValueINR: intentResult.estimatedValue || lead.estimatedValueINR,
        unreadCount: { increment: 1 },
        lastInboundAt: now,
        sessionExpiresAt,
        isSessionOpen: true,
        slaDeadlineAt: lead.status === 'NEW' ? slaDeadlineAt : lead.slaDeadlineAt,
      },
    });

    SocketService.broadcastToOrg(org.id, 'lead:update', lead);
  }

  // Save the incoming message
  const savedMsg = await prisma.message.create({
    data: {
      organizationId: org.id,
      leadId: lead.id,
      senderType: 'LEAD',
      text: msg.text,
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType,
      messageType: msg.messageType.toUpperCase(),
      metaMessageId: msg.metaMessageId,
      status: 'READ',
      category: 'SERVICE',
      messageCostINR: 0.0,
      isCtwaFree: lead.isCtwa,
      rawPayload: JSON.stringify(msg.rawPayload || {}),
    },
  });

  SocketService.broadcastToLead(lead.id, 'message:new', savedMsg);

  // 4. Deterministic Auto-Reply Evaluation
  const rules = await prisma.autoReplyRule.findMany({
    where: { organizationId: org.id, isEnabled: true },
  });

  const parsedRules = rules.map((r) => ({
    name: r.name,
    triggerType: r.triggerType,
    keywords: JSON.parse(r.keywords || '[]'),
    responseText: r.responseText,
    templateId: r.templateId,
    isEnabled: r.isEnabled,
    dedupSeconds: r.dedupSeconds,
  }));

  const autoReplyResult = AutoReplyEngine.evaluate(
    msg.text || '',
    {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      organizationName: org.name,
    },
    parsedRules,
    {
      start: org.workingHoursStart,
      end: org.workingHoursEnd,
      days: org.workingDays,
    }
  );

  if (autoReplyResult.triggered && autoReplyResult.replyText) {
    const dispatchResult = await MetaProtocolService.sendMessage({
      toPhone: lead.phone,
      text: autoReplyResult.replyText,
      phoneNumberId: org.phoneNumberId,
      metaAccessToken: org.metaAccessToken,
    });

    const replyMsg = await prisma.message.create({
      data: {
        organizationId: org.id,
        leadId: lead.id,
        senderType: 'AUTO_REPLY',
        text: autoReplyResult.replyText,
        metaMessageId: dispatchResult.metaMessageId,
        status: 'DELIVERED',
        category: 'SERVICE',
        messageCostINR: 0.0,
        isCtwaFree: lead.isCtwa,
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { lastOutboundAt: new Date() },
    });

    SocketService.broadcastToLead(lead.id, 'message:new', replyMsg);
  }

  return lead;
}

export default router;
