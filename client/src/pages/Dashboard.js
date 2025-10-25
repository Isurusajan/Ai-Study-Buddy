import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import FileUpload from '../components/Dashboard/FileUpload';
import DeckCard from '../components/Dashboard/DeckCard';
import { FullPageLoader } from '../components/Loading/LoadingSpinner';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showJoinBattle, setShowJoinBattle] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch decks on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchDecks();
    }
  }, [isAuthenticated]);

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

  const startBattleMode = (deckId) => {
    navigate('/battle-arena?room=create&deck=' + deckId);
  };

  const handleJoinBattle = () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    navigate(`/battle-arena?room=${roomCode.trim().toUpperCase()}`);
  };

  if (!user || loading) {
    return <FullPageLoader message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">AI Study Buddy</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">Welcome, {user.name}!</span>
              <button
                onClick={logout}
                className="px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Upload Button */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Manage your study materials and track your progress</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowJoinBattle(!showJoinBattle)}
              className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium flex items-center gap-2 text-sm flex-1 sm:flex-auto justify-center sm:justify-start"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">{showJoinBattle ? 'Close' : 'Join Battle'}</span>
              <span className="sm:hidden">{showJoinBattle ? 'Close' : 'Battle'}</span>
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 text-sm flex-1 sm:flex-auto justify-center sm:justify-start"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{showUpload ? 'Close' : 'Upload Material'}</span>
              <span className="sm:hidden">{showUpload ? 'Close' : 'Upload'}</span>
            </button>
          </div>
        </div>

        {/* Join Battle Section */}
        {showJoinBattle && (
          <div className="mb-6 sm:mb-8 bg-purple-50 rounded-lg shadow p-4 sm:p-6 border-l-4 border-purple-600">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">🎮 Join a Battle</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Enter a room code to join an existing battle</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter room code (e.g., STUDY-ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinBattle()}
                className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={handleJoinBattle}
                className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors text-sm w-full sm:w-auto"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {showUpload && (
          <div className="mb-6 sm:mb-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center flex-col sm:flex-row">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="sm:ml-4 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Decks</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{decks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center flex-col sm:flex-row">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="sm:ml-4 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {decks.length * 3}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center flex-col sm:flex-row">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="sm:ml-4 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{user.studyStreak || 0} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center flex-col sm:flex-row">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="sm:ml-4 text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{Math.floor((user.totalStudyTime || 0) / 60)} min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">Loading decks...</p>
          </div>
        ) : decks.length > 0 ? (
          <>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Your Study Decks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
          <div className="bg-white rounded-lg shadow p-6 sm:p-12 text-center">
            <svg className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">No study decks yet</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              Get started by uploading your first document or creating a new deck.
            </p>
            <div className="mt-4 sm:mt-6">
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
