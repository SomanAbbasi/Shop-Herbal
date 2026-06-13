import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';

const userSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  businessName: true, status: true, emailVerified: true,
  createdAt: true, updatedAt: true,
  addresses: true,
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: userSelect });
  if (!user) return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
  return successResponse(res, user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name: req.body.name, phone: req.body.phone, businessName: req.body.businessName },
    select: userSelect,
  });
  return successResponse(res, user, 'Profile updated');
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const where = {};
  if (status) where.status = status;

  const total = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * Number(limit),
    take: Number(limit),
  });

  return successResponse(res, paginate(users, total, page, limit));
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: 'active' },
    select: userSelect,
  }).catch(() => null);

  if (!user) return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
  return successResponse(res, user, 'User activated');
});

export const suspendUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: 'suspended' },
    select: userSelect,
  }).catch(() => null);

  if (!user) return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
  return successResponse(res, user, 'User suspended');
});

// ─── ADDRESS CONTROLLERS ─────────────────────────────

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  return successResponse(res, addresses);
});

export const addAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }

  await prisma.address.create({ data: { ...req.body, userId: req.user.id } });

  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  return successResponse(res, addresses, 'Address added', 201);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!address) return errorResponse(res, 'NOT_FOUND', 'Address not found', 404);

  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }

  await prisma.address.update({ where: { id: req.params.id }, data: req.body });

  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  return successResponse(res, addresses, 'Address updated');
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!address) return errorResponse(res, 'NOT_FOUND', 'Address not found', 404);

  await prisma.address.delete({ where: { id: req.params.id } });

  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  return successResponse(res, addresses, 'Address deleted');
});