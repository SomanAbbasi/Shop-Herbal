// Prisma client singleton — exported for use across all controllers
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectDB = async () => {
  await prisma.$connect();
  console.log('PostgreSQL connected via Prisma');
};