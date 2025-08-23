"use client";

import { useEffect, useState } from 'react';

export default function ScrollRestorationIndicator({ elementId, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!elementId) return;

    // Check if we're returning to a specific element
    const checkForReturn = () => {
      const element = document.getElementById(elementId);
      if (element && window.location.hash === `#${elementId}`) {
        // Highlight the element briefly
        setIsVisible(true);
        
        // Add a subtle highlight effect
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
        
        // Remove the highlight after duration
        setTimeout(() => {
          setIsVisible(false);
          if (element) {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = '';
          }
        }, duration);
      }
    };

    // Check after a short delay to ensure DOM is ready
    const timer = setTimeout(checkForReturn, 100);
    
    return () => clearTimeout(timer);
  }, [elementId, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
        <span className="text-sm font-medium">Returned to your previous position</span>
      </div>
    </div>
  );
}
