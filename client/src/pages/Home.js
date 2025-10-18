import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">AI Study Buddy</h1>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Learn Smarter with{' '}
            <span className="text-blue-600">AI-Powered</span> Study Tools
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your study materials and let AI generate flashcards, quizzes, and summaries.
            Master any subject with spaced repetition and intelligent learning algorithms.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-md text-base font-medium text-blue-600 bg-white hover:bg-gray-50 shadow-lg border border-blue-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Flashcards</h3>
            <p className="text-gray-600">
              AI automatically generates flashcards from your PDFs and notes with intelligent spaced repetition.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Adaptive Learning</h3>
            <p className="text-gray-600">
              Spaced repetition algorithm adapts to your learning pace, reviewing cards right before you forget.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Study Partner</h3>
            <p className="text-gray-600">
              Ask questions and get instant explanations. Practice with AI study group simulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
