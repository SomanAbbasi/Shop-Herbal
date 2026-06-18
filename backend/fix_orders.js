import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.order.updateMany({
    where: {
      paymentMethod: {
        not: 'cash_on_delivery',
      },
    },
    data: {
      paymentMethod: 'cash_on_delivery',
    },
  });
  console.log(`Updated ${updated.count} orders to cash_on_delivery`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
