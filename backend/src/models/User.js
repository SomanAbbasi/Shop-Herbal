// User schema with business fields for wholesale buyers and bcrypt password hashing
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  businessName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },

  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpires: Date,

  passwordResetToken: String,
  passwordResetExpires: Date,

  // Add addresses here
  addresses: [{
    label: { type: String, default: 'Office' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }]

}, { timestamps: true });

// Hash password before saving, skip if not modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to compare plain password against stored hash
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);