import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiUser, FiShoppingBag } from 'react-icons/fi';
import { AiOutlineHome } from 'react-icons/ai';
import { useAuthStore, useCartStore } from '../store';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const cartItemsCount = cart.length;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-slate-950/80 to-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-glow"
            >
              🛍️
            </motion.div>
            <span className="text-xl font-bold text-gradient">LocalHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200"
            >
              <AiOutlineHome size={20} />
              <span>Home</span>
            </Link>
            <Link
              to="/products"
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-200"
            >
              Shop
            </Link>
            {user?.role === 'seller' && (
              <Link
                to="/seller/dashboard"
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Admin
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link
                to="/dashboard"
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-200"
              >
                My Account
              </Link>
            )}
          </nav>

          {/* Right Side Items */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative group">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-slate-300 hover:text-cyan-400 transition-colors duration-200"
              >
                <FiShoppingCart size={24} />
              </motion.button>
              {cartItemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-slate-400">{user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors duration-200"
                >
                  <FiLogOut size={18} />
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-glow transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-cyan-400"
            >
{isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-slate-700/50"
          >
            <div className="flex flex-col gap-3 mt-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-300 hover:text-cyan-400 py-2"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-300 hover:text-cyan-400 py-2"
              >
                Shop
              </Link>
              {user?.role === 'seller' && (
                <Link
                  to="/seller/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-300 hover:text-cyan-400 py-2"
                >
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-300 hover:text-cyan-400 py-2"
                >
                  Admin Panel
                </Link>
              )}
              {user?.role === 'customer' && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-300 hover:text-cyan-400 py-2"
                >
                  My Account
                </Link>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 py-2 text-left"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-300 hover:text-cyan-400 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-300 hover:text-cyan-400 py-2"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

