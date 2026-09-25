import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/auto-replies
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let rules = await prisma.autoReplyRule.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { priority: 'asc' },
    });

    if (rules.length === 0) {
      const defaultRules = [
        {
          name: 'Default greeting',
          triggerType: 'DEFAULT',
          keywords: '[]',
          responseText: "Hi {{name}}! Thanks for reaching out to {{business}}. Connecting you with our team right now.\n\nMeanwhile, here's our project brochure: {{link}}\n\nWould you like a site visit this weekend?",
          isEnabled: true,
          priority: 1,
          dedupSeconds: 30,
        },
        {
          name: 'Site visit inquiry',
          triggerType: 'KEYWORD',
          keywords: JSON.stringify(['site visit', 'visit', 'show me', 'property tour', 'darshan']),
          responseText: "Great! We'd love to show you the property. Our site visits run Mon–Sat 10 AM–6 PM.\n\nWhich day works best for you this week?",
          isEnabled: true,
          priority: 2,
          dedupSeconds: 60,
        },
        {
          name: 'Brochure request',
          triggerType: 'KEYWORD',
          keywords: JSON.stringify(['brochure', 'details', 'info', 'specification', 'floor plan']),
          responseText: "Here are the complete project details for {{property}}:\n\nBrochure: {{link}}\nFloor plans: {{floor_plan_link}}\nPricing: ₹1.2 Cr – 1.6 Cr (all-inclusive)\n\nAny questions?",
          isEnabled: true,
          priority: 3,
          dedupSeconds: 120,
        },
        {
          name: 'Hindi/Hinglish greeting',
          triggerType: 'KEYWORD',
          keywords: JSON.stringify(['namaste', 'namaskar', 'hello bhai', 'hi bhai', 'jai shri ram']),
          responseText: "Namaste {{name}}! Hamare Sector 62 ke premium 3BHK flats mein aapka swagat hai.\n\nKya aap site visit book karna chahenge?",
          isEnabled: true,
          priority: 4,
          dedupSeconds: 30,
        },
        {
          name: 'Outside working hours',
          triggerType: 'WORKING_HOURS',
          keywords: '[]',
          responseText: "Hi {{name}}! Our team is currently offline (working hours: Mon-Sat 9 AM – 7 PM).\n\nWe'll reach out to you first thing tomorrow morning. You're in the queue!",
          isEnabled: true,
          priority: 5,
          dedupSeconds: 0,
        },
        {
          name: 'Price inquiry regex',
          triggerType: 'REGEX',
          keywords: JSON.stringify(['(price|cost|rate|kitna|kya rate).*([0-9]|crore|lakh|cr|L)']),
          responseText: "Our 3BHK units are priced from ₹1.2 Cr to ₹1.6 Cr (all-inclusive — no hidden charges).\n\nFor a personalised quote based on floor and view, I'll connect you with our pricing advisor.",
          isEnabled: false,
          priority: 6,
          dedupSeconds: 90,
        },
      ];

      for (const dr of defaultRules) {
        await prisma.autoReplyRule.create({
          data: {
            organizationId: req.user!.organizationId,
            ...dr,
          },
        });
      }

      rules = await prisma.autoReplyRule.findMany({
        where: { organizationId: req.user!.organizationId },
        orderBy: { priority: 'asc' },
      });
    }

    const formatted = rules.map((r) => {
      let kws: string[] = [];
      try {
        kws = JSON.parse(r.keywords || '[]');
      } catch {
        kws = [];
      }
      return {
        id: r.id,
        name: r.name,
        triggerType: r.triggerType.toLowerCase().replace('_', '-'),
        keywords: Array.isArray(kws) ? kws.join(', ') : '',
        rawKeywords: kws,
        response: r.responseText,
        responseText: r.responseText,
        enabled: r.isEnabled,
        isEnabled: r.isEnabled,
        priority: r.priority,
        dedup: r.dedupSeconds,
        dedupSeconds: r.dedupSeconds,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auto-replies
router.post('/', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, triggerType, keywords, responseText, response, templateId, isEnabled, enabled, dedupSeconds, dedup, priority } = req.body;

    let parsedKeywords: string[] = [];
    if (Array.isArray(keywords)) {
      parsedKeywords = keywords;
    } else if (typeof keywords === 'string') {
      parsedKeywords = keywords.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const normType = (triggerType || 'KEYWORD').toUpperCase().replace('-', '_');

    const rule = await prisma.autoReplyRule.create({
      data: {
        organizationId: req.user!.organizationId,
        name: name || 'Custom Rule',
        triggerType: normType,
        keywords: JSON.stringify(parsedKeywords),
        responseText: responseText || response || '',
        templateId,
        isEnabled: isEnabled !== undefined ? isEnabled : enabled !== undefined ? enabled : true,
        dedupSeconds: dedupSeconds !== undefined ? Number(dedupSeconds) : dedup !== undefined ? Number(dedup) : 30,
        priority: priority ? Number(priority) : 10,
      },
    });

    res.json({
      id: rule.id,
      name: rule.name,
      triggerType: rule.triggerType.toLowerCase().replace('_', '-'),
      keywords: parsedKeywords.join(', '),
      rawKeywords: parsedKeywords,
      response: rule.responseText,
      responseText: rule.responseText,
      enabled: rule.isEnabled,
      isEnabled: rule.isEnabled,
      priority: rule.priority,
      dedup: rule.dedupSeconds,
      dedupSeconds: rule.dedupSeconds,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auto-replies/:id
router.patch('/:id', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, triggerType, keywords, responseText, response, templateId, isEnabled, enabled, dedupSeconds, dedup, priority } = req.body;

    let updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (triggerType !== undefined) updateData.triggerType = triggerType.toUpperCase().replace('-', '_');
    if (keywords !== undefined) {
      const parsedKeywords = Array.isArray(keywords)
        ? keywords
        : typeof keywords === 'string'
        ? keywords.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      updateData.keywords = JSON.stringify(parsedKeywords);
    }
    if (responseText !== undefined || response !== undefined) {
      updateData.responseText = responseText !== undefined ? responseText : response;
    }
    if (templateId !== undefined) updateData.templateId = templateId;
    if (isEnabled !== undefined || enabled !== undefined) {
      updateData.isEnabled = isEnabled !== undefined ? isEnabled : enabled;
    }
    if (dedupSeconds !== undefined || dedup !== undefined) {
      updateData.dedupSeconds = Number(dedupSeconds !== undefined ? dedupSeconds : dedup);
    }
    if (priority !== undefined) updateData.priority = Number(priority);

    const id = req.params.id as string;
    const updated = await prisma.autoReplyRule.update({
      where: { id, organizationId: req.user!.organizationId },
      data: updateData,
    });

    let kws: string[] = [];
    try {
      kws = JSON.parse(updated.keywords || '[]');
    } catch {
      kws = [];
    }

    res.json({
      id: updated.id,
      name: updated.name,
      triggerType: updated.triggerType.toLowerCase().replace('_', '-'),
      keywords: Array.isArray(kws) ? kws.join(', ') : '',
      rawKeywords: kws,
      response: updated.responseText,
      responseText: updated.responseText,
      enabled: updated.isEnabled,
      isEnabled: updated.isEnabled,
      priority: updated.priority,
      dedup: updated.dedupSeconds,
      dedupSeconds: updated.dedupSeconds,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auto-replies/:id
router.delete('/:id', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.autoReplyRule.delete({
      where: { id, organizationId: req.user!.organizationId },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
