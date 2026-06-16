import express from 'express';
import { initiateJazzCashPayment, handleJazzCashCallback } from '../controllers/payments/jazzcash/jazzcashController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @route   POST /api/v1/payments/jazzcash/initiate
 * @desc    Initiate JazzCash Mobile Wallet payment
 * @access  Private
 */
router.post('/jazzcash/initiate', authenticate, initiateJazzCashPayment);

/**
 * @route   POST /api/v1/payments/jazzcash/callback
 * @desc    JazzCash callback notification handler
 * @access  Public (Verification handled via Secure Hash)
 */
router.post('/jazzcash/callback', handleJazzCashCallback);

export default router;
