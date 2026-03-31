const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
    { expiresIn: '7d' }
  );
};

// Google Login/Signup
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required',
      });
    }

    // Verify the Google token
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      return res.status(500).json({
        success: false,
        message: 'Google Client ID is not configured on the server',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, given_name, family_name } = payload || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from Google authentication',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, generate token
      const tokenJwt = generateToken(user._id, user.role);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: tokenJwt,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          shopName: user.shopName,
          profileImage: user.profileImage,
        },
      });
    }

    // Create new user
    const fullName = name || `${given_name || ''} ${family_name || ''}`.trim() || 'Google User';

    user = await User.create({
      name: fullName,
      email,
      password: Math.random().toString(36).slice(-12) + 'GoogleAuth123!', // Random secure password
      phone: '0000000000', // Placeholder - user can update later
      role: 'customer', // Default role, can be changed to seller later
      profileImage: picture || null,
    });

    const tokenJwt = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: tokenJwt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};

// Register User
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, role, address, shopName, category } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Seller validation
    if (role === 'seller') {
      if (!shopName || !category) {
        return res.status(400).json({
          success: false,
          message: 'Please provide shop name and category for seller account',
        });
      }
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      address: address || {},
    };

    // Add seller-specific fields
    if (role === 'seller') {
      userData.shopName = shopName;
      userData.category = category;
    }

    // Create user
    const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        shopName: user.shopName || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        address,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
