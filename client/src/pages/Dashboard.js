import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import FileUpload from '../components/Dashboard/FileUpload';
import DeckCard from '../components/Dashboard/DeckCard';
import { FullPageLoader } from '../components/Loading/LoadingSpinner';

// Completely redesigned Dashboard component with modern mobile-responsive design

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 w-full overflow-x-hidden pb-8">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl">🤖</div>
              <div>
                <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Study Buddy
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Welcome back!</p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Premium Member</p>
              </div>
              <button
                onClick={logout}
                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all transform hover:scale-105 text-xs sm:text-sm shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>! 👋
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">Keep up your learning streak and master new subjects</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl sm:text-4xl">📤</span>
            <span className="font-semibold text-xs sm:text-sm">Upload</span>
          </button>

          <button
            onClick={() => setShowJoinBattle(!showJoinBattle)}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl sm:text-4xl">⚔️</span>
            <span className="font-semibold text-xs sm:text-sm">Battle</span>
          </button>

          <button
            onClick={() => navigate('/quiz')}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl sm:text-4xl">📝</span>
            <span className="font-semibold text-xs sm:text-sm">Quiz</span>
          </button>
        </div>

        {/* Stats Cards - Beautiful Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* Study Time Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 group cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">⏱️</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Today</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Study Time</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">{formatStudyTime(liveStudyTime)}</p>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-yellow-500 group cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">🔥</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Active</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Study Streak</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">{liveStreak} <span className="text-sm text-gray-500">days</span></p>
          </div>

          {/* Decks Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-green-500 group cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">📚</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Total</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Decks</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">{decks.length}</p>
          </div>

          {/* Quizzes Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-purple-500 group cursor-default">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">📋</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">Available</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Quizzes</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">{decks.length * 3}</p>
          </div>
        </div>

        {/* Join Battle Section */}
        {showJoinBattle && (
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md p-5 sm:p-8 border-2 border-purple-200">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              🎮 Join a Battle
            </h3>
            <p className="text-gray-700 text-sm sm:text-base mb-4">Enter a room code to join an exciting multiplayer battle!</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinBattle()}
                className="flex-1 px-4 py-3 text-base border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
              <button
                onClick={handleJoinBattle}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-base"
              >
                Join Battle
              </button>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {showUpload && (
          <div className="mb-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Decks Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              📚 Your Study Decks
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{decks.length}</span>
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading your decks...</p>
            </div>
          ) : decks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {decks.map((deck) => (
                <DeckCard
                  key={deck._id}
                  deck={deck}
                  onDelete={handleDeleteDeck}
                  onGenerateFlashcards={() => fetchDecks()}
                />
              ))}
            </div>
          ) : (
            /* Empty State - Beautiful Design */
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border-2 border-dashed border-blue-200">
              <div className="text-6xl sm:text-7xl mb-4 inline-block">📚</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No study decks yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                Get started by uploading your first document. You can upload PDFs, images, or text files to create flashcards instantly!
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-base"
              >
                <span>📤</span>
                Start by Uploading a Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
