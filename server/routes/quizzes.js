const express = require('express');
const router = express.Router();
const {
  saveQuizAttempt,
  getQuizCount,
  getUserQuizzes,
  getQuizStats
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

// All quiz routes require authentication
router.use(protect);

/**
 * POST /api/quizzes
 * Save a completed quiz attempt
 */
router.post('/', saveQuizAttempt);

/**
 * GET /api/quizzes/count
 * Get total number of quizzes completed by the user
 */
router.get('/count', getQuizCount);

/**
 * GET /api/quizzes/stats
 * Get quiz statistics (average score, total time, etc.)
 */
router.get('/stats', getQuizStats);

/**
 * GET /api/quizzes
 * Get all quizzes completed by the user
 */
router.get('/', getUserQuizzes);

module.exports = router;
