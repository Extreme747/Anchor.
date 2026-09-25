import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/auto-replies
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rules = await prisma.autoReplyRule.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { priority: 'desc' },
    });

    const formatted = rules.map((r) => ({
      ...r,
      keywords: JSON.parse(r.keywords || '[]'),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auto-replies
router.post('/', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, triggerType, keywords, responseText, templateId, isEnabled, dedupSeconds, priority } = req.body;

    const rule = await prisma.autoReplyRule.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        triggerType: triggerType || 'KEYWORD',
        keywords: JSON.stringify(keywords || []),
        responseText,
        templateId,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        dedupSeconds: dedupSeconds || 30,
        priority: priority || 0,
      },
    });

    res.json({
      ...rule,
      keywords: JSON.parse(rule.keywords || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auto-replies/:id
router.patch('/:id', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, triggerType, keywords, responseText, templateId, isEnabled, dedupSeconds, priority } = req.body;

    const updated = await prisma.autoReplyRule.update({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
      data: {
        ...(name && { name }),
        ...(triggerType && { triggerType }),
        ...(keywords && { keywords: JSON.stringify(keywords) }),
        ...(responseText && { responseText }),
        ...(templateId !== undefined && { templateId }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(dedupSeconds !== undefined && { dedupSeconds }),
        ...(priority !== undefined && { priority }),
      },
    });

    res.json({
      ...updated,
      keywords: JSON.parse(updated.keywords || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auto-replies/:id
router.delete('/:id', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.autoReplyRule.delete({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
