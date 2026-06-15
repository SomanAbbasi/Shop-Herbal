import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginate } from '../utils/pagination.js';
import { sendOrderNotificationToAdmin } from '../services/email.service.js';

// Places order using Prisma's interactive transaction — rolls back automatically on error
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: true } });
  if (!cart || cart.items.length === 0)
    return errorResponse(res, 'CART_EMPTY', 'Cart is empty', 400);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const orderItemsData = [];
      let subtotal = 0;

      for (const item of cart.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product || !product.isActive)
          throw new Error(`Product ${item.name} is no longer available`);

        if (product.stock < item.quantity)
          throw new Error(`Insufficient stock for ${item.name}`);

        orderItemsData.push({
          productId: product.id,
          name: product.name,
          image: product.images[0] || '',
          unit: product.unit,
          pricePerUnit: item.pricePerUnit,
          quantity: item.quantity,
          subtotal: item.subtotal,
        });

        subtotal += item.subtotal;

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

      const count = await tx.order.count();
      const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          invoiceNumber,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          subtotal: Math.round(subtotal * 100) / 100,
          taxAmount,
          totalAmount,
          paymentMethod,
          notes: notes || '',
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { totalItems: 0, totalAmount: 0 } });

      return newOrder;
    });

    sendOrderNotificationToAdmin(order).catch(err => console.error('Admin email failed:', err));

    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (err) {
    return errorResponse(res, 'ORDER_FAILED', err.message, 400);
  }
});

export const listOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
  if (status) where.status = status;

  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * Number(limit),
    take: Number(limit),
  });

  return successResponse(res, paginate(orders, total, page, limit));
});

export const getOrder = asyncHandler(async (req, res) => {
  const where = req.user.role === 'admin'
    ? { id: req.params.id }
    : { id: req.params.id, userId: req.user.id };

  const order = await prisma.order.findFirst({ where, include: { items: true } });
  if (!order) return errorResponse(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
  return successResponse(res, order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: true },
  }).catch(() => null);

  if (!order) return errorResponse(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
  return successResponse(res, order, 'Order status updated');
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: true },
  });

  if (!order) return errorResponse(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
  if (order.status !== 'pending')
    return errorResponse(res, 'CANNOT_CANCEL_ORDER', 'Only pending orders can be cancelled', 400);

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.order.update({ where: { id: order.id }, data: { status: 'cancelled' } });
  });

  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
  return successResponse(res, updated, 'Order cancelled');
});