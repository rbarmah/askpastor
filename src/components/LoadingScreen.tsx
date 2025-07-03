import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 px-4">
      {/* Animated Logo */}
      <div className="text-center">
        <div className="relative mb-6 sm:mb-8">
          {/* Dotted Pattern Animation */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"
                style={{
                  top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                  left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                  animationDelay: `${i * 0.1}s`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-400 to-orange-400 rounded-full opacity-60 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-white text-lg sm:text-xl font-light tracking-wider mb-4">
          Brewing your Experience..
        </div>

        {/* Progress Bar */}
        <div className="w-48 sm:w-64 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 to-orange-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;