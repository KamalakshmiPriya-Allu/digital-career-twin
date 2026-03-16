import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';

export const authRouter = Router();

const sign = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });

authRouter.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { name, email, password } = req.body;
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }
      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });
      res.status(201).json({
        token: sign(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingDone: user.onboardingDone,
        },
      });
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

authRouter.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      res.json({
        token: sign(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingDone: user.onboardingDone,
        },
      });
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);
