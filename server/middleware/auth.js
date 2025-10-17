const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Routes Middleware
 * This checks if the user is authenticated before allowing access
 *
 * How it works:
 * 1. Check if Authorization header exists
 * 2. Extract JWT token from header
 * 3. Verify token is valid
 * 4. Find user from token and attach to request
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer TOKEN_HERE"
      token = req.headers.authorization.split(' ')[1];

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token and attach to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next(); // Continue to the next middleware/route handler
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = { protect };
