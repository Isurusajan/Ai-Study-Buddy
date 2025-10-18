const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateFlashcardsForDeck,
  getFlashcards,
  getDueFlashcards,
  reviewFlashcard,
  deleteFlashcard
} = require('../controllers/flashcardController');

/**
 * Flashcard Routes
 * All routes require authentication
 */

// Generate flashcards for a deck
router.post('/decks/:deckId/generate', protect, generateFlashcardsForDeck);

// Get all flashcards for a deck
router.get('/decks/:deckId', protect, getFlashcards);

// Get due flashcards for review
router.get('/decks/:deckId/due', protect, getDueFlashcards);

// Submit flashcard review
router.put('/:id/review', protect, reviewFlashcard);

// Delete flashcard
router.delete('/:id', protect, deleteFlashcard);

module.exports = router;
