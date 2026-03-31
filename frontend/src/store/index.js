import create from 'zustand';
import { authAPI, cartAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isInitialized: false,

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const { data } = await authAPI.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ user: data.user, token, isInitialized: true });
      } catch (error) {
        console.error('Failed to verify auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
      toast.success('Login successful!');
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
      toast.success('Registration successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    toast.success('Logged out successfully');
  },

  googleLogin: async (googleToken) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.googleLogin(googleToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
      toast.success('Google login successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await authAPI.updateProfile(profileData);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user });
      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  },
}));

export const useCartStore = create((set, get) => ({
  cart: [],
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartAPI.getCart();
      set({ cart: data.cart.cartItems || [], totalPrice: data.cart.totalPrice || 0 });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    try {
      const { data } = await cartAPI.addToCart({ productId, quantity });
      set({ cart: data.cart.cartItems || [], totalPrice: data.cart.totalPrice || 0 });
      toast.success('Item added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const { data } = await cartAPI.removeFromCart(productId);
      set({ cart: data.cart.cartItems || [], totalPrice: data.cart.totalPrice || 0 });
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      throw error;
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const { data } = await cartAPI.updateCartQuantity(productId, { quantity });
      set({ cart: data.cart.cartItems || [], totalPrice: data.cart.totalPrice || 0 });
    } catch (error) {
      toast.error('Failed to update quantity');
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clearCart();
      set({ cart: [], totalPrice: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      throw error;
    }
  },
}));

export const useProductStore = create((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  filters: {
    category: '',
    search: '',
    sortBy: 'newest',
    page: 1,
  },

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await productAPI.getAllProducts(filters);
      set({ products: data.products });
      return data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getProductDetails: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await productAPI.getProductDetails(id);
      set({ selectedProduct: data.product });
      return data.product;
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters, page: 1 },
    }));
  },
}));
