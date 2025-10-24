import React, { useEffect, useState } from 'react';
import '../../styles/battleComponents.css';

function ResultsScreen({ finalResults, winner, currentUserId, onPlayAgain, onBackToDashboard }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const didIWin = winner?.userId === currentUserId;
  
  useEffect(() => {
    if (didIWin) {
      setShowConfetti(true);
      // Play victory sound if available
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      playVictorySound(audioContext);
    }
  }, [didIWin]);
  
  const playVictorySound = (audioContext) => {
    try {
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.setValueAtTime(1200, now + 0.1);
      oscillator.frequency.setValueAtTime(1500, now + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.setValueAtTime(0, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (e) {
      // Silently fail if audio not supported
    }
  };
  
  return (
    <div className={`results-screen fade-in ${didIWin ? 'won' : ''}`}>
      {showConfetti && <Confetti />}
      
      {/* Winner Announcement */}
      <div className="winner-announcement">
        <h1 className="winner-title">
          {didIWin ? '🎉 VICTORY! 🎉' : '🏆 Battle Complete'}
        </h1>
        <div className="winner-card">
          <img 
            src={winner.avatar} 
            alt={winner.username}
            className={`winner-avatar ${didIWin ? 'bounce' : ''}`}
          />
          <div className="winner-info">
            <h2>{winner.username}</h2>
            <p className="final-score">{winner.score} Points</p>
          </div>
        </div>
      </div>
      
      {/* Final Rankings */}
      <div className="final-rankings">
        <h2>Final Rankings</h2>
        <div className="rankings-list">
          {finalResults?.map((player, idx) => (
            <div 
              key={player.userId}
              className={`ranking-card ${player.userId === currentUserId ? 'highlight' : ''}`}
            >
              <span className="rank-emoji">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </span>
              
              <img src={player.avatar} alt={player.username} className="rank-avatar" />
              
              <div className="rank-player-info">
                <h3>{player.username}</h3>
                <div className="rank-stats">
                  <span>📊 {player.score} pts</span>
                  <span>🎯 {player.accuracy}</span>
                  <span>⚡ {player.avgTime}</span>
                </div>
              </div>
              
              {player.userId === currentUserId && (
                <span className="you-badge">YOU</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="results-actions">
        <button 
          className="btn btn-primary btn-large"
          onClick={onPlayAgain}
        >
          🔄 Play Again
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onBackToDashboard}
        >
          🏠 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// Confetti component
function Confetti() {
  return (
    <div className="confetti-container">
      {Array(50).fill(null).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: Math.random() * 100 + '%',
            delay: Math.random() * 0.5 + 's',
            duration: Math.random() * 2 + 2 + 's',
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  );
}

export default ResultsScreen;
