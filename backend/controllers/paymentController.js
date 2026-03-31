const Razorpay = require('razorpay');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Payment Order
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const options = {
      amount: Math.round(order.totalPrice * 100), // Amount in paisa
      currency: 'INR',
      receipt: `order_${order._id}`,
      payment_capture: 1, // Auto capture
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      amount: order.totalPrice,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Payment
exports.confirmPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Update order status
    order.paymentInfo.id = razorpay_payment_id;
    order.paymentInfo.status = 'completed';
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Payment Methods (for COD and other options)
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = [
      {
        id: 'razorpay',
        name: 'Credit/Debit Card & UPI',
        description: 'Pay securely with Razorpay',
        icon: 'card',
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: 'package',
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Fast & secure UPI payment',
        icon: 'phone',
      },
    ];

    res.status(200).json({
      success: true,
      methods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
