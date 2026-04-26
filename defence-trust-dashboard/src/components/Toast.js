import React, { useEffect, useState } from 'react';
import './Toast.css';

export function Toast({ message, type = 'success', duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
    </div>
  );
}
