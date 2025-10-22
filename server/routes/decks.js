const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDeck,
  getDecks,
  getDeck,
  deleteDeck,
  generateDeckSummary,
  generateQuiz,
  downloadSummary,
  generateShortAnswerQuestions,
  generateLongAnswerQuestions,
  askQuestion
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

// Generate summary for deck (with level: brief, medium, detailed)
router.post('/:id/summary', protect, generateDeckSummary);

// Download summary as file
router.get('/:id/summary/download', protect, downloadSummary);

// Generate MCQ quiz (with count and difficulty: easy, medium, hard)
router.post('/:id/quiz', protect, generateQuiz);

// Generate short answer questions (with count and difficulty)
router.post('/:id/short-answer', protect, generateShortAnswerQuestions);

// Generate long answer/essay questions (with count and difficulty)
router.post('/:id/long-answer', protect, generateLongAnswerQuestions);

// Ask a question about the deck content
router.post('/:id/ask', protect, askQuestion);

module.exports = router;
