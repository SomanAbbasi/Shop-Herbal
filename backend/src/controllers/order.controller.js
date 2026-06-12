import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';
import { sendOrderNotificationToAdmin } from '../services/email.service.js';

// Places order inside a MongoDB transaction — if anything fails nothing is committed
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart || cart.items.length === 0)
    return errorResponse(res, 'CART_EMPTY', 'Cart is empty', 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product || !product.isActive)
        throw new Error(`Product ${item.name} is no longer available`);

      if (product.stock < item.quantity)
        throw new Error(`Insufficient stock for ${item.name}`);

      // Price snapshot — store current price, not a reference to product
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        unit: product.unit,
        pricePerUnit: item.pricePerUnit,
        quantity: item.quantity,
        subtotal: item.subtotal,
      });

      subtotal += item.subtotal;

      // Deduct stock immediately on order placement
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const order = await Order.create([{
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount,
      totalAmount,
      paymentMethod,
      notes: notes || '',
    }], { session });

    // Clear cart after successful order
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], totalItems: 0, totalAmount: 0 },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    sendOrderNotificationToAdmin(order[0]).catch(err => console.error('Admin email failed:', err));

    return successResponse(res, order[0], 'Order placed successfully', 201);

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 'ORDER_FAILED', err.message, 400);
  }
});

// Customer sees own orders, admin sees all
export const listOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return successResponse(res, paginate(orders, total, page, limit));
});

export const getOrder = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, userId: req.user.id };

  const order = await Order.findOne(query);
  if (!order) return errorResponse(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
  return successResponse(res, order);
});

// Admin updates order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return errorResponse(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
  return successResponse(res, order, 'Order status updated');
});

// Customer can only cancel pending orders
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
  if (!order) return errorResponse(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
  if (order.status !== 'pending')
    return errorResponse(res, 'CANNOT_CANCEL_ORDER', 'Only pending orders can be cancelled', 400);

  // Restore stock on cancellation
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
  }

  order.status = 'cancelled';
  await order.save();
  return successResponse(res, order, 'Order cancelled');
});