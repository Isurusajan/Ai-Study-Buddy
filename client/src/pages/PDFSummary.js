import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { InlineSpinner } from '../components/Loading/LoadingSpinner';
import LoadingSpinner from '../components/Loading/LoadingSpinner';

const PDFSummary = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [summary, setSummary] = useState('');
  const [level, setLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/decks/${deckId}`);
      setDeck(response.data.deck);
      if (response.data.deck.summary) {
        setSummary(response.data.deck.summary);
      }
    } catch (err) {
      setError('Failed to load deck');
      console.error(err);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post(`/decks/${deckId}/summary`, { level });
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = async () => {
    try {
      const response = await api.get(
        `/decks/${deckId}/summary/download?level=${level}`,
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${deck?.title || 'summary'}_${level}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download summary');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">
            {deck ? `Summary: ${deck.title}` : 'Loading...'}
          </h1>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Detail Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="brief">Brief (1-2 pages)</option>
                <option value="medium">Medium (3-5 pages)</option>
                <option value="detailed">Detailed (6-10 pages)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={generateSummary}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <InlineSpinner size={20} color="#ffffff" />
                    Generating...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </button>

              {summary && (
                <button
                  onClick={downloadSummary}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary Display */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Summary ({level.charAt(0).toUpperCase() + level.slice(1)})
            </h2>
            <div className="prose max-w-none">
              <div
                className="text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: summary
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^#{1,6}\s+(.+)$/gm, (match, p1) => {
                      const level = match.indexOf(' ');
                      return `<h${level} class="font-bold text-gray-900 mt-4 mb-2">${p1}</h${level}>`;
                    })
                    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4">$1</li>')
                    .replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-6 mb-2">$1</ul>')
                }}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!summary && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Generated</h3>
            <p className="text-gray-600 mb-4">
              Select a detail level and click "Generate Summary" to create a summary of your document.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12">
            <LoadingSpinner message="Generating summary... This may take a few moments." />
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFSummary;
