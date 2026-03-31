import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center pt-20">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
      <p className="text-slate-400 text-xl mb-8">Page not found</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, logout, isInitialized } = useAuthStore();
  const navigate = useNavigate();
  const [isHandlingUnauth, setIsHandlingUnauth] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (!isHandlingUnauth) {
        setIsHandlingUnauth(true);
        logout();
        navigate('/login');
        setTimeout(() => setIsHandlingUnauth(false), 1000);
      }
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [logout, navigate, isHandlingUnauth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />

      {/* User Dashboard */}
      {user && user.role === 'customer' && (
        <Route path="/dashboard" element={<UserDashboard />} />
      )}

      {/* Protected Routes */}
      {user?.role === 'seller' && (
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      )}

      {user?.role === 'admin' && (
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      )}

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Toaster position="top-right" />
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
