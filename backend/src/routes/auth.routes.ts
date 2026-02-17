import { Router } from 'express';
import { loginHandler, logoutHandler, refreshHandler, registerHandler } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from '../validators/auth.validators';

const router = Router();

router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', validate(refreshSchema), refreshHandler);
router.post('/logout', validate(logoutSchema), logoutHandler);
router.post('/register', authRequired, requirePermission('users:create'), validate(registerSchema), registerHandler);

export default router;
