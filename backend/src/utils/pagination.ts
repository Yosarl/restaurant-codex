import { Request } from 'express';

export function getPagination(req: Request): { page: number; limit: number; skip: number } {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  return { page, limit, skip: (page - 1) * limit };
}
