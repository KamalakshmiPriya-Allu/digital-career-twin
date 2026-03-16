import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
