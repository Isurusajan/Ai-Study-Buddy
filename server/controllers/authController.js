const User = require('../models/User');
const { sendTokenResponse } = require('../utils/helpers');
const { sendRegistrationEmail } = require('../services/emailService');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (password will be hashed automatically by the pre-save hook)
    const user = await User.create({
      name,
      email,
      password
    });

    // Send registration confirmation email (don't wait for it)
    sendRegistrationEmail(email, name).catch(err => {
      console.error('Warning: Failed to send registration email:', err.message);
    });

    // Send response with JWT token
    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches using our custom method
    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Send response with JWT token
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studyStreak: user.studyStreak,
        totalStudyTime: user.totalStudyTime,
        lastStudyDate: user.lastStudyDate,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Start a study session
 * @route   POST /api/auth/study-session-start
 * @access  Private (requires authentication)
 */
exports.startStudySession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Record study session start
    res.status(200).json({
      success: true,
      message: 'Study session started',
      sessionStart: new Date()
    });
  } catch (error) {
    console.error('Start study session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during study session start',
      error: error.message
    });
  }
};

/**
 * @desc    End a study session and update study time/streak
 * @route   POST /api/auth/study-session-end
 * @access  Private (requires authentication)
 */
exports.endStudySession = async (req, res) => {
  try {
    const { sessionDuration } = req.body; // Duration in seconds

    if (!sessionDuration || sessionDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session duration'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update total study time
    user.totalStudyTime = (user.totalStudyTime || 0) + sessionDuration;

    // Update study streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastStudyDate) {
      lastStudyDate.setHours(0, 0, 0, 0);
    }

    const todayTime = today.getTime();
    const lastStudyTime = lastStudyDate ? lastStudyDate.getTime() : 0;

    if (lastStudyTime === todayTime) {
      // Already studied today, keep same streak
    } else if (lastStudyTime === todayTime - 86400000) {
      // Studied yesterday, increment streak
      user.studyStreak = (user.studyStreak || 0) + 1;
    } else {
      // Didn't study yesterday, reset streak
      user.studyStreak = 1;
    }

    // Update last study date to today
    user.lastStudyDate = new Date();

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Study session ended and stats updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studyStreak: user.studyStreak,
        totalStudyTime: user.totalStudyTime,
        lastStudyDate: user.lastStudyDate,
        sessionDuration: sessionDuration
      }
    });
  } catch (error) {
    console.error('End study session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during study session end',
      error: error.message
    });
  }
};
