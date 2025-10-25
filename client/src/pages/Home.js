import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homeBattle.css';

const Home = () => {
  return (
    <div className="min-h-screen relative">
      {/* Animated battle background */}
      <div className="battle-background"></div>

      {/* Floating knowledge orbs */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>

      {/* Student characters battling */}
      <div className="student-left">👨‍🎓</div>
      <div className="student-right">👩‍🎓</div>

      {/* Energy beam between students */}
      <div className="energy-beam"></div>

      {/* Floating cards */}
      <div className="floating-card card-1">
        <div className="text-2xl">📚</div>
        <div className="text-white text-xs mt-1 font-semibold">Learn</div>
      </div>
      <div className="floating-card card-2">
        <div className="text-2xl">⚡</div>
        <div className="text-white text-xs mt-1 font-semibold">Master</div>
      </div>
      <div className="floating-card card-3">
        <div className="text-2xl">🏆</div>
        <div className="text-white text-xs mt-1 font-semibold">Win</div>
      </div>

      {/* Content overlay */}
      <div className="battle-content">
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">AI Study Buddy</h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-white sm:text-6xl hero-glow">
              Master Any Subject with{' '}
              <span className="text-yellow-300">AI-Powered Learning</span>
            </h2>
            <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto drop-shadow-lg">
              Create flashcards, generate quizzes, summarize PDFs, practice with AI, and battle friends in multiplayer mode. 
              All powered by advanced AI to accelerate your learning journey.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                to="/register"
                className="px-6 sm:px-8 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-6 sm:px-8 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium text-white bg-white/20 hover:bg-white/30 shadow-lg backdrop-blur-md border border-white/30 transition-all transform hover:scale-105 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Powerful Features</h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-yellow-300 text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Quizzes</h3>
                <p className="text-white/80">
                  Generate intelligent multiple-choice quizzes with adaptive difficulty. Test your knowledge anytime.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-purple-200 text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">PDF Summaries</h3>
                <p className="text-white/80">
                  Get AI-powered summaries of your study materials. Understand key concepts instantly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-green-200 text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-2">Practice Modes</h3>
                <p className="text-white/80">
                  Short-answer and long-answer practice with AI evaluation. Get detailed feedback instantly.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-red-300 text-4xl mb-4">⚔️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Battle Mode</h3>
                <p className="text-white/80">
                  Compete with friends in real-time multiplayer battles. Unlimited players, ELO ratings, leaderboards.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-pink-300 text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">Achievements</h3>
                <p className="text-white/80">
                  Unlock badges and track your progress. Climb the global leaderboard and become a study master.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom call-to-action removed per design request (keep hero CTAs only) */}
        </div>
      </div>
    </div>
  );
};

export default Home;
