import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useCartStore, useAuthStore } from '../store';

const Cart = () => {
  const { cart, totalPrice, fetchCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center card-glass p-12 max-w-md"
          >
            <p className="text-xl text-slate-300 mb-6">Please log in to view your cart</p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setIsCheckingOut(true);
    // Navigate to checkout page
    navigate('/checkout');
  };

  const shippingCost = totalPrice > 1000 ? 0 : 50;
  const tax = Math.round((totalPrice * 0.18) * 100) / 100;
  const finalTotal = totalPrice + shippingCost + tax;

  return (
    <Layout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
              <FiArrowLeft size={20} />
              Continue Shopping
            </Link>
            <h1 className="text-4xl font-bold text-gradient">Your Cart</h1>
          </motion.div>

          {cart && cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-2"
              >
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card-glass p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                        {['🎴', '👟', '💊', '📱'][Math.floor(Math.random() * 4)]}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                          {item.product?.seller?.shopName || 'Local Vendor'}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-cyan-400 font-semibold">
                            ₹{item.product?.price || item.price}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 bg-slate-800 rounded">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-slate-400 mb-2">Subtotal</p>
                        <p className="text-lg font-bold text-cyan-400">
                          ₹{(item.product?.price || item.price) * item.quantity}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => removeFromCart(item.product._id)}
                          className="mt-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={20} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Cart Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <div className="card-glass p-8 space-y-4">
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                  <div className="space-y-3 border-b border-slate-700 pb-4">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? 'text-emerald-400 font-semibold' : ''}>
                        {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tax (18%)</span>
                      <span>₹{tax}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-cyan-400">₹{finalTotal}</span>
                  </div>

                  {totalPrice > 1000 && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100%' }}
                      className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 flex items-center gap-2 text-sm text-emerald-300"
                    >
                      <FiCheck size={16} />
                      <span>You qualify for free shipping!</span>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cart.length === 0}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                  </motion.button>

                  <button
                    onClick={() => clearCart()}
                    className="w-full btn-secondary"
                  >
                    Clear Cart
                  </button>

                  <Link
                    to="/products"
                    className="w-full btn-secondary text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-slate-400 mb-8">Add some products to get started!</p>
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
