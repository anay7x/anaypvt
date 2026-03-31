const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    profileImage: {
      type: String,
      default: null,
    },
    // For Sellers
    shopName: {
      type: String,
      required: function () {
        return this.role === 'seller';
      },
    },
    shopDescription: String,
    category: {
      type: String,
      enum: ['Wedding Cards', 'Footwear', 'Medicine', 'Electronics', 'Other'],
      required: function () {
        return this.role === 'seller';
      },
    },
    vendorCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate vendor code for sellers
userSchema.pre('save', async function (next) {
  if (this.role === 'seller' && !this.vendorCode) {
    this.vendorCode = `VENDOR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
