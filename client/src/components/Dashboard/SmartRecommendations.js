import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const SmartRecommendations = ({ decks }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);
  const [endpointError, setEndpointError] = useState(false);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [decks]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setEndpointError(false);
      const response = await api.get('/recommendations');
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      // 404 means backend hasn't been restarted yet with the new route
      if (error.response?.status === 404) {
        console.warn('⚠️ Recommendations endpoint not yet available. Backend server may need restart.');
        setEndpointError(true);
      } else {
        console.error('Error fetching recommendations:', error);
      }
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartBackend = async () => {
    try {
      setRestarting(true);
      const response = await api.post('/admin/restart', {}, {
        headers: {
          'x-admin-secret': 'emergency-restart-key-2024'
        }
      });
      
      if (response.data.success) {
        console.log('✅ Backend restart initiated');
        // Wait 3 seconds for backend to restart, then retry
        setTimeout(() => {
          fetchRecommendations();
        }, 3000);
      }
    } catch (error) {
      console.error('Error restarting backend:', error);
      alert('Error restarting backend. Please contact admin.');
    } finally {
      setRestarting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
      </div>
    );
  }

  // Show restart button if endpoint error
  if (endpointError) {
    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          💡 AI Study Recommendations
        </h3>
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 sm:p-6">
          <p className="text-sm text-amber-900 mb-4">
            ⚠️ The Smart Recommendations feature is being set up. Click the button below to activate it.
          </p>
          <button
            onClick={handleRestartBackend}
            disabled={restarting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {restarting ? '⏳ Activating...' : '🚀 Activate Feature'}
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        💡 AI Study Recommendations
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">Personalized</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedRec(selectedRec === idx ? null : idx)}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500 p-3 sm:p-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {getPriorityIcon(rec.priority)} {rec.topic}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{rec.subject}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getDifficultyColor(rec.difficulty)}`}>
                {rec.difficulty}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-red-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Current</p>
                <p className="text-lg font-bold text-red-600">{rec.currentScore}%</p>
              </div>
              <div className="bg-blue-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Target</p>
                <p className="text-lg font-bold text-blue-600">{rec.targetScore}%</p>
              </div>
              <div className="bg-green-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Est. Time</p>
                <p className="text-lg font-bold text-green-600">{rec.estimatedTime}h</p>
              </div>
            </div>

            {/* Reason */}
            {selectedRec === idx && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Why:</strong> {rec.reason}
                </p>
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors">
                  📖 Study This Topic
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
        <p>📊 <strong>Tip:</strong> Complete more quizzes to get better recommendations</p>
      </div>
    </div>
  );
};

export default SmartRecommendations;
