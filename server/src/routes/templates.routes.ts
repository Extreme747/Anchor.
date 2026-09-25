import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/templates
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const templates = await prisma.template.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = templates.map((t) => ({
      ...t,
      buttons: JSON.parse(t.buttons || '[]'),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/templates
router.post('/', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, category, language, headerType, headerContent, bodyText, footerText, buttons } = req.body;

    const template = await prisma.template.create({
      data: {
        organizationId: req.user!.organizationId,
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        category: category || 'MARKETING',
        language: language || 'en_US',
        headerType: headerType || 'NONE',
        headerContent,
        bodyText,
        footerText,
        buttons: JSON.stringify(buttons || []),
        metaStatus: 'APPROVED', // Simulated auto-approval for seamless testing
      },
    });

    res.json({
      ...template,
      buttons: JSON.parse(template.buttons || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
