const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  addReview,
} = require('../controllers/productController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductDetails);

// Seller routes
router.post('/', authMiddleware, authorizeRoles('seller'), uploadMultiple('images', 5), createProduct);
router.put('/:id', authMiddleware, authorizeRoles('seller'), uploadMultiple('images', 5), updateProduct);
router.delete('/:id', authMiddleware, authorizeRoles('seller'), deleteProduct);
router.get('/seller/my-products', authMiddleware, authorizeRoles('seller'), getSellerProducts);

// Review routes
router.post('/:id/review', authMiddleware, authorizeRoles('customer'), addReview);

module.exports = router;
