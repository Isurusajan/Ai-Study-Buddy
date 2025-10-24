/**
 * Battle Socket.io Events
 * Handles real-time multiplayer battle interactions
 */

const mongoose = require('mongoose');
const BattleRoom = require('../models/BattleRoom');
const UserStats = require('../models/UserStats');
const User = require('../models/User');
const {
  calculateEloRating,
  calculatePoints,
  calculateAccuracy,
  calculateAverageResponseTime
} = require('../services/eloService');
const { checkAchievements, shuffleArray } = require('../services/battleService');

// Store active rooms in memory for performance
const activeRooms = new Map();

// Store question timers
const questionTimers = new Map();

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    
    /**
     * JOIN ROOM AS HOST event
     * Host joins the socket room after creating it via REST API
     */
    socket.on('join-room-as-host', async (data) => {
      try {
        const { roomCode, userId } = data;
        console.log('👑 Host joining room:', { roomCode, userId });
        
        // Join socket to room (this enables receiving future broadcasts)
        socket.join(roomCode);
        
        // Store socket info
        socket.roomCode = roomCode;
        socket.userId = userId;
        
        console.log(`✅ Host joined socket room ${roomCode}`);
      } catch (error) {
        console.error('❌ Error host joining room:', error.message);
        socket.emit('error', { message: 'Failed to join room: ' + error.message });
      }
    });
    
    /**
     * JOIN ROOM event
     * Player joins a waiting battle room
     */
    socket.on('join-room', async (data) => {
      try {
        const { roomCode, userId, username, avatar } = data;
        
        console.log('👥 Join room attempt:', { roomCode, userId, username });
        
        // Fetch battle room from database (case-insensitive search)
        let battleRoom = await BattleRoom.findOne({ 
          roomCode: roomCode.toUpperCase(), 
          status: 'waiting' 
        });
        
        if (!battleRoom) {
          console.error('❌ Room not found:', roomCode);
          return socket.emit('error', { message: 'Room not found or already started' });
        }
        
        console.log('✅ Room found:', battleRoom.roomCode, 'Players:', battleRoom.players.length);
        
        // Check if player already in room
        console.log('🔍 Checking for existing player...');
        console.log('Players in room:', battleRoom.players.map(p => ({
          userId: p.userId.toString(),
          username: p.username
        })));
        console.log('Joining user ID:', userId, 'Type:', typeof userId);
        
        const existingPlayer = battleRoom.players.find(p => {
          const dbUserId = p.userId.toString();
          const match = dbUserId === userId;
          console.log(`Comparing: ${dbUserId} === ${userId} ? ${match}`);
          return match;
        });
        
        if (existingPlayer) {
          console.error('❌ Player already in room:', userId, 'Username:', existingPlayer.username);
          return socket.emit('error', { message: 'Already in this room' });
        }
        
        console.log('✅ Player can join, adding to room...');
        
        // Add player to room (ensure userId is valid ObjectId)
        const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
        battleRoom.players.push({
          userId: userObjectId,
          username,
          avatar,
          score: 0,
          answers: [],
          powerUpsUsed: [],
          joinedAt: new Date(),
          isActive: true
        });
        
        await battleRoom.save();
        
        // Store socket info
        socket.roomCode = roomCode;
        socket.userId = userId;
        socket.username = username;
        
        // Join socket to room
        socket.join(roomCode);
        
        // Send room data back to the joining player
        socket.emit('room-created', {
          roomCode: battleRoom.roomCode,
          battleId: battleRoom._id,
          hostId: battleRoom.hostId,
          maxPlayers: battleRoom.settings.maxPlayers,
          questionsCount: battleRoom.settings.questionsCount,
          timePerQuestion: battleRoom.settings.timePerQuestion,
          players: battleRoom.players
        });
        
        // Broadcast updated room data to ALL players (including host)
        io.to(roomCode).emit('room-updated', {
          players: battleRoom.players,
          totalPlayers: battleRoom.players.length,
          maxPlayers: battleRoom.settings.maxPlayers
        });
        
        console.log(`✅ ${username} joined room ${roomCode}`);
        
      } catch (error) {
        console.error('❌ Error joining room:', error.message);
        console.error('Stack:', error.stack);
        socket.emit('error', { message: 'Failed to join room: ' + error.message });
      }
    });
    
    /**
     * START BATTLE event
     * Host starts the battle (requires minimum 2 players)
     */
    /**
     * UPDATE BATTLE SETTINGS event
     * Host updates difficulty, time per question, number of questions
     */
    socket.on('update-battle-settings', async (data) => {
      try {
        const { roomCode, difficulty, timePerQuestion, questionCount, userId } = data;
        console.log('⚙️ Update settings request:', { roomCode, difficulty, timePerQuestion, questionCount, userId, socketUserId: socket.userId });
        
        let battleRoom = await BattleRoom.findOne({ roomCode });
        
        if (!battleRoom) {
          console.error('❌ Room not found:', roomCode);
          return socket.emit('error', { message: 'Room not found' });
        }
        
        // Only host can update settings
        if (battleRoom.hostId.toString() !== (userId || socket.userId)) {
          console.error('❌ Only host can update. HostId:', battleRoom.hostId.toString(), 'UserId:', userId || socket.userId);
          return socket.emit('error', { message: 'Only host can update settings' });
        }
        
        // Can't update after battle started
        if (battleRoom.status !== 'waiting') {
          console.error('❌ Battle already started. Status:', battleRoom.status);
          return socket.emit('error', { message: 'Can\'t update settings after battle started' });
        }
        
        // Validate inputs
        if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
          console.error('❌ Invalid difficulty:', difficulty);
          return socket.emit('error', { message: 'Invalid difficulty' });
        }
        
        const validTimePerQuestion = timePerQuestion ? Math.min(Math.max(timePerQuestion, 5), 60) : battleRoom.settings.timePerQuestion;
        const validQuestionCount = questionCount ? Math.min(Math.max(questionCount, 5), 20) : battleRoom.questions.length;
        const newDifficulty = difficulty || battleRoom.settings.difficulty;
        
        // Check if difficulty changed
        const difficultyChanged = newDifficulty !== battleRoom.settings.difficulty;
        // Check if question count changed
        const questionCountChanged = validQuestionCount !== battleRoom.questions.length;
        
        // If difficulty OR question count changed, regenerate questions with NEW difficulty
        if (difficultyChanged || questionCountChanged) {
          console.log(`🔄 Regenerating ${validQuestionCount} questions with ${newDifficulty} difficulty (was ${battleRoom.questions.length} questions, ${battleRoom.settings.difficulty} difficulty)`);
          try {
            const { generateBattleQuestions } = require('../services/battleService');
            battleRoom.questions = await generateBattleQuestions(
              battleRoom.deckId.toString(), 
              validQuestionCount, 
              newDifficulty
            );
          } catch (genError) {
            console.error('Question regeneration error:', genError.message);
            return socket.emit('error', { message: 'Failed to regenerate questions: ' + genError.message });
          }
        }
        
        // Update all settings
        battleRoom.settings.difficulty = newDifficulty;
        battleRoom.settings.timePerQuestion = validTimePerQuestion;
        battleRoom.settings.questionsCount = validQuestionCount;
        
        // Save the updated battle room
        try {
          await battleRoom.save();
        } catch (saveError) {
          // If version conflict, use findByIdAndUpdate to force update
          if (saveError.name === 'VersionError') {
            console.log('⚠️ Version conflict detected, using atomic update...');
            await BattleRoom.findByIdAndUpdate(
              battleRoom._id,
              {
                $set: {
                  questions: battleRoom.questions,
                  settings: battleRoom.settings
                }
              },
              { new: true }
            );
          } else {
            throw saveError;
          }
        }
        
        // Broadcast updated settings to all players in room
        io.to(roomCode).emit('settings-updated', {
          difficulty: battleRoom.settings.difficulty,
          timePerQuestion: validTimePerQuestion,
          questionCount: validQuestionCount
        });
        
        console.log(`✅ Battle settings updated in room ${roomCode}:`, battleRoom.settings);
        
      } catch (error) {
        console.error('Error updating settings:', error);
        socket.emit('error', { message: 'Failed to update settings: ' + error.message });
      }
    });
    
    /**
     * START BATTLE event
     */
    socket.on('start-battle', async (data) => {
      try {
        const { roomCode } = data;
        
        let battleRoom = await BattleRoom.findOne({ roomCode });
        
        if (!battleRoom) {
          return socket.emit('error', { message: 'Room not found' });
        }
        
        // Only host can start
        if (battleRoom.hostId.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Only host can start battle' });
        }
        
        // Need at least 2 players
        if (battleRoom.players.length < 2) {
          return socket.emit('error', { message: 'Need at least 2 players to start' });
        }
        
        // Start battle
        battleRoom.status = 'active';
        battleRoom.startedAt = new Date();
        battleRoom.currentQuestionIndex = 0;
        await battleRoom.save();
        
        // Initialize room state
        activeRooms.set(roomCode, {
          currentQuestion: 0,
          status: 'active',
          playersAnswered: new Set(),
          totalPlayers: battleRoom.players.length
        });
        
        // Notify all players
        io.to(roomCode).emit('battle-starting', { countdown: 3 });
        
        // Countdown animation
        for (let i = 3; i > 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          io.to(roomCode).emit('countdown', { count: i });
        }
        
        // Send first question
        sendNextQuestion(io, roomCode);
        
        console.log(`🎮 Battle started in room ${roomCode}`);
        
      } catch (error) {
        console.error('Error starting battle:', error);
        socket.emit('error', { message: 'Failed to start battle' });
      }
    });
    
    /**
     * SUBMIT ANSWER event
     * Player submits their answer to current question
     */
    socket.on('submit-answer', async (data) => {
      try {
        const { roomCode, userId, questionId, answer, timeTaken } = data;
        
        let battleRoom = await BattleRoom.findOne({ roomCode });
        if (!battleRoom) return;
        
        const question = battleRoom.questions.find(q => q.id === questionId);
        const player = battleRoom.players.find(p => p.userId.toString() === userId);
        
        if (!question || !player) return;
        
        // Check if answer is correct
        const isCorrect = answer === question.correctAnswer;
        
        // Calculate points (faster = more points)
        const points = calculatePoints(
          isCorrect,
          question.pointValue,
          timeTaken,
          battleRoom.settings.timePerQuestion * 1000
        );
        
        // Update player answer
        player.score += points;
        player.answers.push({
          questionId,
          answer,
          correct: isCorrect,
          timeTaken,
          pointsEarned: points,
          questionIndex: battleRoom.currentQuestionIndex
        });
        
        await battleRoom.save();
        
        // Get room state
        const roomState = activeRooms.get(roomCode);
        roomState.playersAnswered.add(userId);
        
        // Notify all players about this answer
        io.to(roomCode).emit('player-answered', {
          userId,
          username: player.username,
          correct: isCorrect,
          pointsEarned: points,
          totalScore: player.score,
          answeredCount: roomState.playersAnswered.size,
          totalPlayers: roomState.totalPlayers
        });
        
        // Check if all players answered
        if (roomState.playersAnswered.size === roomState.totalPlayers) {
          clearTimeout(questionTimers.get(roomCode));
          await moveToNextQuestion(io, roomCode);
        }
        
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    });
    
    /**
     * USE POWER-UP event
     * Player activates a power-up
     */
    socket.on('use-powerup', async (data) => {
      try {
        const { roomCode, userId, powerUpType } = data;
        
        let battleRoom = await BattleRoom.findOne({ roomCode });
        const player = battleRoom.players.find(p => p.userId.toString() === userId);
        
        if (!player) return;
        
        // Check if player already used this power-up
        if (player.powerUpsUsed.includes(powerUpType)) {
          return socket.emit('error', { message: 'Power-up already used' });
        }
        
        switch(powerUpType) {
          case '50-50':
            // Remove 2 wrong answers from current question
            const currentQ = battleRoom.questions[battleRoom.currentQuestionIndex];
            const wrongOptions = currentQ.options.filter(opt => opt !== currentQ.correctAnswer);
            const toRemove = wrongOptions.slice(0, 2);
            
            socket.emit('powerup-activated', {
              type: '50-50',
              removeOptions: toRemove
            });
            break;
            
          case 'time-freeze':
            // Freeze timer for everyone for 5 seconds
            io.to(roomCode).emit('powerup-activated', {
              userId,
              username: player.username,
              type: 'time-freeze',
              duration: 5000
            });
            break;
            
          case 'steal-points':
            // Steal points from leader
            const leader = battleRoom.players.reduce((prev, current) => 
              (prev.score > current.score) ? prev : current
            );
            
            if (leader.userId.toString() !== userId && leader.score >= 100) {
              leader.score -= 100;
              player.score += 100;
              
              io.to(roomCode).emit('powerup-activated', {
                userId,
                username: player.username,
                type: 'steal-points',
                from: leader.username,
                points: 100
              });
            }
            break;
            
          case 'double-points':
            // Next correct answer worth 2x points (marked for next submission)
            player.doublePointsActive = true;
            socket.emit('powerup-activated', {
              type: 'double-points'
            });
            break;
        }
        
        // Add to used power-ups
        player.powerUpsUsed.push(powerUpType);
        await battleRoom.save();
        
      } catch (error) {
        console.error('Error using power-up:', error);
      }
    });
    
    /**
     * DISCONNECT event
     * Player disconnects from battle
     */
    socket.on('disconnect', async () => {
      try {
        if (socket.roomCode) {
          const battleRoom = await BattleRoom.findOne({ roomCode: socket.roomCode });
          
          if (battleRoom) {
            const player = battleRoom.players.find(p => p.userId.toString() === socket.userId);
            
            if (player) {
              player.isActive = false;
              player.leftAt = new Date();
              await battleRoom.save();
              
              io.to(socket.roomCode).emit('player-left', {
                userId: socket.userId,
                username: socket.username,
                remainingPlayers: battleRoom.players.filter(p => p.isActive).length
              });
              
              console.log(`❌ ${socket.username} disconnected from room ${socket.roomCode}`);
            }
          }
        }
      } catch (error) {
        console.error('Error on disconnect:', error);
      }
    });
  });
  
  /**
   * Helper function: Send next question
   */
  async function sendNextQuestion(io, roomCode) {
    try {
      const battleRoom = await BattleRoom.findOne({ roomCode });
      const roomState = activeRooms.get(roomCode);
      
      if (!battleRoom || roomState.currentQuestion >= battleRoom.questions.length) {
        // Battle finished
        return endBattle(io, roomCode);
      }
      
      // Reset answered players for next question
      roomState.playersAnswered.clear();
      
      const question = battleRoom.questions[roomState.currentQuestion];
      console.log(`📤 Sending question ${roomState.currentQuestion + 1} to room ${roomCode}`);
      
      // Send to ALL players in room with shuffled options
      // Each player gets the same question but different option order for fairness
      const shuffledOptions = shuffleArray([...question.options]);
      
      io.to(roomCode).emit('new-question', {
        questionNumber: roomState.currentQuestion + 1,
        totalQuestions: battleRoom.questions.length,
        question: {
          id: question.id,
          question: question.question,
          options: shuffledOptions,  // Shuffled options
          timeLimit: battleRoom.settings.timePerQuestion
        }
      });
      
      // Start timer for this question
      startQuestionTimer(io, roomCode, battleRoom.settings.timePerQuestion);
      
    } catch (error) {
      console.error('Error sending next question:', error);
    }
  }
  
  /**
   * Helper function: Move to next question
   */
  async function moveToNextQuestion(io, roomCode) {
    try {
      const battleRoom = await BattleRoom.findOne({ roomCode });
      const roomState = activeRooms.get(roomCode);
      
      roomState.currentQuestion++;
      battleRoom.currentQuestionIndex = roomState.currentQuestion;
      
      // Show correct answer and current leaderboard
      const currentQ = battleRoom.questions[roomState.currentQuestion - 1];
      
      io.to(roomCode).emit('question-results', {
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        leaderboard: battleRoom.players
          .sort((a, b) => b.score - a.score)
          .map((p, idx) => ({
            rank: idx + 1,
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            score: p.score
          }))
      });
      
      await battleRoom.save();
      
      // Wait 3 seconds before sending next question
      await new Promise(resolve => setTimeout(resolve, 3000));
      await sendNextQuestion(io, roomCode);
      
    } catch (error) {
      console.error('Error moving to next question:', error);
    }
  }
  
  /**
   * Helper function: Start question timer
   */
  function startQuestionTimer(io, roomCode, timeLimit) {
    let timeLeft = timeLimit;
    
    const interval = setInterval(async () => {
      timeLeft--;
      
      // Send timer update every second
      io.to(roomCode).emit('timer-update', { timeLeft });
      
      // Warning at 5 seconds
      if (timeLeft === 5) {
        io.to(roomCode).emit('time-warning', { timeLeft: 5 });
      }
      
      // Time's up
      if (timeLeft <= 0) {
        clearInterval(interval);
        questionTimers.delete(roomCode);
        io.to(roomCode).emit('time-up');
        
        // Move to next question
        moveToNextQuestion(io, roomCode);
      }
    }, 1000);
    
    // Store timer ID for cleanup
    questionTimers.set(roomCode, interval);
  }
  
  /**
   * Helper function: End battle and update stats
   */
  async function endBattle(io, roomCode) {
    try {
      const battleRoom = await BattleRoom.findOne({ roomCode });
      
      if (!battleRoom) return;
      
      battleRoom.status = 'finished';
      battleRoom.finishedAt = new Date();
      
      // Determine winner (highest score)
      const winner = battleRoom.players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );
      battleRoom.winnerId = winner.userId;
      
      // Update player stats and ELO
      for (const player of battleRoom.players) {
        if (!player.isActive) continue;
        
        let userStats = await UserStats.findOne({ userId: player.userId });
        
        if (!userStats) {
          userStats = await UserStats.create({
            userId: player.userId,
            eloRating: 1000
          });
        }
        
        const won = player.userId.toString() === winner.userId.toString();
        const accuracy = calculateAccuracy(player.answers);
        const avgResponseTime = calculateAverageResponseTime(player.answers);
        
        // Update basic stats
        userStats.totalBattles += 1;
        if (won) {
          userStats.wins += 1;
          userStats.currentWinStreak += 1;
          if (userStats.currentWinStreak > userStats.longestWinStreak) {
            userStats.longestWinStreak = userStats.currentWinStreak;
          }
        } else {
          userStats.losses += 1;
          userStats.currentWinStreak = 0;
        }
        
        // Update performance stats
        userStats.accuracyRate = parseFloat((
          (userStats.accuracyRate * (userStats.totalBattles - 1) + accuracy) / userStats.totalBattles
        ).toFixed(1));
        
        userStats.averageScore = Math.round(
          (userStats.averageScore * (userStats.totalBattles - 1) + player.score) / userStats.totalBattles
        );
        
        userStats.averageResponseTime = Math.round(
          (userStats.averageResponseTime * (userStats.totalBattles - 1) + avgResponseTime) / userStats.totalBattles
        );
        
        userStats.lastBattleDate = new Date();
        
        // Check achievements
        const newAchievements = checkAchievements(battleRoom, userStats, {
          won,
          score: player.score,
          accuracy,
          averageResponseTime: avgResponseTime,
          wasLastAtHalfway: false // TODO: track this
        });
        
        if (newAchievements.length > 0) {
          userStats.achievements.push(...newAchievements);
        }
        
        await userStats.save();
      }
      
      // Calculate and update ELO for all players
      if (battleRoom.players.length === 2) {
        // 1v1 battle - standard ELO calculation
        const player1 = battleRoom.players[0];
        const player2 = battleRoom.players[1];
        
        const stats1 = await UserStats.findOne({ userId: player1.userId });
        const stats2 = await UserStats.findOne({ userId: player2.userId });
        
        const winner_stats = winner.userId.toString() === player1.userId.toString() ? stats1 : stats2;
        const loser_stats = winner.userId.toString() === player1.userId.toString() ? stats2 : stats1;
        
        const { newWinnerRating, newLoserRating } = calculateEloRating(winner_stats, loser_stats);
        
        winner_stats.eloRating = newWinnerRating;
        loser_stats.eloRating = newLoserRating;
        
        await winner_stats.save();
        await loser_stats.save();
      }
      
      await battleRoom.save();
      
      // Get final results
      const finalResults = battleRoom.players
        .sort((a, b) => b.score - a.score)
        .map((p, idx) => ({
          rank: idx + 1,
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          score: p.score,
          accuracy: (calculateAccuracy(p.answers)).toFixed(1) + '%',
          avgTime: (calculateAverageResponseTime(p.answers) / 1000).toFixed(1) + 's',
          correctAnswers: p.answers.filter(a => a.correct).length,
          totalAnswered: p.answers.length
        }));
      
      // Notify all players
      io.to(roomCode).emit('battle-finished', {
        winner: {
          userId: winner.userId,
          username: winner.username,
          avatar: winner.avatar,
          score: winner.score
        },
        finalResults
      });
      
      // Clean up
      activeRooms.delete(roomCode);
      if (questionTimers.has(roomCode)) {
        clearTimeout(questionTimers.get(roomCode));
        questionTimers.delete(roomCode);
      }
      
      console.log(`🏁 Battle finished in room ${roomCode}. Winner: ${winner.username}`);
      
    } catch (error) {
      console.error('Error ending battle:', error);
    }
  }
};
