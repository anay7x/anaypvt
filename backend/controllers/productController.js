const Product = require('../models/Product');
const User = require('../models/User');

// Create Product (Seller)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, discount, category, stock, specifications } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || stock === undefined || stock === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, and stock',
      });
    }

    // Validate numeric fields
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid price (must be a positive number)',
      });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stock quantity (must be a non-negative number)',
      });
    }

    const seller = await User.findById(req.user.id);

    if (!seller || seller.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can add products',
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        public_id: file.filename,
        url: `/uploads/${file.filename}`,
      }));
    }

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      stock: parsedStock,
      seller: req.user.id,
      vendorCode: seller.vendorCode,
      images: images,
    };

    // Generate SKU
    const categoryPrefix = category.substring(0, 3).toUpperCase().replace(/\s+/g, '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    productData.sku = `${categoryPrefix}-${timestamp}-${random}`;

    // Add optional fields if provided
    if (originalPrice && originalPrice !== '') {
      const parsedOriginalPrice = parseFloat(originalPrice);
      if (!isNaN(parsedOriginalPrice) && parsedOriginalPrice >= 0) {
        productData.originalPrice = parsedOriginalPrice;
      }
    }

    if (discount && discount !== '') {
      const parsedDiscount = parseInt(discount);
      if (!isNaN(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 100) {
        productData.discount = parsedDiscount;
      }
    }

    if (specifications && specifications !== '') {
      try {
        productData.specifications = JSON.parse(specifications);
      } catch (error) {
        productData.specifications = {};
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// Get All Products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sortBy, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    switch (sortBy) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { ratings: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('seller', 'shopName ratings')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('seller', 'shopName ratings totalOrders')
      .populate('reviews.user', 'name profileImage');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product (Seller)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, specifications } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product',
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name || product.name,
        description: description || product.description,
        price: price ? parseFloat(price) : product.price,
        category: category || product.category,
        stock: stock !== undefined ? parseInt(stock) : product.stock,
        specifications: specifications ? JSON.parse(specifications) : product.specifications,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product (Seller)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Seller Products
exports.getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Review
exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: parseInt(rating),
      comment,
    };

    product.reviews.push(review);

    // Update ratings
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.ratings = totalRating / product.reviews.length;
    product.numOfReviews = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
