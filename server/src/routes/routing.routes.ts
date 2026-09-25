import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/routing/rules
router.get('/rules', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rules = await prisma.routingRule.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { priority: 'desc' },
    });

    const formatted = rules.map((r) => ({
      ...r,
      conditions: JSON.parse(r.conditions || '{}'),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/routing/rules
router.post('/rules', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, conditions, strategy, targetAgentId, priority } = req.body;

    const rule = await prisma.routingRule.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        conditions: JSON.stringify(conditions || {}),
        strategy: strategy || 'ROUND_ROBIN',
        targetAgentId: targetAgentId || null,
        priority: priority || 0,
      },
    });

    res.json(rule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/routing/sla
router.get('/sla', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sla = await prisma.sLAConfig.findFirst({
      where: { organizationId: req.user!.organizationId },
    });
    res.json(sla || { firstResponseMinutes: 7, autoRevokeOnBreach: true, escalationTarget: 'MANAGER' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/routing/sla
router.patch('/sla', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { firstResponseMinutes, autoRevokeOnBreach, escalationTarget } = req.body;

    const existing = await prisma.sLAConfig.findFirst({
      where: { organizationId: req.user!.organizationId },
    });

    let updated;
    if (existing) {
      updated = await prisma.sLAConfig.update({
        where: { id: existing.id },
        data: {
          ...(firstResponseMinutes !== undefined && { firstResponseMinutes: parseInt(firstResponseMinutes, 10) }),
          ...(autoRevokeOnBreach !== undefined && { autoRevokeOnBreach }),
          ...(escalationTarget && { escalationTarget }),
        },
      });
    } else {
      updated = await prisma.sLAConfig.create({
        data: {
          organizationId: req.user!.organizationId,
          firstResponseMinutes: parseInt(firstResponseMinutes || '7', 10),
          autoRevokeOnBreach: autoRevokeOnBreach !== undefined ? autoRevokeOnBreach : true,
          escalationTarget: escalationTarget || 'MANAGER',
        },
      });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/routing/agents
router.get('/agents', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const agents = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isOnline: true,
        activeChatsCount: true,
        dailyCapacity: true,
      },
    });

    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/routing/agents/:id/status
router.patch('/agents/:id/status', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isOnline } = req.body;

    const user = await prisma.user.findFirst({
      where: { id, organizationId: req.user!.organizationId },
    });

    if (!user) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(isOnline !== undefined && { isOnline }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnline: true,
        activeChatsCount: true,
        dailyCapacity: true,
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/routing/rules/:id
router.patch('/rules/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { enabled, isEnabled, priority, name } = req.body;

    const updated = await prisma.routingRule.updateMany({
      where: { id, organizationId: req.user!.organizationId },
      data: {
        ...((enabled !== undefined || isEnabled !== undefined) && { isEnabled: enabled !== undefined ? enabled : isEnabled }),
        ...(priority !== undefined && { priority }),
        ...(name && { name }),
      },
    });

    res.json({ success: true, updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
