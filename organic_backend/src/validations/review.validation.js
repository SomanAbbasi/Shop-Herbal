import Joi from 'joi';

export const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(5).required(),
});