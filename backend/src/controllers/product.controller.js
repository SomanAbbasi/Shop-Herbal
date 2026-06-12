import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';

// Reusable Cloudinary upload from memory buffer
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Returns paginated products with filtering by category, price, search, and featured
export const listProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, sortBy, featured } = req.query;

  const query = { isActive: true };
  if (search) query.name = { $regex: search, $options: 'i' };
  if (categoryId) query.categoryId = categoryId;
  if (minPrice || maxPrice) {
    query.pricePerUnit = {};
    if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
    if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
  }

  const sortOptions = {
    price_asc: { pricePerUnit: 1 },
    price_desc: { pricePerUnit: -1 },
    newest: { createdAt: -1 },
  };
  const sort = sortOptions[sortBy] || { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('categoryId', 'name slug')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return successResponse(res, paginate(products, total, page, limit));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId', 'name slug');
  if (!product || !product.isActive)
    return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
  return successResponse(res, product);
});

// Handles multiple image uploads and parses bulkPricingTiers from JSON string
export const createProduct = asyncHandler(async (req, res) => {
  const { bulkPricingTiers, ...rest } = req.body;

  const imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'products');
      imageUrls.push(url);
    }
  }

// Check if inactive product with same slug exists and reactivate it
  const existing = await Product.findOne({ slug: rest.slug });
  if (existing && !existing.isActive) {
    const reactivated = await Product.findByIdAndUpdate(
      existing._id,
      {
        ...rest,
        images: imageUrls.length > 0 ? imageUrls : existing.images,
        bulkPricingTiers: bulkPricingTiers ? JSON.parse(bulkPricingTiers) : existing.bulkPricingTiers,
        isActive: true,
      },
      { new: true }
    );
    return successResponse(res, reactivated, 'Product reactivated with new values', 200);
  }

  const product = await Product.create({
    ...rest,
    images: imageUrls,
    bulkPricingTiers: bulkPricingTiers ? JSON.parse(bulkPricingTiers) : [],
  });

  return successResponse(res, product, 'Product created', 201);
});
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  if (req.files && req.files.length > 0) {
    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'products');
      imageUrls.push(url);
    }
    req.body.images = imageUrls;
  }

  if (req.body.bulkPricingTiers) {
    req.body.bulkPricingTiers = JSON.parse(req.body.bulkPricingTiers);
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return successResponse(res, updated, 'Product updated');
});

// Soft delete — sets isActive to false instead of removing from DB
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  return successResponse(res, null, 'Product deleted');
});