import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import Layout from '../components/Layout';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('customer');
  const { login, isLoading, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if (response?.user) {
        const userData = response.user;
        setTimeout(() => {
          if (userData.role === 'seller') {
            navigate('/seller/dashboard');
          } else if (userData.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error toast is already shown by the store
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google signin failed. Please try again.');
      return;
    }

    try {
      const res = await googleLogin(credentialResponse.credential);
      const userData = res.user;
      if (userData.role === 'seller') {
        navigate('/seller/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed. Please try again.');
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your LocalHub account</p>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={itemVariants}
            className="card-glass p-8 backdrop-blur-2xl border border-white/10"
          >
            {/* User Type Toggle */}
            <motion.div variants={itemVariants} className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
              {['customer', 'seller', 'admin'].map((type) => (
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Email Address
                </label>
                <div className="input-group">
                  <FiMail className="input-icon" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field input-field-with-icon"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Password
                </label>
                <div className="input-group">
                  <FiLock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember & Forgot */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-slate-600 bg-slate-800 text-cyan-500"
                  />
                  <span className="text-slate-400">Remember me</span>
                </label>
                <a href="#" className="text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </a>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="my-6 flex items-center gap-4">
              <div className="h-px bg-slate-700 flex-1" />
              <span className="text-slate-500 text-sm">OR</span>
              <div className="h-px bg-slate-700 flex-1" />
            </motion.div>

            {/* Social Login */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                shape="rectangular"
                size="large"
              />
              <button
                type="button"
                className="btn-secondary py-2"
                disabled
              >
                GitHub (Coming Soon)
              </button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.p variants={itemVariants} className="text-center text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign up
              </Link>
            </motion.p>
          </motion.div>

          {/* Background Elements */}
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="fixed bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="fixed bottom-40 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10"
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
