import React from 'react';
import './AIRobotBackground.css';

const AIRobotBackground = () => {
  return (
    <div className="robot-background">
      {/* Animated background gradient */}
      <div className="background-gradient"></div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      {/* Main robot SVG */}
      <svg className="robot" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
        {/* Robot body - main container */}
        <g className="robot-body">
          {/* Head */}
          <rect x="80" y="30" width="140" height="120" rx="20" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2"/>
          
          {/* Eyes */}
          <g className="eyes">
            <circle cx="110" cy="70" r="12" fill="#60a5fa" className="eye-white"/>
            <circle cx="110" cy="70" r="7" fill="#1e40af" className="eye-pupil"/>
            
            <circle cx="190" cy="70" r="12" fill="#60a5fa" className="eye-white"/>
            <circle cx="190" cy="70" r="7" fill="#1e40af" className="eye-pupil"/>
          </g>

          {/* Screen/Display */}
          <rect x="90" y="90" width="120" height="45" rx="5" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
          <text x="150" y="120" textAnchor="middle" fill="#60a5fa" fontSize="24" fontWeight="bold" className="display-text">AI</text>

          {/* Antenna */}
          <line x1="150" y1="30" x2="150" y2="0" stroke="#3b82f6" strokeWidth="4" className="antenna"/>
          <circle cx="150" cy="0" r="5" fill="#60a5fa"/>

          {/* Neck connector */}
          <rect x="120" y="145" width="60" height="15" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1"/>

          {/* Body/Torso */}
          <rect x="70" y="160" width="160" height="100" rx="15" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2"/>

          {/* Chest panel */}
          <rect x="85" y="175" width="130" height="70" rx="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>

          {/* LED lights on chest */}
          <g className="chest-leds">
            <circle cx="100" cy="190" r="6" fill="#ef4444" className="led led-1"/>
            <circle cx="150" cy="190" r="6" fill="#eab308" className="led led-2"/>
            <circle cx="200" cy="190" r="6" fill="#10b981" className="led led-3"/>
            
            <circle cx="100" cy="215" r="6" fill="#3b82f6" className="led led-4"/>
            <circle cx="150" cy="215" r="6" fill="#ec4899" className="led led-5"/>
            <circle cx="200" cy="215" r="6" fill="#8b5cf6" className="led led-6"/>
          </g>

          {/* Left arm */}
          <g className="left-arm">
            <rect x="35" y="180" width="35" height="20" rx="10" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2"/>
            <circle cx="35" cy="190" r="8" fill="#1e40af"/>
          </g>

          {/* Right arm */}
          <g className="right-arm">
            <rect x="230" y="180" width="35" height="20" rx="10" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2"/>
            <circle cx="265" cy="190" r="8" fill="#1e40af"/>
          </g>

          {/* Legs */}
          <rect x="105" y="260" width="25" height="80" rx="5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2"/>
          <rect x="170" y="260" width="25" height="80" rx="5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2"/>

          {/* Feet */}
          <rect x="95" y="340" width="45" height="15" rx="5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2"/>
          <rect x="160" y="340" width="45" height="15" rx="5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2"/>
        </g>

        {/* Book being held */}
        <g className="book" transform="translate(220, 200)">
          {/* Book cover */}
          <rect x="0" y="0" width="50" height="70" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="2"/>
          <text x="25" y="35" textAnchor="middle" fill="#fca5a5" fontSize="16" fontWeight="bold">LEARN</text>
          
          {/* Book pages */}
          <g className="book-pages">
            <rect x="2" y="5" width="46" height="60" fill="#fef2f2" opacity="0.7"/>
            <line x1="5" y1="15" x2="45" y2="15" stroke="#fed7d7" strokeWidth="1" opacity="0.5"/>
            <line x1="5" y1="25" x2="45" y2="25" stroke="#fed7d7" strokeWidth="1" opacity="0.5"/>
            <line x1="5" y1="35" x2="45" y2="35" stroke="#fed7d7" strokeWidth="1" opacity="0.5"/>
          </g>
        </g>
      </svg>

      {/* Glow effect around robot */}
      <div className="robot-glow"></div>

      {/* Light rays effect */}
      <div className="light-rays">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="light-ray" style={{
            transform: `rotate(${i * 60}deg)`,
            animationDelay: `${i * 0.2}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

export default AIRobotBackground;
