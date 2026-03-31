const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/payment-intent', authMiddleware, createPaymentIntent);
router.post('/confirm', authMiddleware, confirmPayment);
router.get('/methods', getPaymentMethods);

module.exports = router;
