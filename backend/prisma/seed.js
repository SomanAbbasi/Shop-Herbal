import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
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
  } else {
    console.log('Admin already exists, skipping.');
  }

  const customerEmail = 'somanabbasi305@gmail.com';
  const customerExists = await prisma.user.findUnique({ where: { email: customerEmail } });
  
  if (!customerExists) {
    const hashedCustomerPassword = await bcrypt.hash('Password@123', 12);
    await prisma.user.create({
      data: {
        name: 'Soman Abbasi',
        email: customerEmail,
        password: hashedCustomerPassword,
        phone: '03123456789',
        businessName: 'Soman Traders',
        role: 'customer',
        status: 'active',
        emailVerified: true,
      },
    });
    console.log('Customer user created successfully');
  } else {
    console.log('Customer already exists, skipping.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());