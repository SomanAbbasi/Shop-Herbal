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
  maxAge: 30 * 24 * 60 * 60 * 1000,
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B8524; margin: 0; font-size: 28px;">Organic Wholesale</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">Pure. Fresh. Local.</p>
          </div>
          <h2 style="color: #111; font-size: 20px; margin-bottom: 20px;">Welcome to the farm, ${name}!</h2>
          <p>Thank you for choosing Organic Wholesale. We're excited to help you source the finest local produce for your business.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verifyUrl}" style="background-color: #3B8524; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(59, 133, 36, 0.2);">Verify My Account</a>
          </div>
          <p style="font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 13px; color: #3B8524; word-break: break-all;">${verifyUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            This link will expire in 24 hours.<br>
            If you did not sign up for this account, please ignore this email.
          </p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Verification email failed:", emailErr);
    await prisma.user.delete({ where: { id: user.id } });
    return errorResponse(res, 'EMAIL_SEND_FAILED', 'Could not send verification email. Please check your email address.', 500);
  }

  return successResponse(res, null, 'Registration successful. Please check your email (and spam folder) to verify your account.', 201);
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
    subject: 'Reset your password — Organic Wholesale',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; color: #333; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B8524; margin: 0; font-size: 28px;">Organic Wholesale</h1>
        </div>
        <h2 style="color: #111; font-size: 20px; margin-bottom: 20px;">Password Reset Request</h2>
        <p>We received a request to reset the password for your Organic Wholesale account.</p>
        <p>To choose a new password, click the button below:</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="background-color: #3B8524; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(59, 133, 36, 0.2);">Reset My Password</a>
        </div>
        <p style="font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; color: #3B8524; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          This link will expire in 1 hour.<br>
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  return successResponse(res, null, 'If an account exists with that email, a reset link has been sent.');
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