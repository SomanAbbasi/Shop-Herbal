// Product has bulk pricing tiers array for wholesale quantity-based pricing
import mongoose from 'mongoose';

const bulkPricingSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  sku: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  minimumOrderQty: { type: Number, required: true, default: 1 },
  stock: { type: Number, required: true, default: 0 },
  bulkPricingTiers: [bulkPricingSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);