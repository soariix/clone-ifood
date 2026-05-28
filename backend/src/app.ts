import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { authRouter } from './routes/auth.routes';
import { categoryRouter } from './routes/category.routes';
import { orderRouter } from './routes/order.routes';
import { restaurantRouter } from './routes/restaurant.routes';

const app = express();

app.set('trust proxy', 1);

// ─── Segurança ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ─── Parsing ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Rotas ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/restaurants', restaurantRouter);
app.use('/orders', orderRouter);
app.use('/categories', categoryRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

export default app;
