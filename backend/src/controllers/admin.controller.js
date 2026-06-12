import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Aggregates key business metrics for admin dashboard overview
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    pendingApprovals,
    lowStockProducts,
    recentOrders,
    revenueData,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ status: 'pending' }),
    Product.countDocuments({ stock: { $lte: 10 }, isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
  ]);

  return successResponse(res, {
    totalOrders,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    pendingApprovals,
    lowStockProducts,
    recentOrders,
  });
});

// Sales report grouped by day using aggregation pipeline
export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const match = { paymentStatus: 'paid' };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const report = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return successResponse(res, report);
});

// Inventory report showing current stock levels
export const getInventoryReport = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .select('name sku unit stock minimumOrderQty')
    .sort({ stock: 1 });

  const report = products.map(p => ({
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    stock: p.stock,
    minimumOrderQty: p.minimumOrderQty,
    status: p.stock === 0 ? 'out_of_stock' : p.stock <= 10 ? 'low_stock' : 'in_stock',
  }));

  return successResponse(res, report);
});