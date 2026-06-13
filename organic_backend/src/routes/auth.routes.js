// Wires each auth endpoint to its controller with validation middleware applied
import { Router } from 'express';
import { register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limit — 10 attempts per 15 minutes on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, please try again after 15 minutes' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login',authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
export default router;