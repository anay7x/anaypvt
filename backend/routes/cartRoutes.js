const express = require('express');
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.delete('/:productId', authMiddleware, removeFromCart);
router.put('/:productId', authMiddleware, updateCartQuantity);
router.delete('/', authMiddleware, clearCart);

module.exports = router;
