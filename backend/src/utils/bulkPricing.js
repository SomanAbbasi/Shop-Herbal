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

export const recalculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
  return { totalItems, totalAmount };
};