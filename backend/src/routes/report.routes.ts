import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { pnl, sales, stockValuation, vat } from '../controllers/report.controller';
import { reportQuerySchema } from '../validators/report.validators';

const router = Router();

router.get('/sales', authRequired, requirePermission('reports:read'), validate(reportQuerySchema), sales);
router.get('/stock/valuation', authRequired, requirePermission('reports:read'), validate(reportQuerySchema), stockValuation);
router.get('/pnl', authRequired, requirePermission('reports:read'), validate(reportQuerySchema), pnl);
router.get('/vat', authRequired, requirePermission('reports:read'), validate(reportQuerySchema), vat);

export default router;
