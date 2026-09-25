import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { name, email, phone, businessName, password, industry } = req.body;

    if (!email || !password || !name || !businessName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    const organization = await prisma.organization.create({
      data: {
        name: businessName,
        slug,
        industry: industry || 'Real Estate',
        phone,
      },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        organizationId: organization.id,
        email,
        name,
        phone,
        passwordHash,
        role: 'OWNER',
      },
    });

    const token = jwt.sign(
      { userId: user.id, organizationId: organization.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          industry: organization.industry,
        },
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
          industry: user.organization.industry,
          numberMaskingEnabled: user.organization.numberMaskingEnabled,
        },
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { organization: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        industry: user.organization.industry,
        wabaId: user.organization.wabaId,
        phoneNumberId: user.organization.phoneNumberId,
        numberMaskingEnabled: user.organization.numberMaskingEnabled,
        workingHoursStart: user.organization.workingHoursStart,
        workingHoursEnd: user.organization.workingHoursEnd,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/team
router.get('/team', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const team = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        isOnline: true,
        activeChatsCount: true,
        dailyCapacity: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(team);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/team/invite
router.post('/team/invite', authMiddleware, requireRole(['OWNER', 'MANAGER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const defaultPassword = 'anchor' + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        email,
        phone,
        role: role || 'AGENT',
        passwordHash,
      },
    });

    res.json({
      success: true,
      user: newUser,
      temporaryPassword: defaultPassword,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/org
router.patch('/org', authMiddleware, requireRole(['OWNER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, industry, numberMaskingEnabled, workingHoursStart, workingHoursEnd, wabaId, phoneNumberId, metaAccessToken } = req.body;

    const updatedOrg = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: {
        ...(name && { name }),
        ...(industry && { industry }),
        ...(numberMaskingEnabled !== undefined && { numberMaskingEnabled }),
        ...(workingHoursStart && { workingHoursStart }),
        ...(workingHoursEnd && { workingHoursEnd }),
        ...(wabaId && { wabaId }),
        ...(phoneNumberId && { phoneNumberId }),
        ...(metaAccessToken && { metaAccessToken }),
      },
    });

    res.json({ success: true, organization: updatedOrg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
