// Centralized service for generating and verifying access/refresh JWTs
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redis } from '../config/redis.js';

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpires,
    jwtid: crypto.randomUUID(),
  });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpires });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.jwtRefreshSecret);

// Blacklist a token in Redis using its JTI so logout is immediate
export const blacklistToken = async (jti, ttlSeconds) => {
  await redis.set(`bl_${jti}`, '1', 'EX', ttlSeconds);
};

export const isTokenBlacklisted = async (jti) => {
  const result = await redis.get(`bl_${jti}`);
  return result !== null;
};