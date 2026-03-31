const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    cartItems: [
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
          default: 1,
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
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total price
cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  return this.totalPrice;
};

module.exports = mongoose.model('Cart', cartSchema);
