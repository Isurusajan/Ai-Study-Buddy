import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homeBattle.css';

const Home = () => {
  return (
    <div className="relative w-screen overflow-x-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-950">
      {/* Space background with stars */}
      <div className="fixed inset-0 z-0">
        {/* Animated starfield */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(100,200,255,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(150,100,255,0.1),transparent_50%)]"></div>
        
        {/* Twinkling stars */}
        <div className="absolute w-1 h-1 bg-white rounded-full top-10 left-10 opacity-60 animate-pulse"></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-20 right-20 opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute w-1 h-1 bg-blue-200 rounded-full top-1/3 left-1/4 opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-1/3 right-1/3 opacity-70 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute w-1 h-1 bg-cyan-200 rounded-full bottom-1/4 left-1/3 opacity-45 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-1/2 right-1/4 opacity-60 animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      {/* AI Robots in space */}
      <div className="absolute top-1/4 left-5 sm:left-10 z-10 text-5xl sm:text-7xl animate-bounce" style={{animationDuration: '4s'}}>
        🤖
      </div>
      <div className="absolute top-1/3 right-10 sm:right-20 z-10 text-4xl sm:text-6xl" style={{animation: 'float 6s ease-in-out infinite', animationDelay: '1s'}}>
        🛸
      </div>
      <div className="absolute bottom-1/3 left-1/4 z-10 text-5xl sm:text-6xl opacity-80" style={{animation: 'float 5s ease-in-out infinite', animationDelay: '2s'}}>
        🤖
      </div>
      <div className="absolute bottom-1/4 right-1/3 z-10 text-4xl sm:text-5xl opacity-70" style={{animation: 'float 7s ease-in-out infinite'}}>
        🌌
      </div>

      {/* Nebula effects */}
      <div className="absolute top-20 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-32 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>

      {/* Content overlay */}
      <div className="battle-content relative z-20">
        {/* Navigation */}
        <nav className="bg-slate-900/60 backdrop-blur-md shadow-sm border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-lg">🤖 AI Study Buddy</h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white hero-glow leading-tight">
              Master Any Subject —
              <span className="text-yellow-300"> Faster with AI</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-white/95 max-w-xl mx-auto drop-shadow-lg px-2">
              Instant PDF summaries, smart quizzes, AI feedback, and fun multiplayer battles — learn smarter in less time.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2 w-full">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-4 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-center"
              >
                Get Started — It's Free
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-4 rounded-lg text-base font-semibold text-blue-800 bg-white/90 hover:bg-white shadow-md border border-white/30 transition-all transform hover:scale-105 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid - Mobile Optimized */}
          <div className="mt-16 sm:mt-24">
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12 px-2">✨ Powerful Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-yellow-300 text-4xl mb-3 sm:mb-4">🎯</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">AI Quizzes</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Generate intelligent quizzes with different difficulty levels. Test and master any topic.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                  <div className="text-purple-200 text-4xl mb-3 sm:mb-4">📝</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">PDF Summaries</h3>
                <p className="text-sm sm:text-base text-white/80">
                  AI-powered summaries of your study materials. Grasp key concepts instantly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-green-200 text-4xl mb-3 sm:mb-4">⚡</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Practice Modes</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Short-answer and essay practice with instant AI feedback. Learn from mistakes.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-red-300 text-4xl mb-3 sm:mb-4">⚔️</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Battle Mode</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Real-time multiplayer quiz battles with friends. ELO ratings and leaderboards.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-pink-300 text-4xl mb-3 sm:mb-4">🏆</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Achievements</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Earn badges, build streaks, and unlock milestones. Climb the global leaderboard.
                </p>
              </div>

              {/* Feature 6 - New Feature */}
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                <div className="text-blue-300 text-4xl mb-3 sm:mb-4">💡</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Ask AI</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Ask questions about your study materials and get instant AI-powered answers.
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
