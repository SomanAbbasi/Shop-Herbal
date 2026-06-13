// Public GET routes, admin-only write routes with multi-image upload support
import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, activateProduct } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { upload } from '../middleware/upload.js';
import { createProductSchema, updateProductSchema } from '../validations/product.validation.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, authorizeRole('admin'), upload.array('images', 5), validateRequest(createProductSchema), createProduct);
router.put('/:id', authenticate, authorizeRole('admin'), upload.array('images', 5), validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorizeRole('admin'), deleteProduct);
router.patch('/:id/activate', authenticate, authorizeRole('admin'), activateProduct);

export default router;