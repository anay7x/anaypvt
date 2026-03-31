const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  approveSeller,
  toggleUserStatus,
  getSalesReport,
  getTopSellers,
  getAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} = require('../controllers/adminController');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveSeller);
router.put('/users/:id/status', toggleUserStatus);
router.get('/sales-report', getSalesReport);
router.get('/top-sellers', getTopSellers);

router.get('/products', getAllProductsAdmin);
router.post('/products', createProductAdmin);
router.put('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

module.exports = router;

