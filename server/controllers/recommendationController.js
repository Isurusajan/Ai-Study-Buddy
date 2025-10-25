const Deck = require('../models/Deck');
const User = require('../models/User');

// Get smart recommendations based on quiz performance
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('decks');

    if (!user || !user.decks || user.decks.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get all decks with their performance data
    const recommendations = [];

    for (const deck of user.decks) {
      const fullDeck = await Deck.findById(deck._id);
      
      if (!fullDeck) continue;

      // Calculate performance metrics
      const cards = fullDeck.cards || [];
      let totalAttempts = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let avgDifficulty = 0;

      cards.forEach(card => {
        if (card.quizAttempts && card.quizAttempts.length > 0) {
          totalAttempts += card.quizAttempts.length;
          const correct = card.quizAttempts.filter(a => a.isCorrect).length;
          correctAnswers += correct;
          incorrectAnswers += card.quizAttempts.length - correct;
        }
        avgDifficulty += card.difficulty || 1;
      });

      avgDifficulty = cards.length > 0 ? avgDifficulty / cards.length : 1;
      const scorePercentage = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

      // Skip if no attempts or already mastered
      if (totalAttempts === 0 || scorePercentage >= 85) continue;

      // Determine priority and difficulty
      let priority = 'low';
      let difficulty = 'easy';
      let reason = '';

      if (scorePercentage < 50) {
        priority = 'urgent';
        difficulty = 'hard';
        reason = `You're scoring below 50% on "${fullDeck.title}". This needs immediate attention! Focus on understanding the core concepts.`;
      } else if (scorePercentage < 70) {
        priority = 'high';
        difficulty = 'medium';
        reason = `You're close to mastering "${fullDeck.title}" with ${Math.round(scorePercentage)}%. A bit more practice will help!`;
      } else if (scorePercentage < 85) {
        priority = 'medium';
        difficulty = 'easy';
        reason = `Good progress on "${fullDeck.title}"! You're at ${Math.round(scorePercentage)}%. Keep practicing to reach 90%!`;
      }

      const estimatedTime = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;

      recommendations.push({
        deckId: fullDeck._id,
        topic: fullDeck.title,
        subject: fullDeck.category || 'General',
        currentScore: Math.round(scorePercentage),
        targetScore: 90,
        estimatedTime,
        priority,
        difficulty,
        reason,
        cardCount: cards.length,
        incorrectCount: incorrectAnswers,
        totalAttempts
      });
    }

    // Sort by priority (urgent first)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Return top 4 recommendations
    res.json({ 
      recommendations: recommendations.slice(0, 4),
      totalRecommendations: recommendations.length 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
};
