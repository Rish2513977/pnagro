import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pnagro_secret_jwt_key_2026_super_secure';

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length >= 2 && parts[1] && parts[1] !== 'null' && parts[1] !== 'undefined') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, please log in',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired',
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access restricted to administrators only. You don't have permission to perform this action.",
    });
  }
};

export const ownerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access restricted to equipment owners and administrators. You don't have permission to perform this action.",
    });
  }
};

export const farmerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'farmer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access restricted to registered farmers and administrators. You don't have permission to perform this action.",
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${roles.join(', ')}]. Your current role is: ${req.user?.role || 'guest'}`,
      });
    }
    next();
  };
};
