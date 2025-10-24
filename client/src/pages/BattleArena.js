import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import axios from 'axios';
import LobbyScreen from '../components/Battle/LobbyScreen';
import QuestionScreen from '../components/Battle/QuestionScreen';
import ResultsScreen from '../components/Battle/ResultsScreen';
import CountdownAnimation from '../components/Battle/CountdownAnimation';
import '../styles/battleArena.css';

function BattleArena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deck');
  const roomCode = searchParams.get('room');
  
  // Connection states
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Battle states
  const [battleState, setBattleState] = useState('joining'); // joining, lobby, countdown, active, finished
  const [currentUser, setCurrentUser] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [battleSettings, setBattleSettings] = useState({
    difficulty: 'medium',
    timePerQuestion: 15
  });
  
  // Game states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  
  // Results states
  const [finalResults, setFinalResults] = useState(null);
  const [winner, setWinner] = useState(null);
  const [battleFinished, setBattleFinished] = useState(false);
  
  // Initialize socket connection
  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    console.log('Current user loaded:', { name: user.name, id: user._id || user.id });
    
    // Initialize Socket.io with proper configuration
    const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      rejectUnauthorized: false
    });
    
    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnected(true);
      // Don't join here - let the useEffect handle joining based on roomCode/deckId
    });
    
    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnected(false);
    });
    
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      console.error('Error message:', error.message);
      toast.error(error.message || 'Connection error');
    });
    
    // Battle events
    newSocket.on('room-created', (data) => {
      console.log('Room created:', data);
      setRoomData(data);
      // Add all players from room data
      setPlayers(data.players || []);
      setBattleState('lobby');
    });
    
    newSocket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      // Only add if not already in players list
      setPlayers(prev => {
        const alreadyExists = prev.some(p => p.userId.toString() === data.player.userId.toString());
        if (alreadyExists) {
          console.log('Player already in list, skipping duplicate');
          return prev;
        }
        return [...prev, data.player];
      });
      toast.success(`${data.player.username} joined! (${data.totalPlayers}/${data.maxPlayers})`);
    });

    newSocket.on('room-updated', (data) => {
      console.log('✅ Room updated event received:', data);
      console.log('Players from room-updated:', data.players);
      setPlayers(data.players || []);
    });
    
    newSocket.on('battle-starting', (data) => {
      console.log('Battle starting countdown');
      setBattleState('countdown');
    });
    
    newSocket.on('countdown', (data) => {
      console.log('Countdown:', data.count);
    });
    
    newSocket.on('new-question', (data) => {
      console.log('New question received:', data);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestion(data.question);
      setTimeLeft(data.question.timeLimit);
      setSelectedAnswer(null);
      setBattleState('active');
    });
    
    newSocket.on('timer-update', (data) => {
      setTimeLeft(data.timeLeft);
    });
    
    newSocket.on('time-warning', (data) => {
      toast.warning('⏰ 5 seconds left!');
    });
    
    newSocket.on('time-up', () => {
      toast.info('⏰ Time\'s up!');
    });
    
    newSocket.on('player-answered', (data) => {
      console.log('Player answered:', data);
      
      // Update player score in local state
      setPlayers(prev => prev.map(p => 
        p.userId === data.userId 
          ? { ...p, score: data.totalScore }
          : p
      ));
      
      // Show notification
      const icon = data.correct ? '✅' : '❌';
      toast.info(`${data.username} answered! ${icon} (+${data.pointsEarned}pts)`);
    });
    
    newSocket.on('question-results', (data) => {
      console.log('Question results:', data);
      // Show correct answer
      toast.info(`Correct answer: ${data.correctAnswer}`);
      setPlayers(data.leaderboard);
    });
    
    newSocket.on('powerup-activated', (data) => {
      console.log('Power-up activated:', data);
      if (data.type === '50-50') {
        toast.info('➗ 50-50 used! Two wrong answers removed');
      }
    });
    
    newSocket.on('player-left', (data) => {
      console.log('Player left:', data);
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
      toast.warning(`${data.username} left the battle`);
    });
    
    newSocket.on('battle-finished', (data) => {
      console.log('Battle finished:', data);
      setWinner(data.winner);
      setFinalResults(data.finalResults);
      setBattleState('finished');
      setBattleFinished(true);
      
      if (currentUser && data.winner.userId === currentUser._id) {
        toast.success('🎉 YOU WON! 🎉');
      } else {
        toast.info(`${data.winner.username} won!`);
      }
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [navigate]);
  
  // Create new battle room
  const createBattle = async (deckId, settings) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/battles/create`,
        {
          deckId,
          battleType: 'private',
          ...settings
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const { roomCode, battleId, players } = response.data.data;
      console.log('✅ Battle created response:', { roomCode, battleId, players });
      setRoomData({ roomCode, battleId });
      
      // Set players from response (includes host)
      console.log('Setting players from response:', players);
      setPlayers(players || [{
        userId: currentUser._id || currentUser.id,
        username: currentUser.name,
        avatar: currentUser.avatar || 'https://via.placeholder.com/50',
        score: 0
      }]);
      
      // Emit socket event to join the room (for receiving future updates)
      if (socket && connected) {
        console.log('Emitting join-room-as-host for:', roomCode);
        socket.emit('join-room-as-host', {
          roomCode: roomCode,
          userId: currentUser._id || currentUser.id
        });
      }
      
      setBattleState('lobby');
      toast.success(`Battle created! Room code: ${roomCode}`);
    } catch (error) {
      console.error('Error creating battle:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create battle';
      console.error('Full error message:', errorMsg);
      toast.error(errorMsg);
    }
  };
  
  // Auto-create battle when user has deckId and socket is connected
  useEffect(() => {
    if (connected && socket && currentUser && battleState === 'joining') {
      const userId = currentUser._id || currentUser.id;
      
      console.log('Attempting to join or create battle...');
      console.log('userId:', userId, 'deckId:', deckId, 'roomCode:', roomCode);
      
      // If joining existing room
      if (roomCode && !deckId) {
        console.log('Joining existing room:', roomCode, 'with userId:', userId);
        socket.emit('join-room', {
          roomCode: roomCode.toUpperCase(),
          userId: userId,
          username: currentUser.name,
          avatar: currentUser.avatar || 'https://via.placeholder.com/50'
        });
      }
      // If creating new room with deckId
      else if (deckId && !roomCode) {
        console.log('Auto-creating battle for deckId:', deckId);
        createBattle(deckId, {
          battleType: 'private',
          difficulty: battleSettings.difficulty
        });
      }
    }
  }, [connected, socket, deckId, roomCode, battleState, currentUser]);
  
  const submitAnswer = (answer) => {
    if (!socket || selectedAnswer) return;
    
    const userId = currentUser._id || currentUser.id;
    setSelectedAnswer(answer);
    const timeTaken = (currentQuestion.timeLimit - timeLeft) * 1000;
    
    socket.emit('submit-answer', {
      roomCode: roomData.roomCode,
      userId: userId,
      questionId: currentQuestion.id,
      answer,
      timeTaken
    });
  };
  
  const handleSettingsChange = (newSettings) => {
    setBattleSettings(newSettings);
    toast.info(`⚙️ Settings updated: ${newSettings.difficulty} difficulty, ${newSettings.timePerQuestion}s per question`);
  };
  
  const startBattle = () => {
    if (!socket) return;
    socket.emit('start-battle', {
      roomCode: roomData.roomCode
    });
  };
  
  const playAgain = () => {
    window.location.href = '/dashboard';
  };
  
  const backToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (!currentUser || !connected) {
    return (
      <div className="battle-loading">
        <div className="spinner"></div>
        <p>Connecting to battle server...</p>
      </div>
    );
  }
  
  return (
    <div className="battle-arena">
      {battleState === 'joining' && (
        <div className="battle-joining">
          <h2>Waiting for room connection...</h2>
          <div className="spinner"></div>
        </div>
      )}
      
      {battleState === 'lobby' && (
        <LobbyScreen
          roomCode={roomData?.roomCode}
          players={players}
          isHost={currentUser && roomData?.hostId === currentUser._id}
          onStart={startBattle}
          onCreateRoom={createBattle}
          onSettingsChange={handleSettingsChange}
        />
      )}
      
      {battleState === 'countdown' && (
        <CountdownAnimation />
      )}
      
      {battleState === 'active' && currentQuestion && (
        <QuestionScreen
          question={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          players={players}
          score={score}
          selectedAnswer={selectedAnswer}
          onAnswer={submitAnswer}
        />
      )}
      
      {battleState === 'finished' && (
        <ResultsScreen
          finalResults={finalResults}
          winner={winner}
          currentUserId={currentUser?._id}
          onPlayAgain={playAgain}
          onBackToDashboard={backToDashboard}
        />
      )}
    </div>
  );
}

export default BattleArena;
