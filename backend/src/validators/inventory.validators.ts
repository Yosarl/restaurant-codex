import { z } from 'zod';

const empty = z.object({}).passthrough();

export const openingStockSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    userId: z.string().min(24).optional(),
    referenceId: z.string().optional(),
    lines: z.array(
      z.object({
        productId: z.string().min(24),
        qty: z.number().positive(),
        costPrice: z.number().nonnegative(),
        batchNo: z.string().min(1),
        expiryDate: z.string().datetime().optional()
      })
    )
  }),
  params: empty,
  query: empty
});

export const receiveSchema = openingStockSchema;

export const adjustmentSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    productId: z.string().min(24),
    qty: z.number().refine((v) => v !== 0),
    reason: z.string().min(3),
    userId: z.string().min(24).optional(),
    valuationMethod: z.enum(['FIFO', 'LIFO']).optional(),
    referenceId: z.string().optional()
  }),
  params: empty,
  query: empty
});

export const transferSchema = z.object({
  body: z.object({
    fromOutletId: z.string().min(24),
    toOutletId: z.string().min(24),
    productId: z.string().min(24),
    qty: z.number().positive(),
    userId: z.string().min(24).optional()
  }),
  params: empty,
  query: empty
});
