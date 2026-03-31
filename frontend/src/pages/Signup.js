import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';

const Signup = () => {
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    shopName: '',
    category: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (userType === 'seller') {
      if (!formData.shopName.trim()) {
        alert('Please enter your shop name');
        return;
      }
      if (!formData.category) {
        alert('Please select a category');
        return;
      }
    }

    try {
      await register({
        ...formData,
        role: userType,
      });
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
    }
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
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Join LocalHub</h1>
            <p className="text-slate-400">Create your account and start shopping</p>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={itemVariants}
            className="card-glass p-8 backdrop-blur-2xl border border-white/10"
          >
            {/* User Type Toggle */}
            <motion.div variants={itemVariants} className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
              {['customer', 'seller'].map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={`flex-1 py-2 rounded font-semibold transition-all duration-300 capitalize ${
                    userType === type
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Full Name
                </label>
                <div className="input-group">
                  <FiUser className="input-icon" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="input-field input-field-with-icon"
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Email Address
                </label>
                <div className="input-group">
                  <FiMail className="input-icon" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input-field input-field-with-icon"
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Phone Number
                </label>
                <div className="input-group">
                  <FiPhone className="input-icon" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    className="input-field input-field-with-icon"
                  />
                </div>
              </motion.div>

              {/* Seller Fields */}
              {userType === 'seller' && (
                <>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      placeholder="Your Shop Name"
                      required
                      className="input-field"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="input-field bg-slate-800/50 border-slate-600/50 rounded-xl text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:border-slate-500 hover:bg-slate-800/70 transition-all duration-300 ease-in-out backdrop-blur-sm"
                    >
                      <option value="">Select Category</option>
                      <option value="Wedding Cards">Wedding Cards</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Other">Other</option>
                    </select>
                  </motion.div>
                </>
              )}

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Password
                </label>
                <div className="input-group">
                  <FiLock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input-field input-field-with-icon input-field-with-icon-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Confirm Password
                </label>
                <div className="input-group">
                  <FiLock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input-field input-field-with-icon input-field-with-icon-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Terms */}
              <motion.label variants={itemVariants} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500"
                />
                <span className="text-sm text-slate-400">
                  I agree to the{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">
                    Privacy Policy
                  </a>
                </span>
              </motion.label>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            {/* Login Link */}
            <motion.p variants={itemVariants} className="text-center text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Signup;
