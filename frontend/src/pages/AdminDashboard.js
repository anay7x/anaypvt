import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiCheck, FiX, FiDollarSign, FiPackage, FiEdit3, FiTrash2 } from 'react-icons/fi';

import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    seller: '',
    isFeatured: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await adminAPI.getDashboardStats();
      setStats(statsRes.data.stats);

      const usersRes = await adminAPI.getAllUsers();
      setUsers(usersRes.data.users);

      const sellersRes = await adminAPI.getTopSellers();
      setSellers(sellersRes.data.sellers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      const res = await adminAPI.getAllAdminProducts({});
      setProducts(res.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setProductLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAdminProduct(newProduct);
      toast.success('Product created');
      setShowCreateModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        seller: '',
        isFeatured: false,
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateAdminProduct(editingProduct._id, editingProduct);
      toast.success('Product updated');
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteAdminProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };



  const handleApproveSeller = async (userId) => {
    try {
      await adminAPI.approveSeller(userId);
      toast.success('Seller approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve seller');
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      await adminAPI.toggleUserStatus(userId, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'blocked'} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">Admin Dashboard</h1>
              <p className="text-slate-400">Platform Management & Analytics</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors"
            >
              Logout
            </motion.button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto"
          >
            {[
              { id: 'stats', label: 'Dashboard' },
              { id: 'users', label: 'Users Management' },
              { id: 'sellers', label: 'Top Sellers' },
              { id: 'products', label: 'Products (Admin)' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'products') fetchProducts();
                }}
                className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </motion.button>
            ))}

          </motion.div>

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              variants={containerVariants}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12"
              >
                {[
                  {
                    icon: FiUsers,
                    label: 'Total Users',
                    value: stats.totalUsers || 0,
                    color: 'cyan',
                  },
                  {
                    icon: FiUsers,
                    label: 'Customers',
                    value: stats.totalCustomers || 0,
                    color: 'blue',
                  },
                  {
                    icon: FiPackage,
                    label: 'Sellers',
                    value: stats.totalSellers || 0,
                    color: 'purple',
                  },
                  {
                    icon: FiPackage,
                    label: 'Total Products',
                    value: stats.totalProducts || 0,
                    color: 'green',
                  },
                  {
                    icon: FiDollarSign,
                    label: 'Total Revenue',
                    value: `₹${stats.totalRevenue || 0}`,
                    color: 'pink',
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="card-glass p-6 text-center"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-4 mx-auto`}>
                        <Icon className={`text-${stat.color}-400`} size={24} />
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="card-glass p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Order Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Orders</span>
                      <span className="text-2xl font-bold text-cyan-400">{stats.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Orders This Month</span>
                      <span className="text-2xl font-bold text-purple-400">{stats.ordersThisMonth || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Platform Health</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300">System Status</span>
                        <span className="text-emerald-400 font-semibold">Operational</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-lg h-2">
                        <div className="bg-emerald-500 h-2 rounded-lg w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Manage Users</h2>
              {loading ? (
                <p className="text-slate-400">Loading...</p>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-700">
                      <tr className="text-slate-400 text-sm">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <motion.tr
                          key={userItem._id}
                          whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                          className="border-b border-slate-700 transition-colors"
                        >
                          <td className="py-4 px-4 text-white">{userItem.name}</td>
                          <td className="py-4 px-4 text-slate-400 text-sm">{userItem.email}</td>
                          <td className="py-4 px-4">
                            <span className={`badge ${
                              userItem.role === 'seller' ? 'badge-info' :
                              userItem.role === 'admin' ? 'badge-warning' :
                              'badge-success'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`badge ${userItem.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {userItem.isActive ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {userItem.role === 'seller' && !userItem.isVerified && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => handleApproveSeller(userItem._id)}
                                  className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40"
                                >
                                  <FiCheck size={16} />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleToggleUserStatus(userItem._id, userItem.isActive)}
                                className={`p-2 rounded ${
                                  userItem.isActive
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40'
                                }`}
                              >
                                {userItem.isActive ? <FiX size={16} /> : <FiCheck size={16} />}
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400">No users found</p>
              )}
            </motion.div>
          )}

          {/* Top Sellers Tab */}
{activeTab === 'sellers' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Top Sellers</h2>
              {loading ? (
                <p className="text-slate-400">Loading...</p>
              ) : sellers.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {sellers.map((seller) => (
                    <motion.div
                      key={seller._id}
                      variants={itemVariants}
                      className="card-glass p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {seller.shopName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{seller.shopName}</p>
                          <p className="text-sm text-slate-400">{seller.category}</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Orders</span>
                          <span className="font-semibold text-cyan-400">{seller.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revenue</span>
                          <span className="font-semibold text-green-400">₹{seller.totalRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rating</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="font-semibold text-white">{seller.ratings}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="text-slate-400">No sellers found</p>
              )}
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Products</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                >
                  + Add New Product
                </motion.button>
              </div>

              <div className="card-glass p-8">
                {productLoading ? (
                  <p className="text-slate-400 text-center">Loading products...</p>
                ) : products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-700">
                        <tr className="text-slate-400 text-sm">
                          <th className="text-left py-3 px-4">Image</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Stock</th>
                          <th className="text-left py-3 px-4">Seller</th>
                          <th className="text-left py-3 px-4">Featured</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <motion.tr
                            key={product._id}
                            whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                            className="border-b border-slate-700 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <img src={product.images[0]?.url || '/placeholder.jpg'} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            </td>
                            <td className="py-4 px-4 text-white font-medium max-w-xs truncate">{product.name}</td>
                            <td className="py-4 px-4 text-green-400 font-bold">₹{product.price.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-400">{product.seller?.name || 'N/A'}</td>
                            <td className="py-4 px-4">
                              <span className={`badge ${product.isFeatured ? 'badge-warning' : 'badge-secondary'}`}>
                                {product.isFeatured ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowEditModal(true);
                                  }}
                                  className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40"
                                  title="Edit"
                                >
                                  <FiEdit3 size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40"
                                  title="Delete"
                                >
                                  <FiTrash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-12">No products found. Add your first product!</p>
                )}
              </div>

              {/* Create Modal */}
              {showCreateModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowCreateModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-800 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">Add New Product</h3>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <div>
                        <label className="block text-slate-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Category</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Footwear">Footwear</option>
                          <option value="Medicine">Medicine</option>
                          <option value="Wedding Cards">Wedding Cards</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Stock</label>
                        <input
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Seller ID</label>
                        <input
                          type="text"
                          value={newProduct.seller}
                          onChange={(e) => setNewProduct({...newProduct, seller: e.target.value})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          placeholder="User ID from users list"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-500 file:to-blue-600 file:text-white hover:file:from-cyan-600 hover:file:to-blue-700"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={newProduct.isFeatured}
                          onChange={(e) => setNewProduct({...newProduct, isFeatured: e.target.checked})}
                          className="rounded"
                        />
                        <label htmlFor="isFeatured" className="text-slate-400">Featured on Home</label>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
                        >
                          Create Product
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          whileHover={{ scale: 1.05 }}
                          className="flex-1 px-6 py-3 bg-slate-700 text-slate-400 rounded-lg hover:bg-slate-600 transition-all"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}

              {/* Edit Modal */}
              {showEditModal && editingProduct && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowEditModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-800 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">Edit Product</h3>
                    <form onSubmit={handleEditProduct} className="space-y-4">
                      <div>
                        <label className="block text-slate-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                          required
                        />
                      </div>
                      {/* Similar fields for other properties */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
                        >
                          Update Product
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          whileHover={{ scale: 1.05 }}
                          className="flex-1 px-6 py-3 bg-slate-700 text-slate-400 rounded-lg hover:bg-slate-600 transition-all"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

