import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

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

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { parent: { select: { id: true, name: true, slug: true } } },
  });
  return successResponse(res, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, parentId } = req.body;

  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return errorResponse(res, 'SLUG_EXISTS', 'Slug already taken', 409);

  let image = '';
  if (req.file) {
    image = await uploadToCloudinary(req.file.buffer, 'categories');
  }

  const category = await prisma.category.create({
    data: { name, slug, parentId: parentId || null, image },
  });

  return successResponse(res, category, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return errorResponse(res, 'NOT_FOUND', 'Category not found', 404);

  if (req.file) {
    req.body.image = await uploadToCloudinary(req.file.buffer, 'categories');
  }

  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  });

  return successResponse(res, updated, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return errorResponse(res, 'NOT_FOUND', 'Category not found', 404);

  await prisma.category.delete({ where: { id: req.params.id } });
  return successResponse(res, null, 'Category deleted');
});