import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';

// Returns current user profile without password
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -emailVerifyToken -emailVerifyExpires -passwordResetToken -passwordResetExpires');
  if (!user) return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
  return successResponse(res, user);
});

// Updates only allowed profile fields
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, phone: req.body.phone, businessName: req.body.businessName },
    { new: true }
  ).select('-password -emailVerifyToken -emailVerifyExpires -passwordResetToken -passwordResetExpires');
  return successResponse(res, user, 'Profile updated');
});

// Admin gets all users with pagination and status filter
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -emailVerifyToken -emailVerifyExpires -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return successResponse(res, paginate(users, total, page, limit));
});

export const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true })
    .select('-password -emailVerifyToken -emailVerifyExpires -passwordResetToken -passwordResetExpires');
  if (!user) return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
  return successResponse(res, user, 'User approved');
});

export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true })
    .select('-password -emailVerifyToken -emailVerifyExpires -passwordResetToken -passwordResetExpires');
  if (!user) return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 404);
  return successResponse(res, user, 'User suspended');
});

// ─── ADDRESS CONTROLLERS ─────────────────────────────

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses');
  return successResponse(res, user.addresses);
});

// If new address is default, unset all others first
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (req.body.isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }

  user.addresses.push(req.body);
  await user.save();
  return successResponse(res, user.addresses, 'Address added', 201);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.id);
  if (!address) return errorResponse(res, 'NOT_FOUND', 'Address not found', 404);

  if (req.body.isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }

  Object.assign(address, req.body);
  await user.save();
  return successResponse(res, user.addresses, 'Address updated');
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.id);
  if (!address) return errorResponse(res, 'NOT_FOUND', 'Address not found', 404);

  address.deleteOne();
  await user.save();
  return successResponse(res, user.addresses, 'Address deleted');
});