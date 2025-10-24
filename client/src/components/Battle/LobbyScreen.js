import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../../styles/battleComponents.css';

function LobbyScreen({ roomCode, players, isHost, onStart, onCreateRoom, onSettingsChange }) {
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [timePerQuestion, setTimePerQuestion] = useState(15);
  const [questionCount, setQuestionCount] = useState(10);
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('✅ Room code copied!');
  };
  
  const handleStartClick = () => {
    if (players.length < 2) {
      toast.warning('Need at least 2 players to start');
      return;
    }
    onStart();
  };
  
  const handleSaveSettings = () => {
    if (onSettingsChange) {
      onSettingsChange({ difficulty, timePerQuestion, questionCount });
    }
    setShowSettings(false);
    toast.success('✅ Settings saved!');
  };
  
  return (
    <div className="lobby-screen fade-in">
      <div className="lobby-container">
        {/* Header */}
        <div className="lobby-header">
          <h1>🎮 Battle Lobby</h1>
          <p>Get ready to battle!</p>
        </div>
        
        {/* Room Code Display */}
        <div className="room-code-section">
          <h2>Room Code</h2>
          <div className="room-code-box">
            <div className="code-display">{roomCode}</div>
            <button className="copy-btn" onClick={copyRoomCode}>
              📋 Copy
            </button>
          </div>
          <p className="room-hint">Share this code with friends to invite them!</p>
        </div>
        
        {/* Players Section */}
        <div className="players-section">
          <h2>Players ({players.length})</h2>
          <div className="players-grid">
            {players.map(player => (
              <div key={player.userId} className="player-card slide-in">
                <div className="player-avatar">
                  <img src={player.avatar} alt={player.username} />
                </div>
                <div className="player-info">
                  <p className="player-username">{player.username}</p>
                  <p className="player-status">🟢 Ready</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Battle Settings */}
        <div className="battle-settings">
          <h2>⚙️ Settings {isHost && <button className="btn-icon" onClick={() => setShowSettings(!showSettings)}>✏️</button>}</h2>
          
          {isHost && showSettings ? (
            <div className="settings-grid editable">
              <div className="setting-item">
                <label className="setting-label">Difficulty</label>
                <select 
                  className="setting-input"
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="setting-item">
                <label className="setting-label">Questions</label>
                <input 
                  type="number"
                  className="setting-input"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  min="5"
                  max="20"
                />
              </div>
              <div className="setting-item">
                <label className="setting-label">Time/Question (sec)</label>
                <input 
                  type="number"
                  className="setting-input"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
                  min="5"
                  max="60"
                />
              </div>
              <button className="btn btn-small btn-success" onClick={handleSaveSettings}>
                ✅ Save
              </button>
              <button className="btn btn-small btn-secondary" onClick={() => setShowSettings(false)}>
                ❌ Cancel
              </button>
            </div>
          ) : (
            <div className="settings-grid">
              <div className="setting-item">
                <span className="setting-label">Difficulty</span>
                <span className="setting-value capitalize">{difficulty}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Questions</span>
                <span className="setting-value">{questionCount}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Time/Question</span>
                <span className="setting-value">{timePerQuestion}s</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="lobby-actions">
          {isHost && (
            <>
              <button 
                className="btn btn-primary btn-large pulse"
                onClick={handleStartClick}
                disabled={players.length < 2}
              >
                🚀 Start Battle
              </button>
            </>
          )}
          
          {!isHost && (
            <div className="waiting-for-host">
              <p>⏳ Waiting for host to start...</p>
              <div className="dots-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LobbyScreen;
