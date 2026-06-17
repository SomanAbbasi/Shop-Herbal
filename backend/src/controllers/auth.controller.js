import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, blacklistToken } from '../services/token.service.js';
import { sendEmail } from '../services/email.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import bcrypt from 'bcryptjs';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, businessName } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return errorResponse(res, 'EMAIL_ALREADY_EXISTS', 'Email already registered', 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await prisma.user.create({
    data: {
      name, email, phone, businessName,
      password: hashedPassword,
      emailVerifyToken: hashedToken,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Verify your email — Organic Wholesale',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3B8524; text-align: center;">Welcome to Organic Wholesale!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with Organic Wholesale. To activate your account and start shopping, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #3B8524; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p>This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">&copy; 2026 Organic Wholesale. All rights reserved.</p>
        </div>
      `,
    });
  } catch (emailErr) {
    await prisma.user.delete({ where: { id: user.id } });
    return errorResponse(res, 'EMAIL_SEND_FAILED', 'Could not send verification email', 500);
  }

  return successResponse(res, null, 'Registration successful. Please verify your email to activate your account.', 201);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: hashed,
      emailVerifyExpires: { gt: new Date() },
    },
  });

  if (!user) return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired token', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
  });

  return successResponse(res, null, 'Email verified successfully. You can now login.');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);

  if (!user.emailVerified)
    return errorResponse(res, 'ACCOUNT_NOT_ACTIVE', 'Please verify your email first', 403);

  if (user.status !== 'active')
    return errorResponse(res, 'ACCOUNT_NOT_ACTIVE', `Account is ${user.status}`, 403);

  const payload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return successResponse(res, {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }, 'Login successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return errorResponse(res, 'UNAUTHORIZED', 'No refresh token', 401);

  const decoded = verifyRefreshToken(token);
  const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

  return successResponse(res, { accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  const { jti, exp } = req.user;
  if (jti) {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await blacklistToken(jti, ttl);
  }
  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return successResponse(res, null, 'Reset link sent if email exists');

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p>`,
  });

  return successResponse(res, null, 'Reset link sent if email exists');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashed,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired token', 400);

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return successResponse(res, null, 'Password updated successfully');
});