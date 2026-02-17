import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { listRoles } from '../controllers/user.controller';

const router = Router();

router.get('/', authRequired, requirePermission('roles:read'), listRoles);

export default router;
