import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiLogOut,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEdit2,
  FiSave,
  FiX,
  FiCheck,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import { authAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab, navigate]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getUserOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address_')) {
      const addressField = name.replace('address_', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;

    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      await orderAPI.cancelOrder(cancellingOrderId, {
        cancellationReason,
      });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      setCancellingOrderId(null);
      setCancellationReason('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed':
        return 'text-blue-400 bg-blue-400/10';
      case 'processing':
        return 'text-cyan-400 bg-cyan-400/10';
      case 'shipped':
        return 'text-indigo-400 bg-indigo-400/10';
      case 'delivered':
        return 'text-green-400 bg-green-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'confirmed':
        return <FiCheck className="w-4 h-4" />;
      case 'processing':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'shipped':
        return <FiTruck className="w-4 h-4" />;
      case 'delivered':
        return <FiCheck className="w-4 h-4" />;
      case 'cancelled':
        return <FiX className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
    }
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.orderStatus);
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                My Dashboard
              </h1>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300"
              >
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mb-8 border-b border-slate-700"
          >
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <FiUser className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <FiPackage className="w-5 h-5" />
              Orders
            </button>
          </motion.div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Personal Info Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FiUser className="w-6 h-6 text-cyan-400" />
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all duration-300"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300"
                      >
                        <FiSave className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiMapPin className="w-6 h-6 text-cyan-400" />
                  Delivery Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address.street}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="address_city"
                      value={formData.address.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="New York"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="address_state"
                      value={formData.address.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="NY"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="address_zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="10001"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Country */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address_country"
                      value={formData.address.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="United States"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {loadingOrders ? (
                <div className="text-center py-12">
                  <div className="inline-block">
                    <div className="animate-spin">
                      <FiPackage className="w-12 h-12 text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 mt-4">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center backdrop-blur-sm">
                  <FiPackage className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No orders yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start shopping to place your first order!
                  </p>
                </div>
              ) : (
                orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm hover:border-slate-600 transition-colors"
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-6 border-b border-slate-700">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              Order {order.orderNumber}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.orderStatus)}`}
                            >
                              {getStatusIcon(order.orderStatus)}
                              {order.orderStatus.charAt(0).toUpperCase() +
                                order.orderStatus.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-400">
                            ₹{order.totalPrice.toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {order.orderItems.length} item
                            {order.orderItems.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 space-y-4">
                      <h4 className="font-semibold text-white mb-4">Order Items</h4>
                      {order.orderItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex gap-4 pb-4 border-b border-slate-700 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-white">
                              {item.product.name}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-cyan-400 font-semibold mt-1">
                              ₹{item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Subtotal</p>
                            <p className="text-white font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="px-6 py-4 bg-slate-700/20 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-700">
                      <div>
                        <p className="text-gray-400 text-sm">Shipping</p>
                        <p className="text-white font-semibold">
                          ₹{order.shippingPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Tax</p>
                        <p className="text-white font-semibold">
                          ₹{order.taxPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment</p>
                        <p className="text-white font-semibold capitalize">
                          {order.paymentInfo?.method || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment Status</p>
                        <p className="text-white font-semibold capitalize">
                          {order.paymentStatus}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="px-6 py-4 border-t border-slate-700">
                        <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <FiMapPin className="w-4 h-4 text-cyan-400" />
                          Delivery Address
                        </h5>
                        <div className="text-gray-400 text-sm space-y-1">
                          <p>{order.shippingAddress.name}</p>
                          <p>
                            {order.shippingAddress.street},{' '}
                            {order.shippingAddress.city}
                          </p>
                          <p>
                            {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zipCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                          <p className="flex items-center gap-2 text-gray-300 mt-2">
                            <FiPhone className="w-4 h-4" />
                            {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Timeline/Tracking */}
                    <div className="px-6 py-4 border-t border-slate-700">
                      <h5 className="font-semibold text-white mb-4">Order Status</h5>
                      <div className="space-y-3">
                        {[
                          { status: 'pending', label: 'Order Placed' },
                          { status: 'confirmed', label: 'Confirmed' },
                          { status: 'processing', label: 'Processing' },
                          { status: 'shipped', label: 'Shipped' },
                          { status: 'delivered', label: 'Delivered' },
                        ].map((step, idx) => {
                          const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                          const currentStatusIdx = statusOrder.indexOf(order.orderStatus);
                          const stepIdx = statusOrder.indexOf(step.status);
                          const isCompleted = stepIdx <= currentStatusIdx && order.orderStatus !== 'cancelled';
                          const isCurrent = stepIdx === currentStatusIdx && order.orderStatus !== 'cancelled';

                          return (
                            <div key={step.status} className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isCurrent
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-slate-700 text-gray-400'
                                }`}
                              >
                                {isCompleted ? <FiCheck /> : idx + 1}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`${
                                    isCompleted || isCurrent
                                      ? 'text-white'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {step.label}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cancel Order Button */}
                    {canCancelOrder(order) && (
                      <div className="px-6 py-4 border-t border-slate-700 flex gap-2">
                        <button
                          onClick={() => {
                            setCancellingOrderId(order._id);
                            setShowCancelModal(true);
                          }}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 font-medium"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-yellow-400" />
              Cancel Order
            </h3>

            <p className="text-gray-400 mb-4">
              Please provide a reason for cancelling this order. This information helps us improve our service.
            </p>

            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Found a better price, Changed my mind, etc."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none h-28 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellingOrderId(null);
                  setCancellationReason('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 font-medium"
              >
                Confirm Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default UserDashboard;
