export const calculatePrice = (product, quantity) => {
  let price = product.pricePerUnit;
  if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
    const sorted = [...product.bulkPricingTiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sorted) {
      if (quantity >= tier.minQty) {
        price = tier.pricePerUnit;
        break;
      }
    }
  }
  return Math.round(price * 100) / 100;
};

export const recalculateCart = (cart) => {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalAmount = Math.round(cart.items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
  return cart;
};