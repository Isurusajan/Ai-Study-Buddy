/**
 * Battle Routes
 * Routes for battle-related endpoints
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const battleController = require('../controllers/battleController');

// Create a new battle room
router.post('/create', protect, battleController.createBattleRoom);

// Get battle room by code
router.get('/:roomCode', battleController.getBattleRoom);

// Get user's battle stats
router.get('/stats/user', protect, battleController.getUserBattleStats);

// Get leaderboard
router.get('/leaderboard', battleController.getLeaderboard);

// Get user's battle history
router.get('/history/user', protect, battleController.getUserBattleHistory);

// Get battle details
router.get('/:battleId/details', battleController.getBattleDetails);

module.exports = router;
