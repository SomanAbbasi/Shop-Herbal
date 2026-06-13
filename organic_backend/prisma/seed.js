import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (exists) {
    console.log('Admin already exists, skipping seed.');
    return;
  }

 const hashedPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      phone: '0300000000',
      businessName: 'Shopherbal HQ',
      role: 'admin',
      status: 'active',
      emailVerified: true,
    },
  });

  console.log('Admin user created successfully');
  console.log('Email:', adminEmail);
  console.log('Password: ' + process.env.SEED_ADMIN_PASSWORD);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());