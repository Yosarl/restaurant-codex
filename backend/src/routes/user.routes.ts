import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import { createUser, listUsers, updateUser } from '../controllers/user.controller';
import { createUserSchema, updateUserSchema } from '../validators/user.validators';

const router = Router();

router.get('/', authRequired, requirePermission('users:read'), listUsers);
router.post('/', authRequired, requirePermission('users:create'), validate(createUserSchema), createUser);
router.patch('/:id', authRequired, requirePermission('users:update'), validate(updateUserSchema), updateUser);

export default router;
