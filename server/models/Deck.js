const mongoose = require('mongoose');

/**
 * Deck Schema
 * Represents a collection of study material from an uploaded document
 */
const deckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  subject: {
    type: String,
    trim: true,
    default: 'General'
  },
  description: {
    type: String,
    trim: true
  },
  sourceFile: {
    filename: String,
    url: String,
    publicId: String, // For Cloudinary
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  extractedText: {
    type: String,
    select: false // Don't return this by default (can be large)
  },
  summary: {
    type: String
  },
  lastStudied: {
    type: Date
  },
  totalCards: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Create index on userId for faster queries
 * (Find all decks for a user quickly)
 */
deckSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Deck', deckSchema);
