import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTrendingUp, FiUsers, FiPackage } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useProductStore } from '../store';

const Home = () => {
const { products, fetchProducts } = useProductStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [localProducts, setLocalProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data?.products) {
        setLocalProducts(data.products.slice(0, 8));
      }
    });
  }, []);

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

  const stats = [
    { icon: FiUsers, label: 'Active Vendors', value: '4+' },
    { icon: FiPackage, label: 'Products', value: '1000+' },
    { icon: FiTrendingUp, label: 'Happy Customers', value: '10K+' },
  ];

  const vendors = [
    { name: 'Kamla Printers', category: 'Wedding Cards', emoji: '🎴' },
    { name: 'Pioneer Shoes', category: 'Footwear', emoji: '👟' },
    { name: '24/7 Medicine', category: 'Medicine', emoji: '💊' },
    { name: 'Sharma Electronics', category: 'Electronics', emoji: '📱' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background Elements */}
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [30, 0, 30] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={containerVariants}>
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl font-bold text-gradient mb-6 leading-tight"
              >
                Shop Local,<br />
                <span className="text-cyan-400">Support Community</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg text-slate-300 mb-8 leading-relaxed"
              >
                Discover amazing products from trusted local vendors. From wedding cards to electronics, find everything you need while supporting your community.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/products"
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  Start Shopping
                  <FiArrowRight size={20} />
                </Link>
<button 
  className="btn-secondary" 
  onClick={() => user ? navigate('/seller/dashboard') : navigate('/login')}
>
  Become a Vendor
</button>
              </motion.div>
            </motion.div>

            {/* Right - Animated Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              {vendors.map((vendor, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="card-glass p-6 backdrop-blur-xl text-center group cursor-pointer"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {vendor.emoji}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{vendor.name}</h3>
                  <p className="text-xs text-slate-400">{vendor.category}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-y border-slate-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                    className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg mb-4"
                  >
                    <Icon className="text-cyan-400" size={32} />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gradient mb-2">{stat.value}</h3>
                  <p className="text-slate-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gradient mb-4">Featured Products</h2>
            <p className="text-slate-400">Discover our latest and most popular items</p>
          </motion.div>

          {localProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {localProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="card-glass group overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${product.images[0].url}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {['🎴', '👟', '💊', '📱'][Math.floor(Math.random() * 4)]}
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <Link
                        to={`/product/${product._id}`}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
                      >
                        View Details
                      </Link>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-1">
                      {product.seller?.shopName || 'Local Vendor'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-cyan-400">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-slate-400 line-through ml-2">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="badge badge-success">{product.discount}% off</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-slate-400">({product.numOfReviews})</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-slate-400">No products available yet</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="btn-primary inline-flex items-center gap-2"
            >
              View All Products
              <FiArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-pink-600/20 border border-slate-700/50 rounded-2xl mx-4 md:mx-8 my-16"
      >
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Join thousands of happy customers shopping from local vendors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">
                Start Shopping Now
              </Link>
              <button className="btn-secondary">Learn More</button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
};

export default Home;
