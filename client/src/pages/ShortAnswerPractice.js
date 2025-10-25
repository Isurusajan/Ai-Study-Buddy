import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { InlineSpinner } from '../components/Loading/LoadingSpinner';

const ShortAnswerPractice = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Configuration
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/decks/${deckId}`);
      setDeck(response.data.deck);
    } catch (err) {
      setError('Failed to load deck');
      console.error(err);
    }
  };

  const generateQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post(`/decks/${deckId}/short-answer`, {
        count: questionCount,
        difficulty
      });
      setQuestions(response.data.questions);
      setQuestionsGenerated(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [index]: !expandedQuestions[index]
    });
  };

  const resetQuestions = () => {
    setQuestionsGenerated(false);
    setQuestions([]);
    setExpandedQuestions({});
  };

  // Setup Screen
  if (!questionsGenerated) {
    return (
      <div className="w-full bg-gray-50 py-8 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Short Questions Practice
            </h1>
            <p className="text-gray-600 mb-6">
              {deck ? `From: ${deck.title}` : 'Loading...'}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">Choose between 5 and 50 questions</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-3 rounded-md border-2 transition ${
                        difficulty === level
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium capitalize">{level}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {level === 'easy' ? '1-2 sentences' : level === 'medium' ? '2-4 sentences' : '3-5 sentences'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateQuestions}
                disabled={loading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <InlineSpinner size={20} color="#ffffff" />
                    Generating Questions...
                  </>
                ) : (
                  'Generate Questions'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Questions Display Screen
  return (
    <div className="w-full bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Short Questions Practice</h1>
            <p className="text-gray-600 mb-4">
              {deck?.title} • {questions.length} Questions • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
            </p>
            <button
              onClick={resetQuestions}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
            >
              Generate New Questions
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-indigo-600">Question {index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.question}
                    </h3>
                  </div>
                </div>

                {/* Toggle Answer Button */}
                <button
                  onClick={() => toggleAnswer(index)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
                >
                  {expandedQuestions[index] ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Answer
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Answer
                    </>
                  )}
                </button>

                {/* Answer Section */}
                {expandedQuestions[index] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-900 mb-2">Sample Answer:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{question.answer}</p>
                    </div>

                    {question.keyPoints && question.keyPoints.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Key Points to Include:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {question.keyPoints.map((point, i) => (
                            <li key={i} className="text-gray-700">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <button
              onClick={resetQuestions}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
            >
              Generate New Questions
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerPractice;
