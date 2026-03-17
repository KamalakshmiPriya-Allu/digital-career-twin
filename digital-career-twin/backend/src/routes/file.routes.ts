import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

export const fileRouter = Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /api/files/upload — Upload a file (base64)
fileRouter.post('/upload', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename, fileData, category } = req.body as {
      filename: string;
      fileData: string;
      category?: string;
    };

    if (!filename || !fileData) {
      res.status(400).json({ error: 'filename and fileData (base64) are required' });
      return;
    }

    const validCategories = ['certificate', 'pdf', 'other'];
    const fileCategory = validCategories.includes(category ?? '') ? (category as string) : 'other';

    const ext = path.extname(filename).toLowerCase();
    const fileType = ext.replace('.', '') || 'unknown';

    const uniqueName = `${req.user!.userId}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    const buffer = Buffer.from(fileData, 'base64');
    fs.writeFileSync(filePath, buffer);

    const file = await prisma.userFile.create({
      data: {
        userId: req.user!.userId,
        filename,
        fileType,
        fileUrl: `/uploads/${uniqueName}`,
        category: fileCategory,
      },
    });

    res.status(201).json(file);
  } catch (e) {
    console.error('File upload error:', e);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// GET /api/files — List all files for current user
fileRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = await prisma.userFile.findMany({
      where: { userId: req.user!.userId },
      orderBy: { uploadedAt: 'desc' },
    });
    res.json({ files });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/files/:id — Delete a file
fileRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const fileId = String(req.params.id);
  const userId = req.user!.userId;
  try {
    const file = await prisma.userFile.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const diskPath = path.join(__dirname, '../..', file.fileUrl);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    await prisma.userFile.delete({ where: { id: fileId } });

    res.json({ deleted: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});
