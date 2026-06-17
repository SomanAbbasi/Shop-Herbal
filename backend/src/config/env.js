const required = [
  'DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES', 'JWT_REFRESH_EXPIRES', 'REDIS_URL',
  'JAZZCASH_MERCHANT_ID', 'JAZZCASH_PASSWORD', 'JAZZCASH_INTEGRITY_SALT',
  'JAZZCASH_RETURN_URL', 'JAZZCASH_API_URL', 'NODE_ENV'
];

required.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`CRITICAL ERROR: Missing environment variable: ${key}`);
  }
});

// Extra check for Database URL specifically
if (process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
    throw new Error('CRITICAL ERROR: DATABASE_URL must be a PostgreSQL connection string');
  }
  
  if (process.env.NODE_ENV === 'production' && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'))) {
    throw new Error('CRITICAL ERROR: DATABASE_URL cannot point to localhost in production mode');
  }
}

export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES,
  redisUrl: process.env.REDIS_URL,
  jazzcashMerchantId: process.env.JAZZCASH_MERCHANT_ID,
  jazzcashPassword: process.env.JAZZCASH_PASSWORD,
  jazzcashIntegritySalt: process.env.JAZZCASH_INTEGRITY_SALT,
  jazzcashApiUrl: process.env.JAZZCASH_API_URL,
  jazzcashReturnUrl: process.env.JAZZCASH_RETURN_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
};