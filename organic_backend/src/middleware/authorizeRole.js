// Checks req.user.role against allowed roles, rejects if not permitted
import { errorResponse } from '../utils/apiResponse.js';

export const authorizeRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return errorResponse(res, 'FORBIDDEN', 'Access denied', 403);
  next();
};