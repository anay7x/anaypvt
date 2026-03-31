import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiPackage, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { productAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    stock: '',
    images: [],
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const productsRes = await productAPI.getSellerProducts();
      setProducts(productsRes.data.products);
      
      const ordersRes = await orderAPI.getSellerOrders();
      setOrders(ordersRes.data.orders);

      // Calculate stats
      const totalRevenue = ordersRes.data.orders.reduce((sum, order) => {
        const sellerRevenue = order.orderItems
          .filter(item => item.seller._id === user.id)
          .reduce((s, item) => s + (item.price * item.quantity), 0);
        return sum + sellerRevenue;
      }, 0);

      setStats({
        totalProducts: productsRes.data.products.length,
        totalRevenue,
        totalOrders: ordersRes.data.orders.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a product description');
      return;
    }
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    try {
      const data = new FormData();

      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      // Add image files
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file, index) => {
          data.append('images', file);
        });
      }

      await productAPI.createProduct(data);
      toast.success('Product added successfully!');
      setShowAddProduct(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        discount: '',
        category: '',
        stock: '',
        images: [],
      });
      fetchData();
    } catch (error) {
      console.error('Add product error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
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
              <h1 className="text-4xl font-bold text-gradient mb-2">Seller Dashboard</h1>
              <p className="text-slate-400">Welcome back, {user?.shopName}!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors"
            >
              Logout
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                icon: FiPackage,
                label: 'Total Products',
                value: stats.totalProducts,
                color: 'cyan',
              },
              {
                icon: FiShoppingCart,
                label: 'Total Orders',
                value: stats.totalOrders,
                color: 'purple',
              },
              {
                icon: FiDollarSign,
                label: 'Total Revenue',
                value: `₹${stats.totalRevenue}`,
                color: 'green',
              },
              {
                icon: FiTrendingUp,
                label: 'Avg Rating',
                value: user?.ratings || '5.0',
                color: 'pink',
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="card-glass p-6"
                >
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-4`}>
                    <Icon className={`text-${stat.color}-400`} size={24} />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mb-8 border-b border-slate-700"
          >
            {[
              { id: 'products', label: 'Products', icon: FiPackage },
              { id: 'orders', label: 'Orders', icon: FiShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Content */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Your Products</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="flex items-center gap-2 btn-primary"
                >
                  <FiPlus size={20} />
                  Add Product
                </motion.button>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="card-glass p-8 mb-8"
                >
                  <h3 className="text-xl font-bold text-white mb-6">Add New Product</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      />
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select Category</option>
                        <option value="Wedding Cards">Wedding Cards</option>
                        <option value="Footwear">Footwear</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Product Description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="input-field h-24"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      />
                      <input
                        type="number"
                        name="originalPrice"
                        placeholder="Original Price (optional)"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                      <input
                        type="number"
                        name="discount"
                        placeholder="Discount % (optional)"
                        value={formData.discount}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                    <input
                      type="number"
                      name="stock"
                      placeholder="Stock Quantity"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    />

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-300">
                        Product Images (Max 5 images)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />

                      {/* Image Preview */}
                      {formData.images && formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {formData.images.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-slate-600"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button type="submit" className="btn-primary flex-1">
                        Add Product
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Products Grid */}
              {products.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={itemVariants}
                      className="card-glass p-6"
                    >
                      <div className="text-5xl mb-3 text-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${product.images[0].url}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg mx-auto"
                          />
                        ) : (
                          ['🎴', '👟', '💊', '📱'][Math.floor(Math.random() * 4)]
                        )}
                      </div>
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-cyan-400">
                          ₹{product.price}
                        </span>
                        <span className="badge badge-info">{product.stock} in stock</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1">
                          <FiEdit2 size={16} />
                          Edit
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 py-2 flex items-center justify-center gap-1"
                        >
                          <FiTrash2 size={16} />
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No products yet. Add your first product!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      key={order._id}
                      variants={itemVariants}
                      className="card-glass p-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <p className="text-sm text-slate-400">Order ID</p>
                          <p className="font-semibold text-white">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Customer</p>
                          <p className="font-semibold text-white">{order.user?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Amount</p>
                          <p className="font-semibold text-cyan-400">₹{order.totalPrice}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="badge badge-info text-xs">{order.orderStatus}</span>
                          <span className="badge badge-success text-xs">{order.paymentStatus}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No orders yet</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
