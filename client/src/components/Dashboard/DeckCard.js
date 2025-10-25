import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DeckCard = ({ deck, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${deck.title}"?`)) {
      try {
        await api.delete(`/decks/${deck._id}`);

        if (onDelete) {
          onDelete(deck._id);
        }
      } catch (error) {
        console.error('Error deleting deck:', error);
        alert('Failed to delete deck');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Delete Deck
            </button>
          </div>
        )}
      </div>

      {/* Subject Badge */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
          {deck.subject || 'General'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">{deck.title}</h3>

      {/* Description */}
      {deck.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{deck.description}</p>
      )}

      {/* Summary */}
      {deck.summary && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-1">AI Summary:</p>
          <p className="text-sm text-gray-700 line-clamp-3">{deck.summary}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {deck.subject || 'General'}
        </div>

        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(deck.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* View Document Button */}
        <button
          onClick={() => navigate(`/view/${deck._id}`)}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Document
        </button>

        {/* Summary, Quiz, Practice & Battle Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate(`/summary/${deck._id}`)}
            className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Summary
          </button>
          <button
            onClick={() => navigate(`/quiz/${deck._id}`)}
            className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            MCQ Quiz
          </button>
          <button
            onClick={() => navigate(`/short-answer/${deck._id}`)}
            className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Short Questions
          </button>
          <button
            onClick={() => navigate(`/long-answer/${deck._id}`)}
            className="py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Long Questions
          </button>
          <button
            onClick={() => navigate(`/ask/${deck._id}`)}
            className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask Question
          </button>
          <button
            onClick={() => navigate(`/battle-arena?deck=${deck._id}`)}
            className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm8 7.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18 15a3 3 0 11-6 0 3 3 0 016 0zM7.5 15a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            🎮 Battle
          </button>
        </div>
      </div>

      {/* File Link */}
      {deck.sourceFile?.url && (
        <a
          href={deck.sourceFile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-xs text-blue-600 hover:text-blue-800 text-center"
        >
          View Original File →
        </a>
      )}
    </div>
  );
};

export default DeckCard;
