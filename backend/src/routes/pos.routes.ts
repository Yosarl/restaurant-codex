import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  createPosOrder,
  holdAlias,
  holdPosOrder,
  recallPosOrder,
  returnPosOrder,
  settleAlias,
  settlePosOrder,
  shiftZReport
} from '../controllers/pos.controller';
import {
  createOrderSchema,
  recallSchema,
  returnSchema,
  settleSchema,
  shiftReportSchema
} from '../validators/pos.validators';

const router = Router();

router.post('/create-order', authRequired, requirePermission('pos:create'), validate(createOrderSchema), createPosOrder);
router.post('/hold-order', authRequired, requirePermission('pos:hold'), validate(createOrderSchema), holdPosOrder);
router.post('/recall-order', authRequired, requirePermission('pos:hold'), validate(recallSchema), recallPosOrder);
router.post('/settle', authRequired, requirePermission('pos:settle'), validate(settleSchema), settlePosOrder);
router.post('/return', authRequired, requirePermission('pos:return'), validate(returnSchema), returnPosOrder);
router.post('/hold', authRequired, requirePermission('pos:hold'), validate(recallSchema), holdAlias);
router.post('/settle-order', authRequired, requirePermission('pos:settle'), validate(settleSchema), settleAlias);
router.get('/shift/:id/report', authRequired, requirePermission('reports:read'), validate(shiftReportSchema), shiftZReport);

export default router;
