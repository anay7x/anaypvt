const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access dashboard',
      });
    }

    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    const ordersThisMonth = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersThisMonth,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Users
exports.getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access this',
      });
    }

    const { role, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
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

// Approve Seller
exports.approveSeller = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can approve sellers',
      });
    }

    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: true, isActive: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seller approved successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Block/Unblock User
exports.toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can modify user status',
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'blocked'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Sales Report
exports.getSalesReport = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access sales report',
      });
    }

    const { startDate, endDate } = req.query;

    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query).populate('user', 'name email');

    const report = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length : 0,
      ordersByStatus: {},
    };

    orders.forEach(order => {
      report.ordersByStatus[order.orderStatus] = (report.ordersByStatus[order.orderStatus] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      report,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Top Sellers
exports.getTopSellers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access this',
      });
    }

    const sellers = await User.find({ role: 'seller' })
      .sort({ totalRevenue: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      sellers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Products for Admin
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access this',
      });
    }

    const { sellerId, category, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (sellerId) {
      query.seller = sellerId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('seller', 'shopName')
      .sort({ createdAt: -1 })
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

// Create Product as Admin
exports.createProductAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access this',
      });
    }

    const { name, description, price, originalPrice, discount, category, stock, seller, specifications } = req.body;

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: discount ? parseInt(discount) : 0,
      category,
      stock: parseInt(stock),
      seller,
      specifications: specifications ? JSON.parse(specifications) : {},
      isFeatured: true, // Admin added are featured by default
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product as Admin
exports.updateProductAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access this',
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product as Admin
exports.deleteProductAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access this',
      });
    }

    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

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

