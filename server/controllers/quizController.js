const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

/**
 * @desc    Save a completed quiz attempt
 * @route   POST /api/quizzes
 * @access  Private
 */
exports.saveQuizAttempt = async (req, res) => {
  try {
    const { deckId, questions, score, totalQuestions, correctAnswers, difficulty, timeSpent } = req.body;
    const userId = req.user.id;

    if (!deckId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz data' });
    }

    const quiz = new Quiz({
      userId,
      deckId,
      questions,
      score,
      totalQuestions,
      correctAnswers,
      difficulty,
      timeSpent
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz attempt saved successfully',
      quiz
    });
  } catch (error) {
    console.error('Save quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quiz attempt',
      error: error.message
    });
  }
};

/**
 * @desc    Get total quiz completions for a user
 * @route   GET /api/quizzes/count
 * @access  Private
 */
exports.getQuizCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Quiz.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get quiz count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz count',
      error: error.message
    });
  }
};

/**
 * @desc    Get all quiz attempts for a user
 * @route   GET /api/quizzes
 * @access  Private
 */
exports.getUserQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;

    const quizzes = await Quiz.find({ userId })
      .populate('deckId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      quizzes,
      total: quizzes.length
    });
  } catch (error) {
    console.error('Get user quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes',
      error: error.message
    });
  }
};

/**
 * @desc    Get quiz statistics for a user
 * @route   GET /api/quizzes/stats
 * @access  Private
 */
exports.getQuizStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = mongoose.Types.ObjectId(userId);

    const stats = await Quiz.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          totalTimeSpent: { $sum: '$timeSpent' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        highestScore: 0,
        lowestScore: 0
      }
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz statistics',
      error: error.message
    });
  }
};
