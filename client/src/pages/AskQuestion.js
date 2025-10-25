import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { InlineSpinner } from '../components/Loading/LoadingSpinner';
import LoadingSpinner from '../components/Loading/LoadingSpinner';

const AskQuestion = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Q&A State
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [explanationLevel, setExplanationLevel] = useState('medium');

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/decks/${deckId}`);
      setDeck(response.data.deck);
      setLoading(false);
    } catch (err) {
      setError('Failed to load deck');
      setLoading(false);
      console.error(err);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion('');
    setAskingQuestion(true);

    // Add user question to chat history
    setChatHistory(prev => [...prev, { type: 'question', text: userQuestion }]);

    try {
      const response = await api.post(`/decks/${deckId}/ask`, {
        question: userQuestion,
        level: explanationLevel
      });

      // Add AI answer to chat history
      setChatHistory(prev => [...prev, {
        type: 'answer',
        text: response.data.answer,
        level: response.data.level
      }]);
    } catch (err) {
      console.error('Ask question error:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Failed to get answer. This could be due to content filtering or the question complexity. Please try rephrasing your question.';

      setChatHistory(prev => [...prev, {
        type: 'error',
        text: errorMessage
      }]);
    } finally {
      setAskingQuestion(false);
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (error || !deck) {
    return (
      <div className="w-full bg-gray-50 py-8 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Document not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4">
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
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Ask Questions</h1>
                <p className="text-gray-600">Get AI-powered answers from: {deck.title}</p>
              </div>
              {chatHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-md transition"
                >
                  Clear Chat
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Q&A Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Chat History */}
          {chatHistory.length > 0 ? (
            <div className="mb-6 max-h-[500px] overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {chatHistory.map((item, index) => (
                <div key={index}>
                  {item.type === 'question' && (
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white px-4 py-3 rounded-lg max-w-2xl">
                        <p className="font-medium text-sm mb-1">You asked:</p>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'answer' && (
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-green-200 px-4 py-3 rounded-lg max-w-3xl">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <p className="font-semibold text-gray-900">AI Answer:</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {item.level}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'error' && (
                    <div className="flex justify-start">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg max-w-xl">
                        <p>{item.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {askingQuestion && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <InlineSpinner size={20} color="#16a34a" />
                      <p className="text-gray-600">AI is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg text-center">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a Conversation</h3>
              <p className="text-gray-600 mb-4">Ask any question about your document and get instant AI-powered answers</p>
            </div>
          )}

          {/* Question Input Form */}
          <form onSubmit={handleAskQuestion} className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Explanation Level:</label>
              <select
                value={explanationLevel}
                onChange={(e) => setExplanationLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="simple">Simple (Like I'm 10)</option>
                <option value="medium">Medium (College Level)</option>
                <option value="detailed">Detailed (Expert Level)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any question about this document..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={askingQuestion}
              />
              <button
                type="submit"
                disabled={askingQuestion || !question.trim()}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {askingQuestion ? (
                  <>
                    <InlineSpinner size={20} color="#ffffff" />
                    Asking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Ask
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Suggested Questions */}
          {chatHistory.length === 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">💡 Try asking:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'What are the main topics covered in this document?',
                  'Can you summarize the key points?',
                  'What are the most important definitions?',
                  'Explain the most complex concept in simple terms',
                  'What should I focus on for studying?',
                  'Give me practice questions on this material'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
                    className="text-left text-sm px-3 py-2 bg-white text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
