const mongoose = require('mongoose');

/**
 * Quiz Schema
 * Tracks completed quizzes for each user
 */
const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      userAnswer: String,
      isCorrect: Boolean
    }
  ],
  score: {
    type: Number,
    default: 0 // out of 100
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Index for faster queries
 */
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ userId: 1, deckId: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
