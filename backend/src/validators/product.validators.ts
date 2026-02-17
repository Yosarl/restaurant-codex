import { z } from 'zod';

const anyQuery = z.object({}).passthrough();

const recipeLine = z.object({ ingredientId: z.string().min(24), qty: z.number().positive() });
const modifierOption = z.object({
  name: z.string(),
  priceDelta: z.number().default(0),
  inventoryProductId: z.string().min(24).optional(),
  qty: z.number().nonnegative().optional()
});

export const createProductSchema = z.object({
  body: z.object({
    outletId: z.string().min(24),
    sku: z.string().min(2),
    name: z.string().min(2),
    description: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string().min(24),
    costPrice: z.number().nonnegative(),
    sellPrice: z.number().nonnegative(),
    taxRate: z.number().nonnegative(),
    unit: z.string().min(1),
    yieldPortions: z.number().positive().optional(),
    batchTracking: z.boolean().default(false),
    expiryTracking: z.boolean().default(false),
    images: z.array(z.string()).default([]),
    isRecipe: z.boolean().default(false),
    recipe: z.array(recipeLine).default([]),
    variants: z.array(z.object({ name: z.string(), priceDelta: z.number(), sku: z.string().optional() })).default([]),
    modifierGroups: z
      .array(z.object({ name: z.string(), required: z.boolean(), options: z.array(modifierOption) }))
      .default([]),
    reorderLevel: z.number().nonnegative().default(0)
  }),
  params: z.object({}).passthrough(),
  query: anyQuery
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial().refine((data) => Object.keys(data).length > 0),
  params: z.object({ id: z.string().min(24) }),
  query: anyQuery
});

export const getByIdSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(24) }),
  query: anyQuery
});
