import React, { useMemo } from 'react';
import '../../styles/battleComponents.css';

function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  players,
  score,
  selectedAnswer,
  onAnswer
}) {
  // Calculate timer percentage
  const timerPercent = (timeLeft / question.timeLimit) * 100;
  const timerColor = timeLeft < 5 ? '#ef4444' : timeLeft < 10 ? '#f97316' : '#22c55e';
  
  // Sort players by score
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [players]);
  
  return (
    <div className="question-screen fade-in">
      {/* Progress & Timer Bar */}
      <div className="question-header">
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="question-counter">
            Question {questionNumber}/{totalQuestions}
          </span>
        </div>
        
        {/* Circular Timer */}
        <div className="timer-container">
          <svg className="timer-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="timer-bg" />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              className="timer-progress"
              style={{
                strokeDasharray: `${(timerPercent / 100) * 283} 283`,
                stroke: timerColor
              }}
            />
          </svg>
          <div className="timer-text" style={{ color: timerColor }}>
            {timeLeft}s
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="question-content">
        {/* Leaderboard Sidebar */}
        <div className="leaderboard-sidebar">
          <h3>🏆 Top Players</h3>
          <div className="leaderboard-list">
            {sortedPlayers.map((player, idx) => (
              <div key={player.userId} className="leaderboard-item">
                <span className="rank-badge">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <div className="player-mini-info">
                  <img src={player.avatar} alt={player.username} className="mini-avatar" />
                  <span className="mini-username">{player.username}</span>
                </div>
                <span className="mini-score">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Question Card */}
        <div className="question-card">
          <h2 className="question-text">{question.question}</h2>
          
          {/* Options */}
          <div className="options-grid">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`
                  option-btn 
                  stagger-${idx}
                  ${selectedAnswer === option ? 'selected' : ''}
                  ${selectedAnswer !== null ? 'disabled' : ''}
                `}
                onClick={() => !selectedAnswer && onAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{option}</span>
                {selectedAnswer === option && (
                  <span className="option-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Your Score */}
      <div className="your-score">
        <span>Your Score: <strong>{score} pts</strong></span>
      </div>
    </div>
  );
}

export default QuestionScreen;
