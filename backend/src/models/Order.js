// Order stores complete snapshot of items and prices at time of purchase
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  image: String,
  unit: String,
  pricePerUnit: Number,
  quantity: Number,
  subtotal: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['stripe', 'bank_transfer', 'net30', 'cash_on_delivery'], required: true },
  invoiceNumber: { type: String, unique: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Auto generate invoice number before saving
orderSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.model('Order', orderSchema);