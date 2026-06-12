import { Router } from 'express';
import { getDashboard, getSalesReport, getInventoryReport } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

router.use(authenticate, authorizeRole('admin'));
router.get('/dashboard', getDashboard);
router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);

export default router;