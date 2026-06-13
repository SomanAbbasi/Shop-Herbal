import { prisma } from '../config/db.js';
import { calculatePrice, recalculateTotals } from '../utils/bulkPricing.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Helper to fetch cart with items, creates one if it doesn't exist
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId }, include: { items: true } });
  }
  return cart;
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  return successResponse(res, cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { bulkPricingTiers: true },
  });

  if (!product || !product.isActive)
    return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  if (quantity < product.minimumOrderQty)
    return errorResponse(res, 'BELOW_MINIMUM_ORDER_QTY', `Minimum order is ${product.minimumOrderQty} ${product.unit}`, 400);

  if (quantity > product.stock)
    return errorResponse(res, 'INSUFFICIENT_STOCK', 'Not enough stock', 400);

  const pricePerUnit = calculatePrice(product, quantity);
  const subtotal = pricePerUnit * quantity;

  const cart = await getOrCreateCart(req.user.id);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity, pricePerUnit, subtotal },
    create: {
      cartId: cart.id,
      productId,
      name: product.name,
      image: product.images[0] || '',
      unit: product.unit,
      pricePerUnit,
      quantity,
      subtotal,
    },
  });

  const updatedCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } });
  const { totalItems, totalAmount } = recalculateTotals(updatedCart.items);

  const finalCart = await prisma.cart.update({
    where: { id: cart.id },
    data: { totalItems, totalAmount },
    include: { items: true },
  });

  return successResponse(res, finalCart, 'Item added to cart');
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { bulkPricingTiers: true },
  });
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  if (quantity < product.minimumOrderQty)
    return errorResponse(res, 'BELOW_MINIMUM_ORDER_QTY', `Minimum order is ${product.minimumOrderQty} ${product.unit}`, 400);

  if (quantity > product.stock)
    return errorResponse(res, 'INSUFFICIENT_STOCK', 'Not enough stock', 400);

  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: true } });
  if (!cart) return errorResponse(res, 'CART_EMPTY', 'Cart not found', 404);

  const item = cart.items.find(i => i.productId === productId);
  if (!item) return errorResponse(res, 'NOT_FOUND', 'Item not in cart', 404);

  const pricePerUnit = calculatePrice(product, quantity);
  const subtotal = pricePerUnit * quantity;

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity, pricePerUnit, subtotal },
  });

  const updatedCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } });
  const { totalItems, totalAmount } = recalculateTotals(updatedCart.items);

  const finalCart = await prisma.cart.update({
    where: { id: cart.id },
    data: { totalItems, totalAmount },
    include: { items: true },
  });

  return successResponse(res, finalCart, 'Cart updated');
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: true } });
  if (!cart) return errorResponse(res, 'CART_EMPTY', 'Cart not found', 404);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: req.params.productId } });

  const updatedCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: true } });
  const { totalItems, totalAmount } = recalculateTotals(updatedCart.items);

  const finalCart = await prisma.cart.update({
    where: { id: cart.id },
    data: { totalItems, totalAmount },
    include: { items: true },
  });

  return successResponse(res, finalCart, 'Item removed');
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { totalItems: 0, totalAmount: 0 } });
  }
  return successResponse(res, null, 'Cart cleared');
});