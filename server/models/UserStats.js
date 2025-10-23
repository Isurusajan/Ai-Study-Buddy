const mongoose = require('mongoose');

/**
 * User Stats Schema
 * Tracks all battle-related statistics for each user
 */
const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Battle Statistics
  totalBattles: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  winRate: {
    type: Number,
    default: 0
  },
  
  // ELO Rating System
  eloRating: {
    type: Number,
    default: 1000 // Standard starting rating
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'],
    default: 'Bronze'
  },
  leaderboardPosition: Number,
  
  // Streaks
  currentWinStreak: {
    type: Number,
    default: 0
  },
  longestWinStreak: {
    type: Number,
    default: 0
  },
  dailyStudyStreak: {
    type: Number,
    default: 0
  },
  lastBattleDate: Date,
  
  // Performance Metrics
  averageScore: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0 // in milliseconds
  },
  accuracyRate: {
    type: Number,
    default: 0 // percentage
  },
  fastestWin: {
    type: Number,
    default: 0 // in seconds
  },
  
  // Power-ups
  powerUpsEarned: {
    type: Number,
    default: 0
  },
  powerUpsUsed: {
    type: Number,
    default: 0
  },
  
  // Achievements
  achievements: [{
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  
  // Achievement Flags (to check progress)
  achievementProgress: {
    firstWin: {
      type: Boolean,
      default: false
    },
    speedDemon: {
      type: Boolean,
      default: false
    },
    perfectionist: {
      type: Boolean,
      default: false
    },
    comebackKing: {
      type: Boolean,
      default: false
    },
    studyWarrior: {
      type: Number,
      default: 0 // win streak counter
    },
    bosSlayer: {
      type: Boolean,
      default: false
    }
  },
  
  // Subject-specific stats
  subjectStats: [{
    subject: String,
    battlesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  }],
  
  // Preferences
  preferredPowerUps: [String],
  preferredDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for faster queries
userStatsSchema.index({ eloRating: -1 });
userStatsSchema.index({ winRate: -1 });
userStatsSchema.index({ currentWinStreak: -1 });

// Method to calculate win rate
userStatsSchema.methods.calculateWinRate = function() {
  if (this.totalBattles === 0) return 0;
  return (this.wins / this.totalBattles * 100).toFixed(2);
};

// Method to get rank based on ELO
userStatsSchema.methods.getRank = function() {
  if (this.eloRating < 1000) return 'Bronze';
  if (this.eloRating < 1200) return 'Silver';
  if (this.eloRating < 1400) return 'Gold';
  if (this.eloRating < 1600) return 'Platinum';
  if (this.eloRating < 1800) return 'Diamond';
  return 'Master';
};

// Pre-save hook to update rank
userStatsSchema.pre('save', function(next) {
  this.rank = this.getRank();
  this.winRate = parseFloat(this.calculateWinRate());
  next();
});

module.exports = mongoose.model('UserStats', userStatsSchema);
