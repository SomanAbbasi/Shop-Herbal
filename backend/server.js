import 'dotenv/config';
import app from './src/app.js';
import { prisma, connectDB } from './src/config/db.js';
import { redis } from './src/config/redis.js';
import { env } from './src/config/env.js';

const start = async () => {
  try {
    await connectDB();
    
    // Add connection timeout for Redis
    const redisReady = await Promise.race([
      redis.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
    ]);
    
    console.log('Redis Status:', redisReady);
    
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('FATAL STARTUP ERROR:', error.message);
    console.error(error.stack);
    // On Vercel, we might want to stay alive to show the error via health check, 
    // but usually, a fatal error should exit to trigger a restart.
    // However, if we exit too fast, logs might be lost.
    setTimeout(() => process.exit(1), 1000);
  }
};

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});