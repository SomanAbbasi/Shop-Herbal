import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2),
  phone: Joi.string().min(7),
  businessName: Joi.string().min(2),
});

export const addressSchema = Joi.object({
  label: Joi.string().optional(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required(),
  isDefault: Joi.boolean().optional(),
});