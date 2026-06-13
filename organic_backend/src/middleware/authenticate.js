// Extracts Bearer token, verifies it, checks blacklist, then attaches user to req
import { verifyAccessToken, isTokenBlacklisted } from '../services/token.service.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return errorResponse(res, 'UNAUTHORIZED', 'No token provided', 401);

    const token = header.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const blacklisted = await isTokenBlacklisted(decoded.jti);
    if (blacklisted)
      return errorResponse(res, 'TOKEN_INVALID', 'Token has been invalidated', 401);

    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'TOKEN_EXPIRED', 'Token is invalid or expired', 401);
  }
};