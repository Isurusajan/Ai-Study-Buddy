/**
 * Battle Utilities Service
 * Helper functions for battle management
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Deck = require('../models/Deck');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a unique room code
 * Format: STUDY + 6 random alphanumeric characters
 * @returns {String}
 */
function generateRoomCode() {
  return 'STUDY' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * Generate battle questions from a deck using Gemini AI
 * @param {String} deckId - MongoDB Deck ID
 * @param {Number} count - Number of questions to generate (5-20)
 * @param {String} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Array>} - Array of question objects
 */
async function generateBattleQuestions(deckId, count = 10, difficulty = 'medium') {
  try {
    // Fetch deck with extracted text (explicitly select it since it's hidden by default)
    const deck = await Deck.findById(deckId).select('+extractedText');
    
    if (!deck) {
      console.error('Deck not found:', deckId);
      throw new Error('Deck not found');
    }
    
    if (!deck.extractedText || deck.extractedText.trim() === '') {
      console.error('Deck has no extracted content:', deckId);
      // Generate placeholder questions if no content
      const placeholderQuestions = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        placeholderQuestions.push({
          id: `q${i + 1}`,
          question: `Sample Question ${i + 1}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          difficulty,
          pointValue: 100,
          explanation: `This is a placeholder question. Please ensure your study material is properly uploaded.`
        });
      }
      return placeholderQuestions;
    }
    
    // Limit text to prevent token overflow
    const textContent = deck.extractedText.substring(0, 8000);
    
    // Create prompt for Gemini
    const prompt = `
You are an expert educator creating multiple-choice quiz questions. Generate exactly ${count} unique ${difficulty} multiple-choice questions based on this study material:

STUDY MATERIAL:
${textContent}

REQUIREMENTS:
- Each question should be distinct and comprehensive
- Options should be plausible but clearly one correct answer
- Difficulty level: ${difficulty}
- Format output as valid JSON array only (no markdown code blocks)

Generate questions in this JSON format:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "difficulty": "${difficulty}",
    "pointValue": 100,
    "explanation": "Why Option A is correct..."
  }
]

IMPORTANT: Return ONLY the JSON array, no other text. Ensure it's valid JSON.`;

    // Call Gemini API (using latest available model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    console.log('Gemini response length:', responseText.length);
    
    // Parse JSON response
    let questions = [];
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText.substring(0, 500));
      console.error('Parse error:', parseError.message);
      // Return placeholder questions instead of failing
      const placeholderQuestions = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        placeholderQuestions.push({
          id: `q${i + 1}`,
          question: `Question ${i + 1}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          difficulty,
          pointValue: 100,
          explanation: 'Generated question'
        });
      }
      return placeholderQuestions;
    }
    
    // Validate and clean questions
    questions = questions.map((q, idx) => ({
      id: `q${idx + 1}`,
      question: q.question || '',
      options: (q.options || []).slice(0, 4), // Max 4 options
      correctAnswer: q.correctAnswer || q.options?.[0] || '',
      difficulty: q.difficulty || difficulty,
      pointValue: q.pointValue || 100,
      explanation: q.explanation || ''
    })).filter(q => q.question && q.options.length === 4);
    
    // Ensure we have enough questions
    if (questions.length < count) {
      console.warn(`Only generated ${questions.length} questions, requested ${count}`);
    }
    
    return questions.slice(0, count);
    
  } catch (error) {
    console.error('Error generating battle questions:', error);
    throw error;
  }
}

/**
 * Shuffle array (Fisher-Yates shuffle)
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle options within questions (keeps correct answer mapping)
 * @param {Array} questions
 * @returns {Array}
 */
function shuffleQuestionOptions(questions) {
  return questions.map(q => {
    const optionsWithIndex = q.options.map((opt, idx) => ({
      value: opt,
      originalIndex: idx,
      isCorrect: opt === q.correctAnswer
    }));
    
    // Shuffle options
    const shuffledOptions = shuffleArray(optionsWithIndex);
    
    return {
      ...q,
      options: shuffledOptions.map(o => o.value),
      correctAnswer: q.correctAnswer // Keep original correct answer
    };
  });
}

/**
 * Get power-up icon/emoji
 * @param {String} powerUpType
 * @returns {String}
 */
function getPowerUpIcon(powerUpType) {
  const icons = {
    '50-50': '➗',
    'time-freeze': '⏸️',
    'steal-points': '💥',
    'double-points': '⚡',
    'shield': '🛡️'
  };
  return icons[powerUpType] || '✨';
}

/**
 * Get power-up details
 * @returns {Object}
 */
function getPowerUpDetails() {
  return {
    '50-50': {
      name: '50-50',
      description: 'Remove 2 wrong answers',
      icon: '➗',
      usesPerBattle: 1
    },
    'time-freeze': {
      name: 'Time Freeze',
      description: 'Pause timer for 5 seconds for everyone',
      icon: '⏸️',
      usesPerBattle: 1
    },
    'steal-points': {
      name: 'Point Steal',
      description: 'Steal 100 points from the leader',
      icon: '💥',
      usesPerBattle: 1
    },
    'double-points': {
      name: 'Double Points',
      description: 'Next correct answer worth 2x points',
      icon: '⚡',
      usesPerBattle: 1
    },
    'shield': {
      name: 'Shield',
      description: 'Wrong answer doesn\'t lose points',
      icon: '🛡️',
      usesPerBattle: 1
    }
  };
}

/**
 * Check and award achievements
 * @param {Object} battleRoom - The completed battle room
 * @param {Object} playerStats - Player's current stats
 * @param {Object} playerResult - Player's battle result
 * @returns {Array} - New achievements earned
 */
function checkAchievements(battleRoom, playerStats, playerResult) {
  const achievements = [];
  const { achievementProgress } = playerStats;
  
  // First Win
  if (!achievementProgress.firstWin && playerResult.won) {
    achievements.push({
      id: 'first-win',
      name: 'First Victory',
      description: 'Win your first battle',
      icon: '🏆',
      reward: { powerUp: '50-50', xp: 100 }
    });
    achievementProgress.firstWin = true;
  }
  
  // Speed Demon (10 questions answered in average < 5 seconds each)
  if (!achievementProgress.speedDemon && playerResult.averageResponseTime < 5000) {
    achievements.push({
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Answer 10 questions averaging under 5 seconds each',
      icon: '⚡',
      reward: { powerUp: 'time-freeze', xp: 250 }
    });
    achievementProgress.speedDemon = true;
  }
  
  // Perfectionist (100% accuracy + win)
  if (!achievementProgress.perfectionist && playerResult.won && playerResult.accuracy === 100) {
    achievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Win a battle with 100% accuracy',
      icon: '💯',
      reward: { powerUp: 'double-points', xp: 500 }
    });
    achievementProgress.perfectionist = true;
  }
  
  // Comeback King (was in last place, then won)
  if (!achievementProgress.comebackKing && playerResult.won && playerResult.wasLastAtHalfway) {
    achievements.push({
      id: 'comeback-king',
      name: 'Comeback King',
      description: 'Win a battle after being last place at halfway',
      icon: '👑',
      reward: { powerUp: 'steal-points', xp: 300 }
    });
    achievementProgress.comebackKing = true;
  }
  
  // Study Warrior (10 win streak)
  if (playerStats.currentWinStreak >= 10 && achievementProgress.studyWarrior < 1) {
    achievements.push({
      id: 'study-warrior',
      name: 'Study Warrior',
      description: 'Win 10 battles in a row',
      icon: '⚔️',
      reward: { title: 'Warrior', xp: 1000 }
    });
    achievementProgress.studyWarrior = 1;
  }
  
  return achievements;
}

/**
 * Format player stats for leaderboard display
 * @param {Array} players
 * @returns {Array}
 */
function formatLeaderboardDisplay(players) {
  return players
    .sort((a, b) => b.score - a.score)
    .map((player, idx) => ({
      rank: idx + 1,
      userId: player.userId,
      username: player.username,
      avatar: player.avatar,
      score: player.score,
      accuracy: playerResult ? 
        ((playerResult.answers?.filter(a => a.correct).length || 0) / 
         (playerResult.answers?.length || 1) * 100).toFixed(1) + '%' : '0%',
      avgTime: playerResult ? 
        (playerResult.averageResponseTime / 1000).toFixed(1) + 's' : '0s'
    }));
}

module.exports = {
  generateRoomCode,
  generateBattleQuestions,
  shuffleArray,
  shuffleQuestionOptions,
  getPowerUpIcon,
  getPowerUpDetails,
  checkAchievements,
  formatLeaderboardDisplay
};
