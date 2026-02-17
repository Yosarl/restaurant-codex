import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  createProduct,
  getProduct,
  getProductStock,
  listProducts,
  removeProduct,
  updateProduct
} from '../controllers/product.controller';
import { createProductSchema, getByIdSchema, updateProductSchema } from '../validators/product.validators';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authRequired, requirePermission('products:read'), listProducts);
router.post('/', authRequired, requirePermission('products:create'), upload.none(), validate(createProductSchema), createProduct);
router.get('/:id', authRequired, requirePermission('products:read'), validate(getByIdSchema), getProduct);
router.patch('/:id', authRequired, requirePermission('products:update'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authRequired, requirePermission('products:delete'), validate(getByIdSchema), removeProduct);
router.get('/:id/stock', authRequired, requirePermission('inventory:read'), validate(getByIdSchema), getProductStock);

export default router;
