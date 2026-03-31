import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuthStore, useCartStore } from '../store';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user } = useAuthStore();
  const { cart, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const shippingCost = totalPrice > 1000 ? 0 : 50;
  const tax = Math.round((totalPrice * 0.18) * 100) / 100;
  const finalTotal = totalPrice + shippingCost + tax;

  const handlePlaceOrder = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        shippingAddress,
        paymentInfo: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'pending',
        },
      };

      const { data } = await orderAPI.createOrder(orderData);
      
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully! You will receive a confirmation email.');
        clearCart();
        setTimeout(() => {
          navigate(`/order/${data.order._id}`);
        }, 2000);
      } else if (paymentMethod === 'razorpay') {
        navigate('/payment', { state: { orderId: data.order._id, address: shippingAddress } });
      } else {
        toast.error('UPI payment is not yet available');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center card-glass p-12 max-w-md"
          >
            <p className="text-xl text-slate-300 mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

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
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6"
            >
              <FiArrowLeft size={20} />
              Back to Cart
            </button>
            <h1 className="text-4xl font-bold text-gradient">Checkout</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Step 1: Shipping Address */}
              <motion.div
                className="card-glass p-8"
                layout
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= 1 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-white">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingAddress.name}
                        onChange={handleAddressChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      placeholder="123 Main St"
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleAddressChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="w-full btn-primary mt-4"
                  >
                    Continue to Payment
                  </motion.button>
                </div>
              </motion.div>

              {/* Step 2: Payment Method */}
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-glass p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= 2 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      2
                    </div>
                    <h2 className="text-2xl font-bold text-white">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive your order' },
                      { id: 'razorpay', name: 'Credit/Debit Card & UPI', description: 'Secure payment with Razorpay' },
                      { id: 'upi', name: 'UPI', description: 'Fast UPI payment (Coming Soon)' }
                    ].map((method) => (
                      <motion.label
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all"
                        style={{
                          borderColor: paymentMethod === method.id ? '#06b6d4' : '#475569',
                          backgroundColor: paymentMethod === method.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          disabled={method.id === 'upi'}
                          className="w-5 h-5"
                        />
                        <div>
                          <p className="font-semibold text-white">{method.name}</p>
                          <p className="text-sm text-slate-400">{method.description}</p>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(3)}
                    disabled={paymentMethod === 'upi'}
                    className="w-full btn-primary mt-6 disabled:opacity-50"
                  >
                    Review Order
                  </motion.button>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-glass p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-cyan-500 text-white">
                      3
                    </div>
                    <h2 className="text-2xl font-bold text-white">Order Review</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Shipping Address Review */}
                    <div>
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <FiMapPin size={18} />
                        Shipping Address
                      </h3>
                      <p className="text-slate-300 text-sm">
                        {shippingAddress.name} • {shippingAddress.phone}<br />
                        {shippingAddress.street}, {shippingAddress.city}<br />
                        {shippingAddress.state} {shippingAddress.zipCode}, {shippingAddress.country}
                      </p>
                    </div>

                    {/* Payment Method Review */}
                    <div>
                      <h3 className="font-semibold text-white mb-2">Payment Method</h3>
                      <p className="text-slate-300 text-sm">
                        {paymentMethod === 'cod' ? 'Cash on Delivery' :
                         paymentMethod === 'razorpay' ? 'Credit/Debit Card & UPI' : 'UPI'}
                      </p>
                    </div>

                    {/* Items Summary */}
                    <div className="bg-slate-800 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3">Order Items ({cart.length})</h3>
                      <div className="space-y-2 text-sm text-slate-300">
                        {cart.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                            <span>₹{(item.product?.price || item.price) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 h-fit"
            >
              <div className="card-glass p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>

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

                <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300 space-y-2">
                  <p>✓ Secure checkout with SSL</p>
                  <p>✓ 100% buyer protection</p>
                  <p>✓ Easy returns within 7 days</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
