import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';

export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const perms = req.user?.permissions || [];
    if (!perms.includes(permission) && !perms.includes('*')) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

export function requireOutletAccess(paramName = 'outletId') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const outletId = (req.params[paramName] || req.body?.outletId) as string;
    if (!outletId) {
      next();
      return;
    }

    if (req.user?.role === 'Super Admin' || req.user?.outlets?.includes(outletId)) {
      next();
      return;
    }

    res.status(403).json({ message: 'No outlet access' });
  };
}
