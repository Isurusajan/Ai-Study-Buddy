import React, { useState } from 'react';
import axios from 'axios';

const DeckCard = ({ deck, onDelete, onGenerateFlashcards }) => {
  const [generating, setGenerating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/flashcards/decks/${deck._id}/generate`,
        { count: 10 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Flashcards generated:', response.data);

      if (onGenerateFlashcards) {
        onGenerateFlashcards(deck._id, response.data.flashcards);
      }

      setGenerating(false);
      alert(`✅ Generated ${response.data.flashcards.length} flashcards!`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards');
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${deck.title}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/decks/${deck._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          {deck.totalCards || 0} cards
        </div>

        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(deck.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {deck.totalCards > 0 ? (
          <button className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors">
            Study Now
          </button>
        ) : (
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Flashcards'
            )}
          </button>
        )}

        <button className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors">
          View
        </button>
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
