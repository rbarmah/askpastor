import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(true);

  // Define the sequence of messages
  const messages = [
    "Do you have questions on your heart?",
    "Are you battling in your mind?", 
    "Are you feeling overwhelmed?",
    "Or you just want to know God more?",
    <>Get ready to ask <span className="font-bold italic">Pastor Stefan</span> whatever is on your heart.</>,
    "Ready?"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000); // Extra pause before completing
          return 100;
        }
        return prev + 0.5; // Much slower progress - takes about 20 seconds total
      });
    }, 100); // Slower interval

    return () => clearInterval(timer);
  }, [onComplete]);

  // Handle message transitions - much slower
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setShowMessage(false); // Fade out current message
      
      setTimeout(() => {
        setCurrentMessageIndex(prev => {
          if (prev < messages.length - 1) {
            return prev + 1;
          }
          return prev; // Stay on last message
        });
        setShowMessage(true); // Fade in new message
      }, 500); // Longer fade transition
      
    }, 3500); // Much longer - 3.5 seconds per message

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-50 px-4">
      {/* Animated Logo */}
      <div className="text-center">
        <div className="relative mb-8 sm:mb-12">
          {/* Dotted Pattern Animation */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-pulse"
                style={{
                  top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                  left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                  animationDelay: `${i * 0.15}s`, // Slower animation
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-200/60 to-orange-200/60 rounded-full opacity-80 animate-pulse" 
                   style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Transitional Messages */}
        <div className="mb-8 sm:mb-12 h-20 sm:h-24 flex items-center justify-center">
          <div 
            className={`text-slate-900 text-lg sm:text-xl lg:text-2xl font-light tracking-wide text-center max-w-lg mx-auto leading-relaxed transition-all duration-500 ${
              showMessage ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-3'
            }`}
          >
            {messages[currentMessageIndex]}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 sm:w-64 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-teal-300 to-orange-300 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtitle - appears only on last message */}
        <div className={`transition-all duration-700 ${
          currentMessageIndex === messages.length - 1 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}>
          <div className="text-slate-600 text-sm sm:text-base font-light">
            Real talk, real answers
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;