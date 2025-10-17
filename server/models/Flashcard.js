const mongoose = require('mongoose');

/**
 * Flashcard Schema
 * Stores individual flashcards with spaced repetition data
 */
const flashcardSchema = new mongoose.Schema({
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },

  // ===== SPACED REPETITION ALGORITHM DATA =====

  /**
   * Ease Factor: Determines how quickly intervals increase
   * Default: 2.5 (standard SM-2 algorithm starting point)
   * Range: 1.3 - 2.5+
   * Higher = easier card (longer intervals)
   */
  easeFactor: {
    type: Number,
    default: 2.5,
    min: 1.3
  },

  /**
   * Interval: Days until next review
   * Starts at 1, then increases based on performance
   */
  interval: {
    type: Number,
    default: 1 // Review tomorrow
  },

  /**
   * Repetitions: Number of consecutive correct reviews
   * Resets to 0 when answered incorrectly
   */
  repetitions: {
    type: Number,
    default: 0
  },

  /**
   * Next Review Date: When this card should be shown again
   */
  nextReviewDate: {
    type: Date,
    default: function() {
      // Set to tomorrow by default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Start of day
      return tomorrow;
    }
  },

  /**
   * Last Reviewed: When user last saw this card
   */
  lastReviewed: {
    type: Date
  },

  // ===== PERFORMANCE TRACKING =====

  timesReviewed: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  timesIncorrect: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0 // in seconds
  }
}, {
  timestamps: true
});

/**
 * Create compound index for efficient queries
 * Find due cards for a specific deck quickly
 */
flashcardSchema.index({ deckId: 1, nextReviewDate: 1 });

/**
 * Virtual property: Calculate success rate
 */
flashcardSchema.virtual('successRate').get(function() {
  if (this.timesReviewed === 0) return 0;
  return Math.round((this.timesCorrect / this.timesReviewed) * 100);
});

// Make sure virtuals are included when converting to JSON
flashcardSchema.set('toJSON', { virtuals: true });
flashcardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
