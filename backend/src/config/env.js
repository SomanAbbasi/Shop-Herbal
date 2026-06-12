const required = [
  'PORT', 'MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES', 'JWT_REFRESH_EXPIRES', 'REDIS_URL', 'CLIENT_URL'
];

required.forEach(key => {
  if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
});

export const env = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES,
  redisUrl: process.env.REDIS_URL,
  clientUrl: process.env.CLIENT_URL,
};