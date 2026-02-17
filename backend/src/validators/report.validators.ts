import { z } from 'zod';

const emptyBody = z.object({}).passthrough();

export const reportQuerySchema = z.object({
  body: emptyBody,
  params: z.object({}).passthrough(),
  query: z.object({
    outletId: z.string().min(24).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    period: z.string().optional()
  })
});
