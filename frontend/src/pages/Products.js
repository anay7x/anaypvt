import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useProductStore } from '../store';

const Products = () => {
  const { products, fetchProducts, filters, setFilters } = useProductStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const categories = ['Wedding Cards', 'Footwear', 'Medicine', 'Electronics'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  const handleCategoryChange = (category) => {
    setFilters({
      category: filters.category === category ? '' : category,
    });
  };

  const handleSearchChange = (search) => {
    setFilters({ search });
  };

  const handleSortChange = (sortBy) => {
    setFilters({ sortBy });
  };

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
            <h1 className="text-4xl font-bold text-gradient mb-4">Our Products</h1>
            <p className="text-slate-400 mb-6">
              Browse our amazing collection from local vendors
            </p>

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-3 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field pl-12 w-full max-w-md"
              />
            </div>
          </motion.div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="card-glass p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FiFilter size={20} />
                    Filters
                  </h3>
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <h4 className="font-semibold text-white mb-4">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <motion.label
                        key={category}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.category === category}
                          onChange={() => handleCategoryChange(category)}
                          className="rounded border-slate-600 bg-slate-800 text-cyan-500"
                        />
                        <span className="text-slate-300 hover:text-white transition-colors">
                          {category}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="font-semibold text-white mb-4">Sort By</h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input-field w-full"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <FiFilter size={20} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </motion.button>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 card-glass p-6"
                >
                  {/* Categories */}
                  <h4 className="font-semibold text-white mb-3">Categories</h4>
                  <div className="space-y-2 mb-6">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.category === category}
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span className="text-slate-300">{category}</span>
                      </label>
                    ))}
                  </div>

                  {/* Sort */}
                  <h4 className="font-semibold text-white mb-3">Sort By</h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input-field w-full"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {products && products.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                      className="card-glass group overflow-hidden cursor-pointer"
                    >
                      {/* Image */}
                      <Link to={`/product/${product._id}`} className="block">
                        <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`http://localhost:5000${product.images[0].url}`}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                              {['🎴', '👟', '💊', '📱'][Math.floor(Math.random() * 4)]}
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                          >
                            <span className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold">
                              View Details
                            </span>
                          </motion.div>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-5">
                        <Link to={`/product/${product._id}`} className="block group">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-sm text-slate-400 mb-3 line-clamp-1">
                          {product.seller?.shopName || 'Local Vendor'}
                        </p>

                        <div className="flex items-center justify-between mb-3">
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
                          {product.discount > 0 && (
                            <span className="badge badge-success">{product.discount}%</span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-400">★★★★★</span>
                          <span className="text-slate-400">({product.numOfReviews})</span>
                        </div>

                        {/* Stock Status */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3"
                        >
                          {product.stock > 0 ? (
                            <span className="badge badge-success text-xs">In Stock</span>
                          ) : (
                            <span className="badge badge-danger text-xs">Out of Stock</span>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <p className="text-xl text-slate-400 mb-4">No products found</p>
                  <p className="text-slate-500">Try adjusting your filters or search query</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
