import { z } from 'zod';

const params = z.object({}).passthrough();
const query = z.object({}).passthrough();

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  params,
  query
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  }),
  params,
  query
});

export const logoutSchema = refreshSchema;

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(10).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    roleId: z.string().min(24),
    outlets: z.array(z.string().min(24)).default([])
  }),
  params,
  query
});
