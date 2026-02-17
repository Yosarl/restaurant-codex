import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createOutlet, listOutlets, updateOutlet } from '../controllers/outlet.controller';
import { createOutletSchema, updateOutletSchema } from '../validators/outlet.validators';

const router = Router();

router.get('/', authRequired, requirePermission('outlets:read'), listOutlets);
router.post('/', authRequired, requirePermission('outlets:create'), validate(createOutletSchema), createOutlet);
router.patch('/:id', authRequired, requirePermission('outlets:update'), validate(updateOutletSchema), updateOutlet);

export default router;
