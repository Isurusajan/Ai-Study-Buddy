const mongoose = require('mongoose');

/**
 * Battle Room Schema
 * Represents an active or completed battle session
 */
const battleRoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  
  battleType: {
    type: String,
    enum: ['quick', 'private', 'tournament'],
    default: 'private'
  },
  
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  },
  
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    avatar: String,
    score: {
      type: Number,
      default: 0
    },
    answers: [{
      questionId: String,
      answer: String,
      correct: Boolean,
      timeTaken: Number, // milliseconds
      pointsEarned: {
        type: Number,
        default: 0
      },
      questionIndex: Number
    }],
    powerUpsUsed: [String],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  questions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    pointValue: {
      type: Number,
      default: 100
    },
    explanation: String,
    source: String
  }],
  
  settings: {
    maxPlayers: {
      type: Number,
      default: 4,
      min: 2,
      max: 8
    },
    questionsCount: {
      type: Number,
      default: 10,
      min: 5,
      max: 20
    },
    timePerQuestion: {
      type: Number,
      default: 15, // seconds
      min: 5,
      max: 60
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    allowPowerUps: {
      type: Boolean,
      default: true
    }
  },
  
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  startedAt: Date,
  finishedAt: Date,
  
  stats: {
    totalAnswered: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    topAccuracy: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
battleRoomSchema.index({ hostId: 1, createdAt: -1 });
battleRoomSchema.index({ 'players.userId': 1 });
battleRoomSchema.index({ status: 1 });

module.exports = mongoose.model('BattleRoom', battleRoomSchema);
