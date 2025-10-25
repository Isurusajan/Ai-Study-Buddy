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
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isStudySessionActive, setIsStudySessionActive] = useState(false);

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

  // Update live study time from localStorage on mount
  useEffect(() => {
    const storedSessionStart = localStorage.getItem('studySessionStart');
    const storedSessionActive = localStorage.getItem('isStudySessionActive') === 'true';
    
    if (storedSessionStart && storedSessionActive) {
      setSessionStartTime(parseInt(storedSessionStart));
      setIsStudySessionActive(true);
    }
  }, []);

  // Real-time study time ticker
  useEffect(() => {
    if (!isStudySessionActive || !sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      setLiveStudyTime((user?.totalStudyTime || 0) + elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudySessionActive, sessionStartTime, user?.totalStudyTime]);

  // Update streak based on study time (simple logic: if studied today, streak continues)
  useEffect(() => {
    if (!user) return;
    
    const lastStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastStudyDate === today) {
      // Already studied today
      setLiveStreak(user.studyStreak);
    } else if (lastStudyDate === yesterday && isStudySessionActive) {
      // Studied yesterday and currently studying now
      setLiveStreak(user.studyStreak + 1);
    }
  }, [user, isStudySessionActive]);

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

  const startStudySession = async () => {
    const now = Date.now();
    setSessionStartTime(now);
    setIsStudySessionActive(true);
    localStorage.setItem('studySessionStart', now.toString());
    localStorage.setItem('isStudySessionActive', 'true');

    // Send to backend
    try {
      await api.post('/auth/study-session-start', {});
    } catch (error) {
      console.error('Error starting study session:', error);
    }
  };

  const endStudySession = async () => {
    const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    try {
      const response = await api.post('/auth/study-session-end', {
        sessionDuration: elapsedSeconds
      });

      setIsStudySessionActive(false);
      localStorage.setItem('isStudySessionActive', 'false');
      localStorage.removeItem('studySessionStart');
      
      // Update user data from response
      if (response.data.user) {
        setLiveStudyTime(response.data.user.totalStudyTime);
        setLiveStreak(response.data.user.studyStreak);
      }
      
      await refreshUser();
    } catch (error) {
      console.error('Error ending study session:', error);
    }
  };

  if (!user || loading) {
    return <FullPageLoader message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center flex-wrap gap-2">
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">🤖 AI Study Buddy</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">Welcome, <span className="font-semibold">{user.name}</span>!</span>
              <button
                onClick={logout}
                className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header with Upload Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">Track your progress, manage materials, and study smart</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowJoinBattle(!showJoinBattle)}
              className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 text-sm transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">{showJoinBattle ? 'Close' : 'Join Battle'}</span>
              <span className="sm:hidden">Battle</span>
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 text-sm transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{showUpload ? 'Close' : 'Upload Material'}</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>

        {/* Join Battle Section */}
        {showJoinBattle && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎮 Join a Battle</h3>
            <p className="text-sm text-gray-700 mb-4">Enter a room code to join an existing battle</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter room code (e.g., STUDY-ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinBattle()}
                className="flex-1 px-4 py-2 text-sm border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                onClick={handleJoinBattle}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Join
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

        {/* Study Timer Card */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-l-4 border-green-600">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">⏱️ Study Session</h3>
              <p className="text-sm text-gray-600">
                {isStudySessionActive ? 'Session running...' : 'Start studying to track your progress'}
              </p>
            </div>
            <button
              onClick={isStudySessionActive ? endStudySession : startStudySession}
              className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${
                isStudySessionActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isStudySessionActive ? 'End Session' : 'Start Session'}
            </button>
          </div>
        </div>

        {/* Stats Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Decks */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Decks</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">{decks.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Quizzes */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">{decks.length * 3}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Study Streak - LIVE */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">{liveStreak} <span className="text-lg">days</span></p>
                <p className="text-xs text-gray-500 mt-1">🔥 Keep it up!</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Study Time - LIVE */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
                  {Math.floor(liveStudyTime / 60)} <span className="text-lg">min</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{isStudySessionActive ? '⏱️ Active' : 'Session ended'}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">Loading decks...</p>
          </div>
        ) : decks.length > 0 ? (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">📚 Your Study Decks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No study decks yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by uploading your first document or creating a new deck.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Study Material
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
