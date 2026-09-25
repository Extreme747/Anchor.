import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/drip/sequences
router.get('/sequences', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sequences = await prisma.dripSequence.findMany({
      where: { organizationId: req.user!.organizationId },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        enrollments: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = sequences.map((s) => {
      const totalEnrolled = s.enrollments.length;
      const activeEnrolled = s.enrollments.filter((e) => e.status === 'ACTIVE').length;
      const completedEnrolled = s.enrollments.filter((e) => e.status === 'COMPLETED').length;

      return {
        id: s.id,
        name: s.name,
        status: s.status,
        stepsCount: s.steps.length,
        steps: s.steps,
        totalEnrolled,
        activeEnrolled,
        completedEnrolled,
        replyRate: totalEnrolled > 0 ? Math.round((completedEnrolled / totalEnrolled) * 64) : 0,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drip/sequences
router.post('/sequences', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, steps } = req.body;

    const sequence = await prisma.dripSequence.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        status: 'ACTIVE',
      },
    });

    if (Array.isArray(steps) && steps.length > 0) {
      await prisma.dripStep.createMany({
        data: steps.map((s: any, idx: number) => ({
          sequenceId: sequence.id,
          stepNumber: idx + 1,
          delayMinutes: s.delayMinutes || 60,
          customText: s.customText || '',
          templateId: s.templateId || null,
          branchRule: s.branchRule || 'STOP_IF_REPLIED',
        })),
      });
    }

    const created = await prisma.dripSequence.findUnique({
      where: { id: sequence.id },
      include: { steps: true },
    });

    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drip/enroll
router.post('/enroll', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sequenceId, leadIds } = req.body;

    if (!sequenceId || !Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ error: 'sequenceId and leadIds are required' });
      return;
    }

    const sequence = await prisma.dripSequence.findFirst({
      where: { id: sequenceId, organizationId: req.user!.organizationId },
      include: { steps: { orderBy: { stepNumber: 'asc' }, take: 1 } },
    });

    if (!sequence || sequence.steps.length === 0) {
      res.status(404).json({ error: 'Sequence not found or has no steps' });
      return;
    }

    const firstStep = sequence.steps[0];
    const nextRunAt = new Date(Date.now() + firstStep.delayMinutes * 60 * 1000);

    let enrolledCount = 0;
    for (const leadId of leadIds) {
      try {
        await prisma.dripEnrollment.upsert({
          where: {
            leadId_sequenceId: {
              leadId,
              sequenceId,
            },
          },
          update: {
            status: 'ACTIVE',
            currentStep: 1,
            nextRunAt,
          },
          create: {
            leadId,
            sequenceId,
            currentStep: 1,
            status: 'ACTIVE',
            nextRunAt,
          },
        });
        enrolledCount++;
      } catch {
        // skip if invalid lead
      }
    }

    res.json({ success: true, enrolledCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/drip/sequences/:id
router.patch('/sequences/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, name } = req.body;

    const updated = await prisma.dripSequence.updateMany({
      where: { id, organizationId: req.user!.organizationId },
      data: {
        ...(status && { status }),
        ...(name && { name }),
      },
    });

    res.json({ success: true, updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
