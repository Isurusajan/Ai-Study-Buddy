import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import FileUpload from '../components/Dashboard/FileUpload';
import DeckCard from '../components/Dashboard/DeckCard';
import { FullPageLoader } from '../components/Loading/LoadingSpinner';

const Dashboard = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showJoinBattle, setShowJoinBattle] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [liveStudyTime, setLiveStudyTime] = useState(0);
  const [liveStreak, setLiveStreak] = useState(user?.studyStreak || 0);
  const [quizCount, setQuizCount] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch decks on mount
  useEffect(() => {
    if (isAuthenticated && refreshUser) {
      fetchDecks();
      // Only fetch quiz count if the API endpoint is available
      // This prevents repeated 404 errors
      fetchQuizCount();
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  // Auto-track study time and streak - updates every second with daily reset
  useEffect(() => {
    if (!user) return;

    const today = new Date().toDateString();
    // Make localStorage keys user-specific by including user ID
    const userId = user._id || user.id;
    const storageKeySessionStart = `dashboardSessionStart_${userId}`;
    const storageKeyDate = `studyDate_${userId}`;
    const storageKeyLastLogin = `lastStudyDate_${userId}`;

    // Initialize localStorage on first load
    let sessionStartTime = localStorage.getItem(storageKeySessionStart);
    let storedDate = localStorage.getItem(storageKeyDate);
    let lastLoginDate = localStorage.getItem(storageKeyLastLogin);

    // Check if it's a new day - reset if necessary
    if (storedDate !== today) {
      // Day has changed - increment streak if yesterday was tracked
      if (lastLoginDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastLoginDate === yesterdayStr) {
          // Consecutive day - increment streak
          setLiveStreak(prev => prev + 1);
        } else {
          // Non-consecutive day - reset to 1
          setLiveStreak(1);
        }
      } else {
        // First time logging in - start streak at 1
        setLiveStreak(1);
      }

      // Reset session start for new day
      sessionStartTime = Date.now().toString();
      localStorage.setItem(storageKeySessionStart, sessionStartTime);
      localStorage.setItem(storageKeyDate, today);
      localStorage.setItem(storageKeyLastLogin, today);
    } else if (!sessionStartTime) {
      // First time visiting dashboard today
      sessionStartTime = Date.now().toString();
      localStorage.setItem(storageKeySessionStart, sessionStartTime);
      localStorage.setItem(storageKeyDate, today);
      
      // Initialize streak on first load
      if (!lastLoginDate) {
        setLiveStreak(1);
        localStorage.setItem(storageKeyLastLogin, today);
      }
    }

    // Set initial study time
    const startTime = parseInt(sessionStartTime);
    const initialSeconds = Math.floor((Date.now() - startTime) / 1000);
    setLiveStudyTime(initialSeconds);

    // Update study time and check for day change every second
    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      const stored = localStorage.getItem(storageKeySessionStart);
      const storedDateInStorage = localStorage.getItem(storageKeyDate);

      // Check if day changed
      if (storedDateInStorage !== currentDate) {
        // New day detected - increment streak
        const prevLastLogin = localStorage.getItem(storageKeyLastLogin);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (prevLastLogin === yesterdayStr) {
          setLiveStreak(prev => prev + 1);
        } else {
          setLiveStreak(1);
        }

        // Reset for new day
        localStorage.setItem(storageKeyDate, currentDate);
        localStorage.setItem(storageKeySessionStart, Date.now().toString());
        localStorage.setItem(storageKeyLastLogin, currentDate);
        setLiveStudyTime(0);
        return;
      }

      // Calculate elapsed time
      if (stored) {
        const elapsed = Math.floor((Date.now() - parseInt(stored)) / 1000);
        setLiveStudyTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchDecks = async () => {
    try {
      const response = await api.get('/decks');
      setDecks(response.data.decks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching decks:', error);
      setLoading(false);
    }
  };

  // Fetch quiz count (only try once to avoid spam)
  const fetchQuizCount = async () => {
    try {
      const response = await api.get('/quizzes/count');
      setQuizCount(response.data.count || 0);
    } catch (error) {
      // Silently fail - quiz count is optional feature
      // Set to 0 and don't retry
      setQuizCount(0);
    }
  };

  const handleUploadSuccess = (newDeck) => {
    setDecks([newDeck, ...decks]);
    setShowUpload(false);
    alert('✅ Deck created successfully!');
  };

  const handleDeleteDeck = (deckId) => {
    setDecks(decks.filter(deck => deck._id !== deckId));
  };

  const handleJoinBattle = () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    navigate(`/battle-arena?room=${roomCode.trim().toUpperCase()}`);
  };

  // Format study time to hours and minutes
  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!user || loading) {
    return <FullPageLoader message="Loading your dashboard..." />;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12 sm:h-16 items-center gap-2">
            <div className="flex-shrink-0 flex-1 min-w-0">
              <h1 className="text-xs sm:text-2xl font-bold text-blue-600 whitespace-nowrap">🤖 Buddy</h1>
              <p className="text-xs text-gray-600 sm:hidden truncate">Welcome, <span className="font-semibold">{user.name}</span>!</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              <span className="text-xs text-gray-700 hidden sm:inline">Welcome, <span className="font-semibold">{user.name}</span>!</span>
              <button
                onClick={logout}
                className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-8">
        {/* Header with Upload Button */}
        <div className="mb-3 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-3xl font-bold text-gray-900 truncate">Dashboard</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600">Track progress & manage materials</p>
          </div>
          <div className="flex gap-2 sm:gap-2 flex-wrap flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowJoinBattle(!showJoinBattle)}
              className="flex-1 sm:flex-none px-4 sm:px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-sm transition-colors"
            >
              ⚔️ Battle
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex-1 sm:flex-none px-4 sm:px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-sm transition-colors"
            >
              📤 Upload
            </button>
          </div>
        </div>

        {/* Join Battle Section */}
        {showJoinBattle && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md p-2 sm:p-6 border-l-4 border-purple-600">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-3">🎮 Join a Battle</h3>
            <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">Enter a room code to join</p>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <input
                type="text"
                placeholder="Room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinBattle()}
                className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                onClick={handleJoinBattle}
                className="px-3 sm:px-6 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {showUpload && (
          <div className="mb-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-4 mb-4 sm:mb-8">
          {/* Total Decks */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-blue-500">
            <p className="text-xs font-medium text-gray-600 truncate">📚 Decks</p>
            <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2">{decks.length}</p>
          </div>

          {/* Total Cards/Questions */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-green-500">
            <p className="text-xs font-medium text-gray-600 truncate">📋 Quizzes Done</p>
            <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2">{quizCount}</p>
          </div>

          {/* Study Streak - LIVE */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-yellow-500">
            <p className="text-xs font-medium text-gray-600 truncate">🔥 Streak</p>
            <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2">{liveStreak}</p>
            <p className="text-xs text-gray-500 mt-0.5">days</p>
          </div>

          {/* Study Time - LIVE */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-purple-500">
            <p className="text-xs font-medium text-gray-600 truncate">⏱️ Study</p>
            <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2">{formatStudyTime(liveStudyTime)}</p>
            <p className="text-xs text-gray-500 mt-0.5">today</p>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="text-center py-4 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <p className="mt-1 sm:mt-3 text-xs sm:text-sm text-gray-600">Loading decks...</p>
          </div>
        ) : decks.length > 0 ? (
          <>
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">📚 Your Study Decks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {decks.map((deck) => (
                <DeckCard
                  key={deck._id}
                  deck={deck}
                  onDelete={handleDeleteDeck}
                  onGenerateFlashcards={() => fetchDecks()}
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow p-3 sm:p-8 text-center">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📚</div>
            <h3 className="text-sm sm:text-lg font-medium text-gray-900">No study decks yet</h3>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
              Upload your first document to get started
            </p>
            <div className="mt-2 sm:mt-4">
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Material
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
