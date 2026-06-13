import { Router } from 'express';
import { placeOrder, listOrders, getOrder, updateOrderStatus, cancelOrder } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

import { validateRequest } from '../middleware/validateRequest.js';
import { placeOrderSchema, updateOrderStatusSchema } from '../validations/order.validation.js'

const router = Router();

router.use(authenticate);
router.post('/', placeOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorizeRole('admin'), updateOrderStatus);
router.post('/', validateRequest(placeOrderSchema), placeOrder);
router.patch('/:id/status', authorizeRole('admin'), validateRequest(updateOrderStatusSchema), updateOrderStatus);


export default router;