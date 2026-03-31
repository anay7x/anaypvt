import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect here - let the component handle it
      // This prevents infinite redirect loops
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch a custom event so App.js can handle the redirect
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product API
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductDetails: (id) => api.get(`/products/${id}`),
  createProduct: (data) => {
    // For FormData, don't set Content-Type - let browser set it automatically
    return api.post('/products', data, {
      headers: {
        'Content-Type': undefined, // Let browser set multipart/form-data
      },
    });
  },
  updateProduct: (id, data) => {
    return api.put(`/products/${id}`, data, {
      headers: {
        'Content-Type': undefined,
      },
    });
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getSellerProducts: () => api.get('/products/seller/my-products'),
  addReview: (id, data) => api.post(`/products/${id}/review`, data),
};

// Cart API
export const cartAPI = {
  addToCart: (data) => api.post('/cart/add', data),
  getCart: () => api.get('/cart'),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  updateCartQuantity: (productId, data) => api.put(`/cart/${productId}`, data),
  clearCart: () => api.delete('/cart'),
};

// Order API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  getSellerOrders: () => api.get('/orders/seller/orders'),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  getAllOrders: () => api.get('/orders/admin/all'),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payment/payment-intent', data),
  confirmPayment: (data) => api.post('/payment/confirm', data),
  getPaymentMethods: () => api.get('/payment/methods'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  approveSeller: (id) => api.put(`/admin/users/${id}/approve`),
  toggleUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getSalesReport: (params) => api.get('/admin/sales-report', { params }),
  getTopSellers: () => api.get('/admin/top-sellers'),

  // Admin Products
  getAllAdminProducts: (params) => api.get('/admin/products', { params }),
  createAdminProduct: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append('image', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateAdminProduct: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append('image', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteAdminProduct: (id) => api.delete(`/admin/products/${id}`),

};


export default api;
