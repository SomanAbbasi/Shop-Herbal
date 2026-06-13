import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';

export const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const where = { productId: req.params.id };

  const total = await prisma.review.count({ where });
  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * Number(limit),
    take: Number(limit),
  });

  return successResponse(res, paginate(reviews, total, page, limit));
});

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } });

  const verifiedOrder = await prisma.order.findFirst({
    where: {
      userId: req.user.id,
      status: 'delivered',
      items: { some: { productId } },
    },
  });

  const existingReview = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId: req.user.id } },
  });
  if (existingReview)
    return errorResponse(res, 'ALREADY_REVIEWED', 'You have already reviewed this product', 409);

  const review = await prisma.review.create({
    data: {
      productId,
      userId: req.user.id,
      userName: user.name,
      rating,
      comment,
      isVerifiedPurchase: !!verifiedOrder,
    },
  });

  return successResponse(res, review, 'Review submitted', 201);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.delete({ where: { id: req.params.id } }).catch(() => null);
  if (!review) return errorResponse(res, 'NOT_FOUND', 'Review not found', 404);
  return successResponse(res, null, 'Review deleted');
});