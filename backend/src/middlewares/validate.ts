import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.flatten()
      });
      return;
    }

    req.body = parsed.data.body;
    req.params = parsed.data.params;
    req.query = parsed.data.query;
    next();
  };
}
