import { z } from 'zod';

const empty = z.object({}).passthrough();

export const journalSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    referenceType: z.string().min(2),
    referenceId: z.string().optional(),
    description: z.string().min(3),
    date: z.string().datetime().optional(),
    createdBy: z.string().min(24).optional(),
    lines: z.array(
      z.object({
        accountId: z.string().min(24),
        debit: z.number().nonnegative(),
        credit: z.number().nonnegative(),
        note: z.string().optional()
      })
    )
  }),
  params: empty,
  query: empty
});

export const reconcileSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    accountId: z.string().min(24),
    toDate: z.string().datetime(),
    statementBalance: z.number()
  }),
  params: empty,
  query: empty
});

export const ledgerSchema = z.object({
  body: empty,
  params: z.object({ accountId: z.string().min(24) }),
  query: z.object({ outletId: z.string().min(24) })
});
