import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../../styles/battleComponents.css';

function LobbyScreen({ roomCode, players, isHost, onStart, onCreateRoom }) {
  const [showSettings, setShowSettings] = useState(false);
  const maxPlayers = 4;
  const difficulty = 'medium';
  
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
            
            {/* Empty slots */}
            {Array(Math.max(0, maxPlayers - players.length)).fill(null).map((_, idx) => (
              <div key={`empty-${idx}`} className="player-card empty-slot">
                <div className="empty-icon">?</div>
                <p>Waiting...</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Battle Settings */}
        <div className="battle-settings">
          <h2>Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <span className="setting-label">Max Players</span>
              <span className="setting-value">{maxPlayers}</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Difficulty</span>
              <span className="setting-value capitalize">{difficulty}</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Questions</span>
              <span className="setting-value">10</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Time/Question</span>
              <span className="setting-value">15s</span>
            </div>
          </div>
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
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSettings(!showSettings)}
              >
                ⚙️ Settings
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
