import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import deliveryRoutes from './routes/delivery.routes';
import riderRoutes from './routes/rider.routes';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.nodeEnv === 'production' ? process.env['FRONTEND_URL'] : '*',
    credentials: true,
  }),
);

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests.' } },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many login attempts. Please wait a minute.' } },
});

app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv, ts: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/riders', riderRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Not found.' } });
});

app.use(errorHandler);

export default app;
