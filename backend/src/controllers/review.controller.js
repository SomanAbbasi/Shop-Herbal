import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';
import User from '../models/User.js';

export const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { productId: req.params.id };

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return successResponse(res, paginate(reviews, total, page, limit));
});

// Checks if customer has a delivered order containing this product before allowing review
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const verifiedOrder = await Order.findOne({
    userId: req.user.id,
    status: 'delivered',
    'items.productId': productId,
  });

  const existingReview = await Review.findOne({ productId, userId: req.user.id });
  if (existingReview)
    return errorResponse(res, 'ALREADY_REVIEWED', 'You have already reviewed this product', 409);
  const user = await User.findById(req.user.id).select('name');
  const review = await Review.create({
    productId,
    userId: req.user.id,
    userName: user.name,
    rating,
    comment,
    isVerifiedPurchase: !!verifiedOrder,
  });

  return successResponse(res, review, 'Review submitted', 201);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return errorResponse(res, 'NOT_FOUND', 'Review not found', 404);
  return successResponse(res, null, 'Review deleted');
});