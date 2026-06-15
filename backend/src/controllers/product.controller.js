import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';

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

export const listProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, sortBy, featured } = req.query;

  const where = { isActive: true };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;
  if (minPrice || maxPrice) {
    where.pricePerUnit = {};
    if (minPrice) where.pricePerUnit.gte = Number(minPrice);
    if (maxPrice) where.pricePerUnit.lte = Number(maxPrice);
  }

  const orderByOptions = {
    price_asc: { pricePerUnit: 'asc' },
    price_desc: { pricePerUnit: 'desc' },
    newest: { createdAt: 'desc' },
  };
  const orderBy = orderByOptions[sortBy] || { createdAt: 'desc' };

  const total = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      bulkPricingTiers: true,
    },
    orderBy,
    skip: (page - 1) * limit,
    take: Number(limit),
  });

  return successResponse(res, paginate(products, total, page, limit));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      bulkPricingTiers: true,
    },
  });

  if (!product || !product.isActive)
    return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  return successResponse(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { bulkPricingTiers, ...rest } = req.body;
  console.log(req.body);
  const imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'products');
      imageUrls.push(url);
    }
  }

  const tiers = bulkPricingTiers ? JSON.parse(bulkPricingTiers) : [];

  const existing = await prisma.product.findUnique({ where: { slug: rest.slug } });

  if (existing && !existing.isActive) {
    const reactivated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...rest,
        pricePerUnit: Number(rest.pricePerUnit),
        minimumOrderQty: Number(rest.minimumOrderQty),
        stock: Number(rest.stock),
        images: imageUrls.length > 0 ? imageUrls : existing.images,
        isActive: true,
        bulkPricingTiers: {
          deleteMany: {},
          create: tiers.map(t => ({ minQty: t.minQty, pricePerUnit: t.pricePerUnit })),
        },
      },
      include: { bulkPricingTiers: true },
    });
    return successResponse(res, reactivated, 'Product reactivated with new values', 200);
  }

  const product = await prisma.product.create({
    data: {
      ...rest,
      pricePerUnit: Number(rest.pricePerUnit),
      minimumOrderQty: Number(rest.minimumOrderQty),
      stock: Number(rest.stock),
      images: imageUrls,
      bulkPricingTiers: {
        create: tiers.map(t => ({ minQty: t.minQty, pricePerUnit: t.pricePerUnit })),
      },
    },
    include: { bulkPricingTiers: true },
  });

  return successResponse(res, product, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  const data = { ...req.body };

  if (req.files && req.files.length > 0) {
    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer, 'products');
      imageUrls.push(url);
    }
    data.images = imageUrls;
  }

  if (data.pricePerUnit) data.pricePerUnit = Number(data.pricePerUnit);
  if (data.minimumOrderQty) data.minimumOrderQty = Number(data.minimumOrderQty);
  if (data.stock) data.stock = Number(data.stock);

  if (data.bulkPricingTiers) {
    const tiers = JSON.parse(data.bulkPricingTiers);
    data.bulkPricingTiers = {
      deleteMany: {},
      create: tiers.map(t => ({ minQty: t.minQty, pricePerUnit: t.pricePerUnit })),
    };
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data,
    include: { bulkPricingTiers: true },
  });

  return successResponse(res, updated, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  return successResponse(res, null, 'Product deleted');
});

export const activateProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: true },
  });
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
  return successResponse(res, product, 'Product activated');
});