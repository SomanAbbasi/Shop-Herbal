import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  slug: Joi.string().min(2).required(),
  description: Joi.string().min(10).required(),
  categoryId: Joi.string().required(),
  sku: Joi.string().required(),
  unit: Joi.string().required(),
  pricePerUnit: Joi.number().positive().required(),
  minimumOrderQty: Joi.number().positive().required(),
  stock: Joi.number().min(0).required(),
  bulkPricingTiers: Joi.string().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2),
  slug: Joi.string().min(2),
  description: Joi.string().min(10),
  categoryId: Joi.string(),
  sku: Joi.string(),
  unit: Joi.string(),
  pricePerUnit: Joi.number().positive(),
  minimumOrderQty: Joi.number().positive(),
  stock: Joi.number().min(0),
  bulkPricingTiers: Joi.string().optional(),
  isActive: Joi.boolean(),
});