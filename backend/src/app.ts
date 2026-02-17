import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { apiRateLimit } from './middlewares/rateLimit';
import { errorHandler } from './middlewares/error';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import outletRoutes from './routes/outlet.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import purchaseRoutes from './routes/purchase.routes';
import posRoutes from './routes/pos.routes';
import accountingRoutes from './routes/accounting.routes';
import reportRoutes from './routes/report.routes';
import webhookRoutes from './routes/webhook.routes';
import printRoutes from './routes/print.routes';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(apiRateLimit);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.get('/api/security/csrf-token', (_req: Request, res: Response) => {
  res.json({ csrfToken: `csrf-${Date.now()}` });
});

const openApiPath = path.join(process.cwd(), '..', 'docs', 'openapi.json');
if (fs.existsSync(openApiPath)) {
  const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/print', printRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

export default app;
