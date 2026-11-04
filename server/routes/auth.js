import express from 'express';
import { User } from '../models/User.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (farmer, owner, contractor)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Security: Only allow registration for 'farmer' or 'owner'. Never allow 'admin' registration from public endpoint.
    const safeRole = role === 'owner' ? 'owner' : 'farmer';

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: safeRole,
      location: location || {
        state: 'Punjab',
        district: 'Ludhiana',
        pincode: '141001',
      },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token (supports email or phone number)
router.post('/login', async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginInput = (email || phone || identifier || '').trim();

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number and password',
      });
    }

    const cleanDigits = loginInput.replace(/[^0-9]/g, '');

    const queryConditions = [
      { email: loginInput.toLowerCase() },
      { phone: loginInput },
    ];

    if (cleanDigits.length >= 7) {
      queryConditions.push({ phone: { $regex: cleanDigits, $options: 'i' } });
    }

    const user = await User.findOne({ $or: queryConditions }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or user not found',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
});

// @route   POST /api/auth/social
// @desc    Authenticate with Google or Facebook OAuth
router.post('/social', async (req, res) => {
  try {
    const { email, name, avatar, phone, role, provider } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Social account email is required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Update avatar if not custom or missing
      if (avatar && (!user.avatar || user.avatar.includes('photo-1535713875002-d1d0cf377fde'))) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      // Generate a secure internal password hash satisfying Mongoose schema
      const randomPassword = 'OAuth_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      user = await User.create({
        name: name || (provider === 'google' ? 'Google Farmer' : 'Facebook User'),
        email: cleanEmail,
        password: randomPassword,
        phone: phone || '',
        role: role === 'owner' ? 'owner' : 'farmer',
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          pincode: '141001',
        },
        avatar: avatar || (provider === 'google'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'),
        verified: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during social authentication',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      location: req.user.location,
      avatar: req.user.avatar,
      verified: req.user.verified,
    },
  });
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, location, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location) user.location = { ...user.location, ...location };
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
});

export default router;
