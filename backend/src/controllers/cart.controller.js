import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { calculatePrice, recalculateCart } from '../utils/bulkPricing.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }) || { items: [], totalItems: 0, totalAmount: 0 };
  return successResponse(res, cart);
});

// Validates stock and minimum order qty, applies bulk pricing, adds or merges item
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive)
    return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  if (quantity < product.minimumOrderQty)
    return errorResponse(res, 'BELOW_MINIMUM_ORDER_QTY', `Minimum order is ${product.minimumOrderQty} ${product.unit}`, 400);

  if (quantity > product.stock)
    return errorResponse(res, 'INSUFFICIENT_STOCK', 'Not enough stock', 400);

  const pricePerUnit = calculatePrice(product, quantity);
  const subtotal = pricePerUnit * quantity;

  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const existingIndex = cart.items.findIndex(i => i.productId.toString() === productId);
  if (existingIndex > -1) {
    cart.items[existingIndex].quantity = quantity;
    cart.items[existingIndex].pricePerUnit = pricePerUnit;
    cart.items[existingIndex].subtotal = subtotal;
  } else {
    cart.items.push({
      productId,
      name: product.name,
      image: product.images[0] || '',
      unit: product.unit,
      pricePerUnit,
      quantity,
      subtotal,
    });
  }

  recalculateCart(cart);
  await cart.save();
  return successResponse(res, cart, 'Item added to cart');
});

// Updates quantity and recalculates bulk price for that item
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return errorResponse(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);

  if (quantity < product.minimumOrderQty)
    return errorResponse(res, 'BELOW_MINIMUM_ORDER_QTY', `Minimum order is ${product.minimumOrderQty} ${product.unit}`, 400);

  if (quantity > product.stock)
    return errorResponse(res, 'INSUFFICIENT_STOCK', 'Not enough stock', 400);

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return errorResponse(res, 'CART_EMPTY', 'Cart not found', 404);

  const item = cart.items.find(i => i.productId.toString() === productId);
  if (!item) return errorResponse(res, 'NOT_FOUND', 'Item not in cart', 404);

  const pricePerUnit = calculatePrice(product, quantity);
  item.quantity = quantity;
  item.pricePerUnit = pricePerUnit;
  item.subtotal = pricePerUnit * quantity;

  recalculateCart(cart);
  await cart.save();
  return successResponse(res, cart, 'Cart updated');
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return errorResponse(res, 'CART_EMPTY', 'Cart not found', 404);

  cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
  recalculateCart(cart);
  await cart.save();
  return successResponse(res, cart, 'Item removed');
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], totalItems: 0, totalAmount: 0 });
  return successResponse(res, null, 'Cart cleared');
});