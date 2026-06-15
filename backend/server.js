import 'dotenv/config';
import app from './src/app.js';
import { prisma, connectDB } from './src/config/db.js';
import { redis } from './src/config/redis.js';
import { env } from './src/config/env.js';

const start = async () => {
  await connectDB();
  await redis.ping();
  app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
};

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});