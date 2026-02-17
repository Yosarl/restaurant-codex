import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  ageing,
  openingStock,
  receiveInventory,
  stockAdjustment,
  stockTransfer,
  valuation
} from '../controllers/inventory.controller';
import {
  adjustmentSchema,
  openingStockSchema,
  receiveSchema,
  transferSchema
} from '../validators/inventory.validators';

const router = Router();

router.post('/opening-stock', authRequired, requirePermission('inventory:write'), validate(openingStockSchema), openingStock);
router.post('/receive', authRequired, requirePermission('inventory:write'), validate(receiveSchema), receiveInventory);
router.post('/adjustment', authRequired, requirePermission('inventory:adjust'), validate(adjustmentSchema), stockAdjustment);
router.post('/transfer', authRequired, requirePermission('inventory:transfer'), validate(transferSchema), stockTransfer);
router.get('/valuation', authRequired, requirePermission('inventory:read'), valuation);
router.get('/ageing', authRequired, requirePermission('inventory:read'), ageing);

export default router;
