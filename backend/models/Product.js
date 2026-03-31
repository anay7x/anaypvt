const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Wedding Cards', 'Footwear', 'Medicine', 'Electronics', 'Other'],
    },
    images: [
      {
        public_id: String,
        url: String,
      }
    ],
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorCode: String,
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    specifications: {
      type: Map,
      of: String,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
