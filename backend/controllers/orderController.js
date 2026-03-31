const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// Create Order
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentInfo } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shipping address',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('cartItems.product');

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
      });
    }

    const orderItems = cart.cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      seller: item.seller,
    }));

    const shippingPrice = cart.totalPrice > 1000 ? 0 : 50;
    const taxPrice = Math.round((cart.totalPrice * 0.18) * 100) / 100;
    const totalPrice = cart.totalPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentInfo: paymentInfo || { method: 'cod', status: 'pending' },
      totalPrice,
      shippingPrice,
      taxPrice,
      paymentStatus: paymentInfo?.method === 'cod' ? 'pending' : 'completed',
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update seller stats
    for (const item of orderItems) {
      if (!item.seller) continue;

      const seller = await User.findById(item.seller);
      if (!seller) continue;

      seller.totalOrders = (seller.totalOrders || 0) + 1;
      seller.totalRevenue = (seller.totalRevenue || 0) + item.price * item.quantity;
      await seller.save();
    }

    // Clear cart
    await Cart.findByIdAndUpdate(cart._id, { cartItems: [], totalPrice: 0 });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: await order.populate('orderItems.product orderItems.seller', 'shopName'),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product')
      .populate('orderItems.seller', 'shopName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('orderItems.product')
      .populate('orderItems.seller', 'shopName ratings');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is authorized
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Seller Orders
exports.getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'orderItems.seller': req.user.id })
      .populate('user', 'name email phone')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Order Status (Admin/Seller)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    const isAuthorized = req.user.role === 'admin' || 
      order.orderItems.some(item => item.seller.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel Order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = cancellationReason;
    order.cancelledAt = new Date();

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access all orders',
      });
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .populate('orderItems.seller', 'shopName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
