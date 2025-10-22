import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner, { InlineSpinner } from '../components/Loading/LoadingSpinner';

const ViewPDF = () => {
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/decks/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/decks/${deckId}/ask`,
        { question: userQuestion, level: explanationLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add AI answer to chat history
      setChatHistory(prev => [...prev, {
        type: 'answer',
        text: response.data.answer,
        level: response.data.level
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        type: 'error',
        text: err.response?.data?.message || 'Failed to get answer. Please try again.'
      }]);
      console.error(err);
    } finally {
      setAskingQuestion(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading document..." />;
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{deck.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {deck.subject || 'General'}
                  </span>
                  <span>Uploaded: {new Date(deck.createdAt).toLocaleDateString()}</span>
                </div>
                {deck.description && (
                  <p className="text-gray-700 mb-4">{deck.description}</p>
                )}
              </div>

              <a
                href={deck.sourceFile?.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Original
              </a>
            </div>

            {/* Summary if available */}
            {deck.summary && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">AI Summary:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{deck.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        {deck.sourceFile?.url && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Viewer</h2>

            {/* Check if it's a PDF */}
            {deck.sourceFile.filename?.toLowerCase().endsWith('.pdf') ? (
              <div className="space-y-4">
                {/* Embedded PDF Viewer */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ height: '800px' }}>
                  <iframe
                    src={`${deck.sourceFile.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                  >
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to display PDF</h3>
                      <p className="text-gray-600 mb-4">
                        Your browser cannot display this PDF inline.
                      </p>
                    </div>
                  </iframe>
                </div>

                {/* Alternative viewing options */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href={deck.sourceFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </a>
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(deck.sourceFile.url)}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Open with Google Docs Viewer
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
                <p className="text-gray-600 mb-4">
                  This file type ({deck.sourceFile.filename?.split('.').pop()?.toUpperCase()}) cannot be previewed in the browser.
                </p>
                <a
                  href={deck.sourceFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
              </div>
            )}
          </div>
        )}

        {/* AI Q&A Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ask Questions About This Document</h2>
              <p className="text-sm text-gray-600">Get AI-powered answers based on the document content</p>
            </div>
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-4 max-h-96 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
              {chatHistory.map((item, index) => (
                <div key={index}>
                  {item.type === 'question' && (
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg max-w-xl">
                        <p className="font-medium text-sm mb-1">You asked:</p>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'answer' && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg max-w-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <p className="font-semibold text-gray-900">AI Answer:</p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{item.text}</p>
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
                      <InlineSpinner size={16} color="#16a34a" />
                      <p className="text-gray-600">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Input Form */}
          <form onSubmit={handleAskQuestion} className="space-y-3">
            <div className="flex gap-3">
              <select
                value={explanationLevel}
                onChange={(e) => setExplanationLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="simple">Simple (ELI5)</option>
                <option value="medium">Medium</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any question about this document..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={askingQuestion}
              />
              <button
                type="submit"
                disabled={askingQuestion || !question.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
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
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'What are the main topics covered?',
                  'Can you summarize the key points?',
                  'What are the important definitions?',
                  'Explain the most complex concept'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
                    className="text-xs px-3 py-1 bg-white text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/summary/${deck._id}`)}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-3 text-left"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Generate Summary</h3>
              <p className="text-sm text-gray-600">Create AI-powered summaries</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/quiz/${deck._id}`)}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-3 text-left"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Take Quiz</h3>
              <p className="text-sm text-gray-600">Test your knowledge with MCQs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPDF;
