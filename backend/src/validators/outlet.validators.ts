import { z } from 'zod';

const anyQuery = z.object({}).passthrough();

export const createOutletSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    timezone: z.string().default('UTC'),
    printers: z
      .array(
        z.object({
          name: z.string(),
          type: z.enum(['escpos', 'pdf', 'webusb']),
          target: z.string(),
          isKitchen: z.boolean().default(false)
        })
      )
      .default([])
  }),
  params: z.object({}).passthrough(),
  query: anyQuery
});

export const updateOutletSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).optional(),
      address: z.string().min(5).optional(),
      timezone: z.string().optional(),
      printers: z
        .array(
          z.object({
            name: z.string(),
            type: z.enum(['escpos', 'pdf', 'webusb']),
            target: z.string(),
            isKitchen: z.boolean().default(false)
          })
        )
        .optional()
    })
    .refine((data) => Object.keys(data).length > 0),
  params: z.object({ id: z.string().min(24) }),
  query: anyQuery
});
