import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const userRouter = Router();

const SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  degree: true,
  year: true,
  college: true,
  marks10th: true,
  marks12th: true,
  cgpa: true,
  targetRole: true,
  targetCompany: true,
  expectedSalary: true,
  skills: true,
  learningPreference: true,
  interests: true,
  strengths: true,
  weaknesses: true,
  streakDays: true,
  careerReadiness: true,
  onboardingDone: true,
  notificationsEnabled: true,
  createdAt: true,
};

userRouter.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: SELECT,
    });
    if (!user) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const fields = [
    'name', 'avatarUrl', 'degree', 'year', 'college', 'marks10th', 'marks12th', 'cgpa',
    'targetRole', 'targetCompany', 'expectedSalary', 'skills', 'learningPreference',
    'interests', 'strengths', 'weaknesses', 'onboardingDone', 'notificationsEnabled'
  ];
  const data: Record<string, unknown> = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) data[f] = req.body[f];
  });
  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.patch('/streak', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const u = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { streakDays: { increment: 1 } },
    });
    res.json({ streakDays: u.streakDays });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.patch('/readiness', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { score } = req.body;
  try {
    const u = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { careerReadiness: score },
    });
    res.json({ careerReadiness: u.careerReadiness });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
