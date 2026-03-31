import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowLeft, FiStar, FiChevronDown } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useProductStore, useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductDetails, selectedProduct } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    getProductDetails(id);
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(id, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!selectedProduct) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-slate-400">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { name, description, price, originalPrice, discount, stock, category, seller, images, ratings, numOfReviews, reviews, specifications } = selectedProduct;

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
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8"
          >
            <FiArrowLeft size={20} />
            Back
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Product Image */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center"
            >
              <div className="card-glass p-8 w-full aspect-square flex items-center justify-center text-9xl rounded-2xl relative overflow-hidden group">
                {images && images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${images[0].url}`}
                    alt={name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-9xl group-hover:scale-110 transition-transform duration-300">
                    {['🎴', '👟', '💊', '📱'][Math.floor(Math.random() * 4)]}
                  </div>
                )}
                {discount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold"
                  >
                    {discount}% OFF
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div variants={containerVariants} className="space-y-6">
              {/* Title & Category */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge badge-info">{category}</span>
                  {stock > 0 ? (
                    <span className="badge badge-success">In Stock ({stock})</span>
                  ) : (
                    <span className="badge badge-danger">Out of Stock</span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">{name}</h1>
              </motion.div>

              {/* Seller Info */}
              <motion.div
                variants={itemVariants}
                className="card-glass p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl">
                  {seller?.shopName?.[0] || '🏪'}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Sold by</p>
                  <p className="font-semibold text-white">{seller?.shopName}</p>
                </div>
              </motion.div>

              {/* Price */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-cyan-400">₹{price}</span>
                  {originalPrice && (
                    <span className="text-xl text-slate-400 line-through">₹{originalPrice}</span>
                  )}
                </div>
                <p className="text-slate-400">
                  You save ₹{originalPrice ? originalPrice - price : 0}
                </p>
              </motion.div>

              {/* Rating */}
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={20}
                      className={i < Math.round(ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
                <span className="text-slate-300">{ratings} ({numOfReviews} reviews)</span>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{description}</p>
              </motion.div>

              {/* Specifications */}
              {specifications && Object.keys(specifications).length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-white mb-3">Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-slate-700">
                        <span className="text-slate-400">{key}</span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quantity & Add to Cart */}
              <motion.div variants={itemVariants} className="space-y-4 pt-6 border-t border-slate-700">
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">Quantity:</span>
                  <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 hover:bg-slate-700 rounded"
                      disabled={stock === 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-12 bg-slate-800 text-white text-center border-0"
                      max={stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="px-3 py-1 hover:bg-slate-700 rounded"
                      disabled={stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart size={20} />
                  {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </motion.button>

                <button className="w-full btn-secondary">
                  Buy Now
                </button>
              </motion.div>

              {/* Shipping Info */}
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg p-4">
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>✓ Free shipping on orders above ₹1000</li>
                  <li>✓ 7-day money-back guarantee</li>
                  <li>✓ Cash on delivery available</li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 pt-12 border-t border-slate-700"
          >
            <motion.button
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center gap-2 text-2xl font-bold text-gradient mb-8 hover:opacity-80 transition-opacity"
            >
              Customer Reviews
              <FiChevronDown className={`transform transition-transform ${showReviews ? 'rotate-180' : ''}`} />
            </motion.button>

            {showReviews && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6"
              >
                {reviews && reviews.length > 0 ? (
                  reviews.map((review, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="card-glass p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{review.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300">{review.comment}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-400">No reviews yet. Be the first to review!</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
