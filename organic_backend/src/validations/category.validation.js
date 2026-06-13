import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  slug: Joi.string().min(2).required(),
  parentId: Joi.string().optional().allow(null, ''),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2),
  slug: Joi.string().min(2),
  parentId: Joi.string().optional().allow(null, ''),
});