import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { printKot, printQueue, printReceipt } from '../controllers/print.controller';

const router = Router();

router.get('/queue', authRequired, requirePermission('prints:read'), printQueue);
router.post('/kot', authRequired, requirePermission('prints:create'), printKot);
router.get('/receipt/:orderId', authRequired, requirePermission('prints:create'), printReceipt);

export default router;
