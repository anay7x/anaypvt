const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} = require('../controllers/orderController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Customer routes
router.post('/', authMiddleware, authorizeRoles('customer'), createOrder);
router.get('/', authMiddleware, authorizeRoles('customer'), getUserOrders);
router.get('/:id', authMiddleware, getOrderDetails);
router.put('/:id/cancel', authMiddleware, authorizeRoles('customer'), cancelOrder);

// Seller routes
router.get('/seller/orders', authMiddleware, authorizeRoles('seller'), getSellerOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);

// Admin routes
router.get('/admin/all', authMiddleware, authorizeRoles('admin'), getAllOrders);

module.exports = router;
