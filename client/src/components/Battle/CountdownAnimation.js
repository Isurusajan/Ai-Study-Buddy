import React, { useState, useEffect } from 'react';
import '../../styles/battleComponents.css';

function CountdownAnimation() {
  const [count, setCount] = useState(3);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="countdown-overlay">
      <div className={`countdown-number ${count === 0 ? 'go' : 'bounce'}`}>
        {count === 0 ? '🚀 GO!' : count}
      </div>
      <div className="battle-starting-text">
        Get Ready!
      </div>
    </div>
  );
}

export default CountdownAnimation;
