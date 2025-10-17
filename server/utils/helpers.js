const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {String} id - User ID
 * @returns {String} - JWT token
 *
 * JWT (JSON Web Token) contains:
 * - User ID
 * - Expiration time (30 days)
 * - Signature (using JWT_SECRET)
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload (data to encode)
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

/**
 * Send response with token
 * @param {Object} user - User object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      studyStreak: user.studyStreak,
      totalStudyTime: user.totalStudyTime
    }
  });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
