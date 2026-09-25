import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, maskPhone } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { MetaProtocolService } from '../services/meta.service.js';

const router = Router();

// GET /api/leads
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, tag, search, ctwa, agentId } = req.query;
    const orgId = req.user!.organizationId;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { numberMaskingEnabled: true },
    });

    const shouldMask = Boolean(req.user!.role === 'AGENT' && org?.numberMaskingEnabled);

    const where: any = { organizationId: orgId };

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (ctwa === 'true') {
      where.isCtwa = true;
    }
    if (agentId) {
      where.assignedAgentId = agentId;
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedAgent: {
          select: { id: true, name: true, role: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Post-process tags filter, masking, and session window calculations
    let filteredLeads = leads;
    if (tag && tag !== 'ALL') {
      filteredLeads = leads.filter((l) => {
        try {
          const tags = JSON.parse(l.tags || '[]');
          return tags.includes(tag);
        } catch {
          return false;
        }
      });
    }

    const formatted = filteredLeads.map((lead) => {
      const session = MetaProtocolService.getSessionWindow(lead.lastInboundAt);
      const lastMessage = lead.messages[0];

      return {
        id: lead.id,
        name: lead.name,
        phone: maskPhone(lead.phone, shouldMask),
        rawPhone: shouldMask ? undefined : lead.phone,
        email: lead.email,
        source: lead.source,
        city: lead.city,
        tags: JSON.parse(lead.tags || '[]'),
        status: lead.status,
        score: lead.intentScore,
        value: lead.estimatedValueINR > 0 ? `₹${(lead.estimatedValueINR / 10000000).toFixed(1)} Cr` : '—',
        estimatedValueINR: lead.estimatedValueINR,
        unread: lead.unreadCount,
        ctwa: lead.isCtwa,
        assignedAgent: lead.assignedAgent,
        lastInboundAt: lead.lastInboundAt,
        session,
        preview: lastMessage?.text || 'No messages yet',
        lastMessageTime: lastMessage?.createdAt,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { numberMaskingEnabled: true },
    });
    const shouldMask = Boolean(req.user!.role === 'AGENT' && org?.numberMaskingEnabled);

    const id = req.params.id as string;
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: orgId },
      include: {
        assignedAgent: { select: { id: true, name: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const session = MetaProtocolService.getSessionWindow(lead.lastInboundAt);

    res.json({
      ...lead,
      phone: maskPhone(lead.phone, shouldMask),
      tags: JSON.parse(lead.tags || '[]'),
      ctwaReferral: lead.ctwaReferral ? JSON.parse(lead.ctwaReferral) : null,
      session,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads (Manual lead creation)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, email, city, source, tags, status, assignedAgentId, estimatedValueINR } = req.body;
    const orgId = req.user!.organizationId;

    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone are required' });
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId: orgId,
        name,
        phone,
        email,
        city,
        source: source || 'Direct Add',
        tags: JSON.stringify(tags || []),
        status: status || 'NEW',
        assignedAgentId: assignedAgentId || req.user!.id,
        estimatedValueINR: estimatedValueINR ? parseFloat(estimatedValueINR) : 0,
      },
    });

    res.json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id
router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { status, tags, assignedAgentId, city, intentScore, estimatedValueINR } = req.body;

    const id = req.params.id as string;
    const updated = await prisma.lead.update({
      where: { id, organizationId: orgId },
      data: {
        ...(status && { status }),
        ...(tags && { tags: JSON.stringify(tags) }),
        ...(assignedAgentId !== undefined && { assignedAgentId }),
        ...(city && { city }),
        ...(intentScore !== undefined && { intentScore: parseInt(intentScore, 10) }),
        ...(estimatedValueINR !== undefined && { estimatedValueINR: parseFloat(estimatedValueINR) }),
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/bulk
router.post('/bulk', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { leadIds, action, value } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ error: 'No lead IDs provided' });
      return;
    }

    if (action === 'STATUS') {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds }, organizationId: orgId },
        data: { status: value },
      });
    } else if (action === 'ASSIGN') {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds }, organizationId: orgId },
        data: { assignedAgentId: value },
      });
    }

    res.json({ success: true, count: leadIds.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
