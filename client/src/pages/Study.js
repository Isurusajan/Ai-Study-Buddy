import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/Loading/LoadingSpinner';

const Study = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchDeckAndFlashcards();
    }
  }, [isAuthenticated, deckId, navigate]);

  const fetchDeckAndFlashcards = async () => {
    try {
      // Fetch deck info
      const deckResponse = await api.get(`/decks/${deckId}`);

      // Fetch flashcards
      const flashcardsResponse = await api.get(`/flashcards/decks/${deckId}`);

      setDeck(deckResponse.data.deck);
      setFlashcards(flashcardsResponse.data.flashcards);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load flashcards');
      navigate('/dashboard');
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleResponse = async (quality) => {
    try {
      const currentCard = flashcards[currentIndex];

      // Update stats
      const newStats = { ...sessionStats };
      newStats.total++;
      if (quality >= 3) {
        newStats.correct++;
      } else {
        newStats.incorrect++;
      }
      setSessionStats(newStats);

      // Send review to backend (for spaced repetition)
      await api.put(`/flashcards/${currentCard._id}/review`, { quality });

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // End of session
        alert(`Session complete!\n\nCorrect: ${newStats.correct}\nIncorrect: ${newStats.incorrect}\nTotal: ${newStats.total}`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading flashcards..." />;
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="w-full bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Flashcards Available</h2>
          <p className="text-gray-600 mb-6">This deck doesn't have any flashcards yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{deck?.title}</h1>
            <p className="text-sm text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-white rounded-lg px-4 py-2 shadow">
            <div className="text-sm text-gray-600">Correct</div>
            <div className="text-xl font-bold text-green-600">{sessionStats.correct}</div>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow">
            <div className="text-sm text-gray-600">Incorrect</div>
            <div className="text-xl font-bold text-red-600">{sessionStats.incorrect}</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 min-h-[400px] flex flex-col">
          {/* Difficulty Badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentCard.difficulty}
            </span>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Question
              </h3>
              <p className="text-2xl font-medium text-gray-900 leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            {/* Answer (shown when revealed) */}
            {showAnswer && (
              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
                  Answer
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {currentCard.answer}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8">
            {!showAnswer ? (
              <button
                onClick={handleShowAnswer}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Show Answer
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600 mb-4">How well did you know this?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleResponse(1)}
                    className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    ❌ Didn't Know
                  </button>
                  <button
                    onClick={() => handleResponse(3)}
                    className="py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    🤔 Somewhat
                  </button>
                  <button
                    onClick={() => handleResponse(4)}
                    className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    👍 Good
                  </button>
                  <button
                    onClick={() => handleResponse(5)}
                    className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    ✅ Perfect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {!showAnswer
              ? 'Try to recall the answer, then click "Show Answer"'
              : 'Rate how well you knew the answer to continue'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Study;
