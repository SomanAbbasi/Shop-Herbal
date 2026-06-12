import crypto from 'crypto';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, blacklistToken } from '../services/token.service.js';
import { sendEmail } from '../services/email.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Creates user in pending state and sends verification email with a hashed token
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, businessName } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return errorResponse(res, 'EMAIL_ALREADY_EXISTS', 'Email already registered', 409);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.create({
    name, email, password, phone, businessName,
    emailVerifyToken: hashedToken,
    emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. Expires in 24 hours.</p>`,
    });
  } catch (emailErr) {
    await User.findByIdAndDelete(user._id);
    return errorResponse(res, 'EMAIL_SEND_FAILED', 'Could not send verification email', 500);
  }

  return successResponse(res, null, 'Registration successful. Please verify your email.', 201);
});

// Hashes the URL token and matches against DB, then marks email as verified
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerifyToken: hashed,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired token', 400);

  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  return successResponse(res, null, 'Email verified. Await admin approval.');
});

// Validates credentials and account status, issues access + refresh tokens
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);

  if (!user.emailVerified)
    return errorResponse(res, 'ACCOUNT_NOT_ACTIVE', 'Please verify your email first', 403);

  if (user.status !== 'active')
    return errorResponse(res, 'ACCOUNT_NOT_ACTIVE', `Account is ${user.status}`, 403);

  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return successResponse(res, {
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  }, 'Login successful');
});

// Reads httpOnly cookie, verifies refresh token, issues new access token
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return errorResponse(res, 'UNAUTHORIZED', 'No refresh token', 401);

  const decoded = verifyRefreshToken(token);
  const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

  return successResponse(res, { accessToken }, 'Token refreshed');
});

// Blacklists the access token JTI in Redis so it cannot be reused
export const logout = asyncHandler(async (req, res) => {
  const { jti, exp } = req.user;
  if (jti) {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await blacklistToken(jti, ttl);
  }
  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out');
});

// Generates a reset token, stores hashed version in DB, emails raw version
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return successResponse(res, null, 'Reset link sent if email exists');

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p>`,
  });

  return successResponse(res, null, 'Reset link sent if email exists');
});

// Validates reset token, updates password, clears token fields
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired token', 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return successResponse(res, null, 'Password updated successfully');
});