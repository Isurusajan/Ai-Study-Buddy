const express = require('express');
const router = express.Router();
const { register, login, getMe, startStudySession, endStudySession } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * Authentication Routes
 *
 * POST /api/auth/register           - Register new user
 * POST /api/auth/login              - Login user
 * GET  /api/auth/me                 - Get current user (protected)
 * POST /api/auth/study-session-start - Start study session (protected)
 * POST /api/auth/study-session-end   - End study session (protected)
 */

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (requires authentication)
router.get('/me', protect, getMe);
router.post('/study-session-start', protect, startStudySession);
router.post('/study-session-end', protect, endStudySession);

module.exports = router;
