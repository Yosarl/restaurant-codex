import { z } from 'zod';

const anyParams = z.object({}).passthrough();
const anyQuery = z.object({}).passthrough();

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(10),
    roleId: z.string().min(24),
    outlets: z.array(z.string().min(24)).default([]),
    isActive: z.boolean().default(true)
  }),
  params: anyParams,
  query: anyQuery
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).optional(),
      roleId: z.string().min(24).optional(),
      outlets: z.array(z.string().min(24)).optional(),
      isActive: z.boolean().optional()
    })
    .refine((data) => Object.keys(data).length > 0),
  params: z.object({ id: z.string().min(24) }),
  query: anyQuery
});
