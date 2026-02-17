import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('300'),
  BCRYPT_ROUNDS: z.string().default('12'),
  VAT_DEFAULT_RATE: z.string().default('0.12'),
  ARCHIVE_ORDER_DAYS: z.string().default('365'),
  LOW_STOCK_CRON: z.string().default('*/30 * * * *'),
  REPORT_CRON: z.string().default('0 22 * * *'),
  ENABLE_REDIS: z.string().default('false')
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  PORT: Number(parsed.PORT),
  RATE_LIMIT_WINDOW_MS: Number(parsed.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_MAX: Number(parsed.RATE_LIMIT_MAX),
  BCRYPT_ROUNDS: Number(parsed.BCRYPT_ROUNDS),
  VAT_DEFAULT_RATE: Number(parsed.VAT_DEFAULT_RATE),
  ARCHIVE_ORDER_DAYS: Number(parsed.ARCHIVE_ORDER_DAYS),
  ENABLE_REDIS: parsed.ENABLE_REDIS === 'true'
};
