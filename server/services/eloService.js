/**
 * ELO Rating System Service
 * Implements chess-style ELO rating calculation
 */

/**
 * Calculate new ELO ratings after a battle
 * @param {Object} winner - Winner's stats object with eloRating
 * @param {Object} loser - Loser's stats object with eloRating
 * @returns {Object} - { newWinnerRating, newLoserRating }
 */
function calculateEloRating(winner, loser) {
  const K = 32; // K-factor (32 is standard, higher = more volatile)
  
  // Expected scores based on ELO difference
  const expectedWinner = 1 / (1 + Math.pow(10, (loser.eloRating - winner.eloRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winner.eloRating - loser.eloRating) / 400));
  
  // Calculate new ratings
  const newWinnerRating = Math.round(winner.eloRating + K * (1 - expectedWinner));
  const newLoserRating = Math.round(loser.eloRating + K * (0 - expectedLoser));
  
  return {
    newWinnerRating,
    newLoserRating,
    winnerChange: newWinnerRating - winner.eloRating,
    loserChange: newLoserRating - loser.eloRating
  };
}

/**
 * Get rank tier based on ELO rating
 * @param {Number} eloRating
 * @returns {Object} - { rank, color, title }
 */
function getRankInfo(eloRating) {
  if (eloRating < 1000) {
    return { rank: 'Bronze', color: '#CD7F32', title: 'Bronze Beginner' };
  } else if (eloRating < 1200) {
    return { rank: 'Silver', color: '#C0C0C0', title: 'Silver Scholar' };
  } else if (eloRating < 1400) {
    return { rank: 'Gold', color: '#FFD700', title: 'Gold Guardian' };
  } else if (eloRating < 1600) {
    return { rank: 'Platinum', color: '#E5E4E2', title: 'Platinum Pro' };
  } else if (eloRating < 1800) {
    return { rank: 'Diamond', color: '#B9F2FF', title: 'Diamond Dominator' };
  } else {
    return { rank: 'Master', color: '#FF6347', title: 'Master Mind' };
  }
}

/**
 * Calculate ELO change for battle-royale style multi-player battles
 * @param {Array} players - Array of player stats objects
 * @param {Array} finalPlacement - Array of userIds in final placement order
 * @returns {Object} - { userId: eloChange }
 */
function calculateMultiplayerElo(players, finalPlacement) {
  const eloChanges = {};
  const K = 32;
  
  // For each player, calculate ELO change based on placement and opponents
  finalPlacement.forEach((userId, placement) => {
    const player = players.find(p => p.userId.toString() === userId.toString());
    if (!player) return;
    
    let totalChange = 0;
    
    // Compare against each opponent
    players.forEach(opponent => {
      if (opponent.userId.toString() === userId.toString()) return;
      
      const opponentPlacement = finalPlacement.indexOf(opponent.userId.toString());
      const didPlayerWin = placement < opponentPlacement ? 1 : 0;
      
      const expected = 1 / (1 + Math.pow(10, (opponent.eloRating - player.eloRating) / 400));
      const change = K * (didPlayerWin - expected);
      totalChange += change;
    });
    
    eloChanges[userId] = Math.round(totalChange);
  });
  
  return eloChanges;
}

/**
 * Calculate points earned for an answer
 * @param {Boolean} isCorrect
 * @param {Number} basePoints
 * @param {Number} timeTaken - milliseconds
 * @param {Number} timePerQuestion - seconds
 * @returns {Number} - Points earned
 */
function calculatePoints(isCorrect, basePoints, timeTaken, timePerQuestion) {
  if (!isCorrect) return 0;
  
  const baseScore = basePoints;
  
  // Speed bonus: faster = more points
  const timeTakenSeconds = timeTaken / 1000;
  const speedFactor = Math.max(0, (timePerQuestion - timeTakenSeconds) / timePerQuestion);
  const speedBonus = Math.round(baseScore * 0.5 * speedFactor); // Max 50% bonus
  
  return baseScore + speedBonus;
}

/**
 * Calculate accuracy percentage
 * @param {Array} answers - Array of answer objects with 'correct' boolean
 * @returns {Number} - Accuracy as percentage (0-100)
 */
function calculateAccuracy(answers) {
  if (answers.length === 0) return 0;
  const correctCount = answers.filter(a => a.correct).length;
  return parseFloat((correctCount / answers.length * 100).toFixed(1));
}

/**
 * Calculate average response time in milliseconds
 * @param {Array} answers - Array of answer objects with 'timeTaken'
 * @returns {Number} - Average time in milliseconds
 */
function calculateAverageResponseTime(answers) {
  if (answers.length === 0) return 0;
  const totalTime = answers.reduce((sum, a) => sum + a.timeTaken, 0);
  return Math.round(totalTime / answers.length);
}

module.exports = {
  calculateEloRating,
  getRankInfo,
  calculateMultiplayerElo,
  calculatePoints,
  calculateAccuracy,
  calculateAverageResponseTime
};
