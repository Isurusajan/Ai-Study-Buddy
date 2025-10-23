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
  
  // Game states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [powerUps, setPowerUps] = useState(['50-50', 'time-freeze', 'steal-points']);
  const [usedPowerUps, setUsedPowerUps] = useState([]);
  
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
    
    // Initialize Socket.io
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
    
    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnected(true);
      
      // Join room if coming from invite
      if (roomCode) {
        newSocket.emit('join-room', {
          roomCode,
          userId: user._id,
          username: user.name,
          avatar: user.avatar || 'https://via.placeholder.com/50'
        });
      }
    });
    
    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnected(false);
    });
    
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });
    
    // Battle events
    newSocket.on('room-created', (data) => {
      console.log('Room created:', data);
      setRoomData(data);
      setBattleState('lobby');
    });
    
    newSocket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      setPlayers(prev => [...prev, data.player]);
      toast.success(`${data.player.username} joined! (${data.totalPlayers}/${data.maxPlayers})`);
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
      
      if (data.winner.userId === currentUser._id) {
        toast.success('🎉 YOU WON! 🎉');
      } else {
        toast.info(`${data.winner.username} won!`);
      }
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [roomCode, navigate]);
  
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
      
      const { roomCode, battleId } = response.data.data;
      setRoomData({ roomCode, battleId });
      
      // Join the room
      if (socket && connected) {
        socket.emit('join-room', {
          roomCode,
          userId: currentUser._id,
          username: currentUser.name,
          avatar: currentUser.avatar || 'https://via.placeholder.com/50'
        });
      }
      
      setBattleState('lobby');
      toast.success(`Battle created! Room code: ${roomCode}`);
    } catch (error) {
      console.error('Error creating battle:', error);
      toast.error(error.response?.data?.message || 'Failed to create battle');
    }
  };
  
  const submitAnswer = (answer) => {
    if (!socket || selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const timeTaken = (currentQuestion.timeLimit - timeLeft) * 1000;
    
    socket.emit('submit-answer', {
      roomCode: roomData.roomCode,
      userId: currentUser._id,
      questionId: currentQuestion.id,
      answer,
      timeTaken
    });
  };
  
  const usePowerUp = (powerUpType) => {
    if (!socket) return;
    if (usedPowerUps.includes(powerUpType)) {
      toast.warning('Power-up already used!');
      return;
    }
    
    socket.emit('use-powerup', {
      roomCode: roomData.roomCode,
      userId: currentUser._id,
      powerUpType
    });
    
    setUsedPowerUps(prev => [...prev, powerUpType]);
    toast.success(`🎉 ${powerUpType} activated!`);
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
          isHost={roomData?.hostId === currentUser._id}
          onStart={startBattle}
          onCreateRoom={createBattle}
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
          powerUps={powerUps}
          usedPowerUps={usedPowerUps}
          onUsePowerUp={usePowerUp}
        />
      )}
      
      {battleState === 'finished' && (
        <ResultsScreen
          finalResults={finalResults}
          winner={winner}
          currentUserId={currentUser._id}
          onPlayAgain={playAgain}
          onBackToDashboard={backToDashboard}
        />
      )}
    </div>
  );
}

export default BattleArena;
