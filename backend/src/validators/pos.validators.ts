import { z } from 'zod';

const empty = z.object({}).passthrough();

const orderLine = z.object({
  productId: z.string().min(24),
  qty: z.number().positive(),
  unitPrice: z.number().nonnegative().optional(),
  mods: z.array(z.object({ name: z.string(), priceDelta: z.number() })).optional(),
  note: z.string().optional()
});

export const createOrderSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    tableId: z.string().optional(),
    orderType: z.enum(['dine-in', 'take-away', 'delivery']),
    orderLines: z.array(orderLine).min(1),
    discountItem: z.number().nonnegative().optional(),
    discountBill: z.number().nonnegative().optional(),
    tips: z.number().nonnegative().optional(),
    createdBy: z.string().min(24)
  }),
  params: empty,
  query: empty
});

export const settleSchema = z.object({
  body: z.object({
    orderId: z.string().min(24),
    outletId: z.string().min(24).optional(),
    userId: z.string().min(24),
    valuationMethod: z.enum(['FIFO', 'LIFO']).optional(),
    payments: z.array(z.object({ method: z.string(), amount: z.number().positive(), ref: z.string().optional() })).min(1)
  }),
  params: empty,
  query: empty
});

export const recallSchema = z.object({
  body: z.object({ orderId: z.string().min(24) }),
  params: empty,
  query: empty
});

export const returnSchema = z.object({
  body: z.object({
    orderId: z.string().min(24),
    outletId: z.string().min(24).optional(),
    reason: z.string().min(3),
    userId: z.string().min(24)
  }),
  params: empty,
  query: empty
});

export const shiftReportSchema = z.object({
  body: empty,
  params: z.object({ id: z.string().min(24) }),
  query: empty
});
