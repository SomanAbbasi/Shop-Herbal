-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'payment_failed';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'jazz_cash';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "transactionId" TEXT;
