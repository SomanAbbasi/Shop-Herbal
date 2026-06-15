import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&connection_limit=5&pool_timeout=10',
    },
  },
});

export const connectDB = async () => {
  await prisma.$connect();
  console.log('PostgreSQL connected via Prisma');
};