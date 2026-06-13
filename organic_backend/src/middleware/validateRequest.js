// Runs a Joi schema against req.body and returns 400 with details if invalid
import { errorResponse } from '../utils/apiResponse.js';

export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(d => d.message).join(', ');
    return errorResponse(res, 'VALIDATION_ERROR', message, 400);
  }
  next();
};