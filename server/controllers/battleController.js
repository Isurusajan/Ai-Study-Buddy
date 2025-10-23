/**
 * Battle Controller
 * Handles REST API endpoints for battle management
 */

const BattleRoom = require('../models/BattleRoom');
const UserStats = require('../models/UserStats');
const User = require('../models/User');
const Deck = require('../models/Deck');
const {
  generateRoomCode,
  generateBattleQuestions,
  checkAchievements
} = require('../services/battleService');
const {
  calculateEloRating,
  getRankInfo,
  calculateAccuracy,
  calculateAverageResponseTime
} = require('../services/eloService');

/**
 * Create a new battle room
 * POST /api/battles/create
 */
exports.createBattleRoom = async (req, res) => {
  try {
    const { userId } = req.user;
    const { deckId, battleType = 'private', maxPlayers = 4, difficulty = 'medium' } = req.body;
    
    // Validate inputs
    if (!deckId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Deck ID is required' 
      });
    }
    
    // Verify deck exists and belongs to user
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deck not found' 
      });
    }
    
    // Generate questions
    const questions = await generateBattleQuestions(deckId, 10, difficulty);
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate questions for battle'
      });
    }
    
    // Generate unique room code
    let roomCode = generateRoomCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await BattleRoom.findOne({ roomCode });
      if (!existing) {
        isUnique = true;
      } else {
        roomCode = generateRoomCode();
      }
    }
    
    // Create battle room
    const battleRoom = await BattleRoom.create({
      roomCode,
      hostId: userId,
      deckId,
      battleType,
      status: 'waiting',
      questions,
      settings: {
        maxPlayers,
        questionsCount: questions.length,
        timePerQuestion: 15,
        allowPowerUps: true
      }
    });
    
    // Populate user info
    await battleRoom.populate('hostId', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Battle room created successfully',
      data: {
        roomCode: battleRoom.roomCode,
        battleId: battleRoom._id,
        hostId: battleRoom.hostId._id,
        hostName: battleRoom.hostId.name,
        maxPlayers: battleRoom.settings.maxPlayers,
        questionsCount: battleRoom.settings.questionsCount,
        timePerQuestion: battleRoom.settings.timePerQuestion
      }
    });
    
  } catch (error) {
    console.error('Error creating battle room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating battle room',
      error: error.message
    });
  }
};

/**
 * Get battle room by code
 * GET /api/battles/:roomCode
 */
exports.getBattleRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const battleRoom = await BattleRoom.findOne({ roomCode })
      .populate('hostId', 'name email')
      .populate('deckId', 'title subject');
    
    if (!battleRoom) {
      return res.status(404).json({
        success: false,
        message: 'Battle room not found'
      });
    }
    
    // Don't send full questions until battle starts
    const questionCountOnly = { ...battleRoom.toObject() };
    if (battleRoom.status === 'waiting') {
      questionCountOnly.questions = questionCountOnly.questions.map(q => ({
        id: q.id
      }));
    }
    
    res.json({
      success: true,
      data: questionCountOnly
    });
    
  } catch (error) {
    console.error('Error fetching battle room:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching battle room'
    });
  }
};

/**
 * Get user's battle stats
 * GET /api/battles/stats/user
 */
exports.getUserBattleStats = async (req, res) => {
  try {
    const { userId } = req.user;
    
    let userStats = await UserStats.findOne({ userId });
    
    // Create initial stats if doesn't exist
    if (!userStats) {
      userStats = await UserStats.create({
        userId,
        totalBattles: 0,
        wins: 0,
        eloRating: 1000,
        rank: 'Bronze'
      });
    }
    
    res.json({
      success: true,
      data: {
        totalBattles: userStats.totalBattles,
        wins: userStats.wins,
        losses: userStats.losses,
        winRate: userStats.winRate,
        eloRating: userStats.eloRating,
        rank: userStats.rank,
        currentWinStreak: userStats.currentWinStreak,
        longestWinStreak: userStats.longestWinStreak,
        accuracyRate: userStats.accuracyRate,
        averageScore: userStats.averageScore,
        achievements: userStats.achievements
      }
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats'
    });
  }
};

/**
 * Get leaderboard
 * GET /api/battles/leaderboard?period=daily&limit=100
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'alltime', limit = 100 } = req.query;
    
    // Validate period
    if (!['daily', 'weekly', 'alltime', 'elo'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Use: daily, weekly, alltime, or elo'
      });
    }
    
    let query = {};
    
    if (period === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.updatedAt = { $gte: today };
    } else if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: weekAgo };
    }
    
    // Sort based on period
    let sortField = '-wins';
    if (period === 'elo') {
      sortField = '-eloRating';
    } else if (period === 'alltime') {
      sortField = '-totalBattles';
    }
    
    const leaderboard = await UserStats.find(query)
      .sort(sortField)
      .limit(parseInt(limit))
      .populate('userId', 'name email avatar');
    
    const formatted = leaderboard.map((stat, idx) => ({
      rank: idx + 1,
      userId: stat.userId._id,
      username: stat.userId.name,
      avatar: stat.userId.avatar || null,
      wins: stat.wins,
      totalBattles: stat.totalBattles,
      winRate: stat.winRate + '%',
      eloRating: stat.eloRating,
      rank: stat.rank,
      currentWinStreak: stat.currentWinStreak,
      accuracyRate: stat.accuracyRate + '%'
    }));
    
    res.json({
      success: true,
      period,
      data: formatted
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
};

/**
 * Get user's recent battles
 * GET /api/battles/history/user?limit=10
 */
exports.getUserBattleHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 10 } = req.query;
    
    const battles = await BattleRoom.find({
      'players.userId': userId,
      status: 'finished'
    })
      .sort({ finishedAt: -1 })
      .limit(parseInt(limit))
      .populate('hostId', 'name')
      .populate('deckId', 'title');
    
    const formatted = battles.map(battle => {
      const player = battle.players.find(p => p.userId.toString() === userId);
      const won = battle.winnerId?.toString() === userId;
      
      return {
        battleId: battle._id,
        deckName: battle.deckId.title,
        opponents: battle.players
          .filter(p => p.userId.toString() !== userId)
          .map(p => p.username),
        score: player.score,
        accuracy: ((player.answers.filter(a => a.correct).length / player.answers.length) * 100).toFixed(1),
        won,
        startedAt: battle.startedAt,
        finishedAt: battle.finishedAt,
        duration: Math.round((battle.finishedAt - battle.startedAt) / 1000)
      };
    });
    
    res.json({
      success: true,
      data: formatted
    });
    
  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching battle history'
    });
  }
};

/**
 * Get battle details (for spectating or review)
 * GET /api/battles/:battleId/details
 */
exports.getBattleDetails = async (req, res) => {
  try {
    const { battleId } = req.params;
    
    const battle = await BattleRoom.findById(battleId)
      .populate('hostId', 'name avatar')
      .populate('winnerId', 'name avatar')
      .populate('deckId', 'title subject');
    
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        roomCode: battle.roomCode,
        hostName: battle.hostId.name,
        deckName: battle.deckId.title,
        status: battle.status,
        winner: battle.winnerId ? {
          userId: battle.winnerId._id,
          name: battle.winnerId.name,
          avatar: battle.winnerId.avatar
        } : null,
        players: battle.players.map(p => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          score: p.score,
          accuracy: ((p.answers.filter(a => a.correct).length / p.answers.length) * 100).toFixed(1),
          correctAnswers: p.answers.filter(a => a.correct).length,
          totalAnswered: p.answers.length
        })),
        totalQuestions: battle.questions.length,
        startedAt: battle.startedAt,
        finishedAt: battle.finishedAt,
        duration: Math.round((battle.finishedAt - battle.startedAt) / 1000)
      }
    });
    
  } catch (error) {
    console.error('Error fetching battle details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching battle details'
    });
  }
};

module.exports = exports;
