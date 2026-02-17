import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createInvoice, createPO, createPurchaseReturn, getPOs } from '../controllers/purchase.controller';
import { createInvoiceSchema, createPOSchema, purchaseReturnSchema } from '../validators/purchase.validators';

const router = Router();

router.post('/orders', authRequired, requirePermission('purchase:create'), validate(createPOSchema), createPO);
router.get('/orders', authRequired, requirePermission('purchase:read'), getPOs);
router.post('/invoices', authRequired, requirePermission('purchase:create'), validate(createInvoiceSchema), createInvoice);
router.post('/returns', authRequired, requirePermission('purchase:return'), validate(purchaseReturnSchema), createPurchaseReturn);

export default router;
