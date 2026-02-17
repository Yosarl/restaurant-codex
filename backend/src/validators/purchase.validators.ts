import { z } from 'zod';

const empty = z.object({}).passthrough();

const poLine = z.object({
  productId: z.string().min(24),
  qty: z.number().positive(),
  unitCost: z.number().nonnegative()
});

export const createPOSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    supplierId: z.string().min(24),
    expectedDate: z.string().datetime().optional(),
    lines: z.array(poLine).min(1),
    notes: z.string().optional(),
    createdBy: z.string().min(24)
  }),
  params: empty,
  query: empty
});

const invoiceLine = poLine.extend({
  taxRate: z.number().nonnegative(),
  batchNo: z.string().min(1),
  expiryDate: z.string().datetime().optional()
});

export const createInvoiceSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    supplierId: z.string().min(24),
    poId: z.string().min(24).optional(),
    lines: z.array(invoiceLine).min(1),
    paidAmount: z.number().nonnegative().optional(),
    createdBy: z.string().min(24)
  }),
  params: empty,
  query: empty
});

export const purchaseReturnSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    invoiceId: z.string().min(24),
    lines: z.array(z.object({ productId: z.string().min(24), qty: z.number().positive() })).min(1),
    reason: z.string().min(3),
    createdBy: z.string().min(24)
  }),
  params: empty,
  query: empty
});
