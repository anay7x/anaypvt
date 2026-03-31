const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');
        return `LH-${timestamp}-${random}`;
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      }
    ],
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentInfo: {
      id: String,
      status: String,
      method: {
        type: String,
        enum: ['razorpay', 'cod', 'upi'],
        default: 'cod',
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Ensure unique order number is set prior to validation if somehow missing
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `LH-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
