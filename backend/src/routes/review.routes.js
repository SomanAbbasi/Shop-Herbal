import { Router } from 'express';
import { getReviews, createReview, deleteReview } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createReviewSchema } from '../validations/review.validation.js';

const router = Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', authenticate, validateRequest(createReviewSchema), createReview);
router.delete('/:id', authenticate, authorizeRole('admin'), deleteReview);

export default router;  