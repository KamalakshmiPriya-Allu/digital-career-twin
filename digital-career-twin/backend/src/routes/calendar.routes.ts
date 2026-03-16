import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const calendarRouter = Router();
const VALID_TYPES = ['exam', 'assignment', 'holiday', 'deadline'];

calendarRouter.get('/events', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const events = await prisma.calendarEvent.findMany({
    where: { userId: req.user!.userId },
    orderBy: { date: 'asc' },
  });
  res.json({ events });
});

calendarRouter.post('/events', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, type, date } = req.body;
  if (!title || !type || !date) {
    res.status(400).json({ error: 'title, type, date required' });
    return;
  }
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: 'type must be exam|assignment|holiday|deadline' });
    return;
  }
  try {
    const event = await prisma.calendarEvent.create({
      data: { userId: req.user!.userId, title, type, date: new Date(date) },
    });
    res.status(201).json(event);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

calendarRouter.delete('/events/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.calendarEvent.deleteMany({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    res.json({ deleted: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

calendarRouter.get('/upcoming', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const events = await prisma.calendarEvent.findMany({
    where: { userId: req.user!.userId, date: { gte: now, lte: in7 } },
    orderBy: { date: 'asc' },
  });
  const nextExam = events.find((e) => e.type === 'exam');
  const examInDays = nextExam
    ? Math.ceil((new Date(nextExam.date).getTime() - now.getTime()) / 86400000)
    : null;
  res.json({ events, isExamSoon: !!nextExam, examInDays });
});
