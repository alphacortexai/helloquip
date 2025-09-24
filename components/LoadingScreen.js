"use client";

import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    "Welcome"
  ];

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[200]">
      <div className="text-center">
        {/* Logo Area */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo.png?alt=media&token=580aa6cc-f6d0-4ace-bcda-8e7b6b573821"
              alt="HelloQuip Logo"
              className="h-12 md:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Progress Percentage */}
        <p className="text-sm text-gray-600">
          {Math.round(Math.min(progress, 100))}%
        </p>

        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}