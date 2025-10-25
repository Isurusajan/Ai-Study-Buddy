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
  const [liveStudyTime, setLiveStudyTime] = useState(user?.totalStudyTime || 0);
  const [liveStreak, setLiveStreak] = useState(user?.studyStreak || 0);

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
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  // Auto-track study time from login - updates every second with daily reset
  useEffect(() => {
    if (!user) return;

    // Get or initialize today's study date and session start time
    const today = new Date().toDateString();
    let studyDate = localStorage.getItem('studyDate');
    let dailySessionStart = localStorage.getItem('dailySessionStart');

    // If date changed, reset daily session start
    if (studyDate !== today) {
      localStorage.setItem('studyDate', today);
      localStorage.setItem('dailySessionStart', Date.now().toString());
      dailySessionStart = Date.now().toString();
    } else if (!dailySessionStart) {
      localStorage.setItem('dailySessionStart', Date.now().toString());
      dailySessionStart = Date.now().toString();
    }

    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      let sessionStart = parseInt(localStorage.getItem('dailySessionStart') || Date.now().toString());

      // Check if day has changed since last update
      const lastStoredDate = localStorage.getItem('studyDate');
      if (lastStoredDate !== currentDate) {
        localStorage.setItem('studyDate', currentDate);
        localStorage.setItem('dailySessionStart', Date.now().toString());
        sessionStart = Date.now();
      }

      // Calculate study time for today only
      const elapsedSeconds = Math.floor((Date.now() - sessionStart) / 1000);
      setLiveStudyTime(elapsedSeconds); // Only today's study time

      // Update streak based on current study session
      const lastStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;

      if (lastStudyDate === currentDate) {
        setLiveStreak(user.studyStreak || 0);
      } else {
        setLiveStreak((user.studyStreak || 0) + 1);
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
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center gap-2">
            <div className="flex-shrink-0">
              <h1 className="text-sm sm:text-2xl font-bold text-blue-600 whitespace-nowrap">🤖 Study Buddy</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
        {/* Header with Upload Button */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Dashboard</h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">Track progress & manage materials</p>
          </div>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => setShowJoinBattle(!showJoinBattle)}
              className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 text-xs sm:text-sm transition-colors"
            >
              ⚔️ Battle
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 text-xs sm:text-sm transition-colors"
            >
              📤 Upload
            </button>
          </div>
        </div>

        {/* Join Battle Section */}
        {showJoinBattle && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-purple-600">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">🎮 Join a Battle</h3>
            <p className="text-xs sm:text-sm text-gray-700 mb-3">Enter a room code to join</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinBattle()}
                className="flex-1 px-3 sm:px-4 py-2 text-sm border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                onClick={handleJoinBattle}
                className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {/* Total Decks */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-blue-500">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">📚 Decks</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{decks.length}</p>
          </div>

          {/* Total Quizzes */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-green-500">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">📋 Quizzes</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{decks.length * 3}</p>
          </div>

          {/* Study Streak - LIVE */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-yellow-500">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">🔥 Streak</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{liveStreak}</p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>

          {/* Study Time - LIVE */}
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-2 sm:p-4 border-t-4 border-purple-500">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">⏱️ Study</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{formatStudyTime(liveStudyTime)}</p>
            <p className="text-xs text-gray-500 mt-1">today</p>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">Loading decks...</p>
          </div>
        ) : decks.length > 0 ? (
          <>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">📚 Your Study Decks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900">No study decks yet</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Upload your first document to get started
            </p>
            <div className="mt-4">
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
