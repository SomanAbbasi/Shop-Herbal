import Joi from 'joi';

export const placeOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  paymentMethod: Joi.string().valid('stripe', 'bank_transfer', 'net30', 'cash_on_delivery').required(),
  notes: Joi.string().optional().allow(''),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required(),
});