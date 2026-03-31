const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add to Cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID and quantity',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        cartItems: [
          {
            product: productId,
            quantity,
            price: product.price,
            seller: product.seller,
          }
        ],
      });
    } else {
      const itemIndex = cart.cartItems.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        cart.cartItems.push({
          product: productId,
          quantity,
          price: product.price,
          seller: product.seller,
        });
      }
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: await cart.populate('cartItems.product'),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('cartItems.product')
      .populate('cartItems.seller', 'shopName');

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          cartItems: [],
          totalPrice: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.cartItems = cart.cartItems.filter(
      item => item.product.toString() !== productId
    );

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: await cart.populate('cartItems.product'),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Cart Item Quantity
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.cartItems.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    cart.cartItems[itemIndex].quantity = quantity;
    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Quantity updated',
      cart: await cart.populate('cartItems.product'),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear Cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
