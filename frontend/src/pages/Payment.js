import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiX, FiCreditCard } from 'react-icons/fi';
import Layout from '../components/Layout';
import { paymentAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentForm = ({ orderId, address }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const { data } = await paymentAPI.createPaymentIntent({ orderId });
        setOrder(data);
      } catch (err) {
        setError('Failed to initialize payment');
        toast.error('Payment initialization failed');
      }
    };
    initPayment();
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;

    setIsProcessing(true);
    setError(null);

    try {
      const options = {
        key: order.key,
        amount: order.order.amount,
        currency: order.order.currency,
        name: 'LocalHub',
        description: 'Order Payment',
        order_id: order.order.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            await paymentAPI.confirmPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success('Payment successful! Order confirmed.');
            setTimeout(() => {
              navigate(`/order/${orderId}`);
            }, 2000);
          } catch (err) {
            setError('Payment verification failed');
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: address?.name || '',
          email: address?.email || '',
          contact: address?.phone || '',
        },
        notes: {
          address: `${address?.street}, ${address?.city}, ${address?.state} ${address?.zipCode}`,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      toast.error('Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <div className="text-center">
          <FiCreditCard className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Secure Payment with Razorpay
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Your payment information is encrypted and secure
          </p>

          {order && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Amount:</span>
                <span className="text-xl font-bold text-green-400">
                  ₹{order.amount}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FiX className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || !order}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <FiLock className="h-5 w-5 mr-2" />
                Pay ₹{order?.amount || '0'} with Razorpay
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 mt-4">
            Processed securely by Razorpay • PCI DSS Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, address } = location.state || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/checkout');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getOrder(orderId);
        setOrder(data.order);
      } catch (err) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-slate-700 border-t-cyan-400 rounded-full"
          />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center card-glass p-12 max-w-md"
          >
            <p className="text-xl text-slate-300 mb-6">Order not found</p>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
            >
              Back to Checkout
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-200 mb-2">Complete Payment</h1>
            <p className="text-slate-400">Secure payment processing with Razorpay</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glass p-6"
            >
              <h2 className="text-xl font-semibold text-slate-200 mb-6">Order Summary</h2>

              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-slate-200 font-medium">{item.name}</h3>
                      <p className="text-slate-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-slate-200 font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 mt-6 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-slate-200">Total Amount:</span>
                  <span className="text-green-400">₹{order.totalPrice}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <h3 className="text-slate-200 font-medium mb-2">Delivery Address</h3>
                <div className="text-slate-400 text-sm">
                  <p>{address?.name}</p>
                  <p>{address?.street}, {address?.city}</p>
                  <p>{address?.state} - {address?.zipCode}</p>
                  <p>{address?.phone}</p>
                </div>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PaymentForm orderId={orderId} address={address} />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
