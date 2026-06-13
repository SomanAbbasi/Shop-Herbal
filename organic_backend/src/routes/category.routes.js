// Public GET, admin-only POST/PUT/DELETE with optional image upload
import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { upload } from '../middleware/upload.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, authorizeRole('admin'), upload.single('image'), validateRequest(createCategorySchema), createCategory);
router.put('/:id', authenticate, authorizeRole('admin'), upload.single('image'), validateRequest(updateCategorySchema), updateCategory);
router.delete('/:id', authenticate, authorizeRole('admin'), deleteCategory);

export default router;