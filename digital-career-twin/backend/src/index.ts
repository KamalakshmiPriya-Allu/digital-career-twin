import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { assessmentRouter } from './routes/assessment.routes';
import { aiRouter } from './routes/ai.routes';
import { calendarRouter } from './routes/calendar.routes';
import { fileRouter } from './routes/file.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/files', fileRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`DCT Backend running on port ${PORT}`));

export default app;
