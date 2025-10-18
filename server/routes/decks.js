const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDeck,
  getDecks,
  getDeck,
  deleteDeck
} = require('../controllers/deckController');

/**
 * Deck Routes
 * All routes require authentication
 */

// Create deck with file upload (uses multer middleware)
router.post('/', protect, upload.single('file'), createDeck);

// Get all decks for current user
router.get('/', protect, getDecks);

// Get single deck
router.get('/:id', protect, getDeck);

// Delete deck
router.delete('/:id', protect, deleteDeck);

module.exports = router;
