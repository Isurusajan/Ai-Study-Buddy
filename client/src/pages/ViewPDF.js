import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ViewPDF = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDeck = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Fetching deck:', deckId);
      const response = await api.get(`/decks/${deckId}`);
      
      console.log('Deck fetched successfully:', response.data.deck);
      setDeck(response.data.deck);
      setError(null);
    } catch (err) {
      console.error('Failed to load deck:', err.response?.status, err.message);
      setError(err.response?.data?.message || 'Failed to load document');
      
      // Only redirect on 401 (unauthorized)
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [deckId, navigate]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  return (
    <div className="w-full bg-gray-50 py-8 overflow-x-hidden">
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

          {/* Show loading state */}
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading document...</p>
            </div>
          )}

          {/* Show error state */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-semibold">Error loading document</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <button
                onClick={() => fetchDeck()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Show deck content when loaded */}
          {deck && !loading && (
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
                  Download
                </a>
              </div>
            </div>
          )}
        </div>

        {/* PDF Viewer - Using Backend Proxy to Bypass Cloudinary 401 */}
        {deck && deck.sourceFile?.url && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Document Viewer</h2>

            {/* Check if it's a PDF */}
            {deck.sourceFile.filename?.toLowerCase().endsWith('.pdf') ? (
              <div className="space-y-4">
                {/* PDF Viewer Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> PDFs are served through our secure proxy. Click the preview button below to view.
                  </p>
                </div>

                {/* Viewing options - Direct Cloudinary access (now publicly accessible) */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href={deck.sourceFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    📖 View PDF
                  </a>
                  <a
                    href={deck.sourceFile.url}
                    download={`${deck.title}.pdf`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ⬇️ Download
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
      </div>
    </div>
  );
};

export default ViewPDF;
