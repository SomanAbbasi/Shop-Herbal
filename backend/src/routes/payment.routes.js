import express from 'express';
import { initiateJazzCashPayment } from '../controllers/payments/jazzcash/jazzcashController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// All payment routes are protected
router.use(authenticate);

/**
 * @route   POST /api/v1/payments/jazzcash/initiate
 * @desc    Initiate JazzCash Mobile Wallet payment
 * @access  Private
 */
router.post('/jazzcash/initiate', initiateJazzCashPayment);

export default router;
