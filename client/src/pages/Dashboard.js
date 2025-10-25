import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import FileUpload from '../components/Dashboard/FileUpload';
import DeckCard from '../components/Dashboard/DeckCard';
import { FullPageLoader } from '../components/Loading/LoadingSpinner';

// Modern sleek Dashboard inspired by the provided design

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
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 min-h-screen pb-24 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline text-sm">{user.name.split(' ')[0]}</span>
          </div>
          {/* Logout Button */}
          <button
            onClick={logout}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Section */}
        <div className="text-white mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-white/80 text-xs sm:text-sm">Ready to continue your learning journey?</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => setShowJoinBattle(!showJoinBattle)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-all transform hover:translate-y-[-2px] hover:shadow-lg"
          >
            <span>⚔️</span>
            <span>Battle Mode</span>
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-purple-600 hover:text-purple-700 rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-all transform hover:translate-y-[-2px] hover:shadow-lg"
          >
            <span>📤</span>
            <span>Upload</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Decks Stat */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 shadow-md hover:shadow-lg hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-3">
              <span className="text-2xl">📚</span>
              <span>Decks</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{decks.length}</div>
            <div className="text-xs text-gray-600 mt-2">Total collections</div>
          </div>

          {/* Quizzes Stat */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 shadow-md hover:shadow-lg hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-3">
              <span className="text-2xl">📝</span>
              <span>Quizzes</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{decks.length * 3}</div>
            <div className="text-xs text-gray-600 mt-2">Available</div>
          </div>

          {/* Streak Stat */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 shadow-md hover:shadow-lg hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-3">
              <span className="text-2xl">🔥</span>
              <span>Streak</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{liveStreak}</div>
            <div className="text-xs text-gray-600 mt-2">days strong</div>
          </div>

          {/* Study Time Stat */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 shadow-md hover:shadow-lg hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-3">
              <span className="text-2xl">⏱️</span>
              <span>Study Time</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{formatStudyTime(liveStudyTime)}</div>
            <div className="text-xs text-gray-600 mt-2">today</div>
          </div>
        </div>

        {/* Join Battle Section */}
        {showJoinBattle && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">🎮 Join a Battle</h3>
            <p className="text-gray-700 text-sm mb-4">Enter a room code to join an exciting multiplayer battle!</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinBattle()}
                className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base"
              />
              <button
                onClick={handleJoinBattle}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-base whitespace-nowrap"
              >
                Join Battle
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

        {/* Decks Section */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>📚</span>
              Your Study Decks
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading your decks...</p>
            </div>
          ) : decks.length > 0 ? (
            <div className="space-y-4">
              {decks.map((deck) => (
                <div key={deck._id} className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  {/* Background Glow */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      {deck.category || 'GENERAL'}
                    </span>
                    
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">{deck.title}</h3>
                    
                    <div className="flex gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span>📄</span>
                        <span>{deck.category || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-5">
                      <div className="h-full bg-white rounded-full" style={{ width: '65%' }}></div>
                    </div>

                    {/* Deck Actions Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => navigate(`/study/${deck._id}`)}
                        className="col-span-2 sm:col-span-3 bg-white text-purple-600 hover:bg-gray-100 py-2 px-4 rounded-xl font-semibold text-sm transition-all transform hover:scale-102"
                      >
                        📖 Study Now
                      </button>
                      <button
                        onClick={() => navigate(`/pdf-summary/${deck._id}`)}
                        className="bg-white/20 border border-white/30 hover:bg-white/30 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all"
                      >
                        📄 Summary
                      </button>
                      <button
                        onClick={() => navigate(`/quiz/${deck._id}`)}
                        className="bg-white/20 border border-white/30 hover:bg-white/30 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all"
                      >
                        ❓ MCQ Quiz
                      </button>
                      <button
                        onClick={() => navigate(`/short-answer/${deck._id}`)}
                        className="bg-white/20 border border-white/30 hover:bg-white/30 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all"
                      >
                        ✍️ Short Q
                      </button>
                      <button
                        onClick={() => navigate(`/long-answer/${deck._id}`)}
                        className="bg-white/20 border border-white/30 hover:bg-white/30 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all"
                      >
                        📝 Long Q
                      </button>
                      <button
                        onClick={() => navigate(`/ask-question/${deck._id}`)}
                        className="bg-white/20 border border-white/30 hover:bg-white/30 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all"
                      >
                        💬 Ask AI
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteDeck(deck._id)}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full text-sm transition-all"
                    title="Delete deck"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No study decks yet</h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                Get started by uploading your first document. You can upload PDFs, images, or text files!
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span>📤</span>
                Upload Your First Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-3 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-purple-600 cursor-pointer hover:text-purple-700 transition">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-semibold">Home</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer transition">
          <span className="text-2xl">📚</span>
          <span className="text-xs font-semibold">Decks</span>
        </button>
        <button onClick={() => setShowJoinBattle(true)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer transition">
          <span className="text-2xl">⚔️</span>
          <span className="text-xs font-semibold">Battle</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer transition">
          <span className="text-2xl">📊</span>
          <span className="text-xs font-semibold">Stats</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer transition">
          <span className="text-2xl">👤</span>
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
