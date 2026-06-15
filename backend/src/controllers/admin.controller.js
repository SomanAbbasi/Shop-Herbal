import { prisma } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    suspendedUsers,
    lowStockProducts,
    recentOrders,
    revenueData,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { status: 'suspended' } }),
    prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    }),
  ]);

  return successResponse(res, {
    totalOrders,
    totalRevenue: revenueData._sum.totalAmount || 0,
    pendingApprovals: suspendedUsers,
    lowStockProducts,
    recentOrders,
  });
});

export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = { paymentStatus: 'paid' };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const orders = await prisma.order.findMany({
    where,
    select: { createdAt: true, totalAmount: true },
  });

  // Group by date manually since Prisma groupBy can't truncate dates on SQLite/Postgres easily
  const grouped = {};
  for (const order of orders) {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = { totalOrders: 0, totalRevenue: 0 };
    grouped[date].totalOrders += 1;
    grouped[date].totalRevenue += order.totalAmount;
  }

  const report = Object.entries(grouped)
    .map(([date, data]) => ({ _id: date, ...data }))
    .sort((a, b) => b._id.localeCompare(a._id));

  return successResponse(res, report);
});

export const getInventoryReport = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { name: true, sku: true, unit: true, stock: true, minimumOrderQty: true },
    orderBy: { stock: 'asc' },
  });

  const report = products.map(p => ({
    ...p,
    status: p.stock === 0 ? 'out_of_stock' : p.stock <= 10 ? 'low_stock' : 'in_stock',
  }));

  return successResponse(res, report);
});