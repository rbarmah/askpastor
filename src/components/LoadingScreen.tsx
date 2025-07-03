import React, { useEffect, useState } from 'react';
import { Check, Heart, Shield, Users, MessageCircle } from 'lucide-react';

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [hasAcceptedGuidelines, setHasAcceptedGuidelines] = useState(false);
  const [currentGuidelineSection, setCurrentGuidelineSection] = useState(0);

  // Define the sequence of messages
  const messages = [
    "Do you have questions on your heart?",
    "Are you battling in your mind?", 
    "Are you feeling overwhelmed?",
    "Or you just want to know God more?",
    <>Get ready to ask <span className="font-bold italic">Pastor Stefan</span> whatever is on your heart.</>,
    "Ready?"
  ];

  // Guidelines sections
  const guidelinesSections = [
    {
      title: "Welcome to Our Community",
      icon: Heart,
      content: [
        "This is a safe space where you can ask any question about faith, life, and spirituality without judgment.",
        "Pastor Stefan is here to provide biblical guidance, encouragement, and support for your journey.",
        "Every question matters, and no topic is off-limits. We believe in honest, authentic conversations about faith."
      ]
    },
    {
      title: "Community Guidelines",
      icon: Users,
      content: [
        "• Be respectful and kind to everyone in the community",
        "• Share authentically but respect others' privacy",
        "• No hate speech, discrimination, or harmful content",
        "• Keep discussions focused on faith, personal growth, and spiritual matters",
        "• Support one another with love and understanding"
      ]
    },
    {
      title: "Privacy & Safety",
      icon: Shield,
      content: [
        "• You can post questions anonymously if you prefer",
        "• Your personal information is kept secure and private",
        "• Live chat sessions are moderated for everyone's safety",
        "• Report any inappropriate behavior to maintain our safe environment",
        "• We never share your personal details without permission"
      ]
    },
    {
      title: "How It Works",
      icon: MessageCircle,
      content: [
        "• Ask questions in any category that fits your situation",
        "• Pastor Stefan personally reviews and answers each question",
        "• Join weekly live chat sessions every Saturday 7-8 PM GMT",
        "• Read inspiring stories and testimonies from others",
        "• Access biblical resources and encouraging content"
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Show guidelines after progress completes
          setTimeout(() => setShowGuidelines(true), 500);
          return 100;
        }
        return prev + 0.5; // Much slower progress - takes about 20 seconds total
      });
    }, 100); // Slower interval

    return () => clearInterval(timer);
  }, []);

  // Handle message transitions - much slower
  useEffect(() => {
    if (showGuidelines) return; // Stop message transitions when guidelines show

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
  }, [showGuidelines]);

  const handleAcceptGuidelines = () => {
    setHasAcceptedGuidelines(true);
    setTimeout(onComplete, 1000);
  };

  const nextGuidelineSection = () => {
    if (currentGuidelineSection < guidelinesSections.length - 1) {
      setCurrentGuidelineSection(prev => prev + 1);
    }
  };

  const prevGuidelineSection = () => {
    if (currentGuidelineSection > 0) {
      setCurrentGuidelineSection(prev => prev - 1);
    }
  };

  if (showGuidelines) {
    const currentSection = guidelinesSections[currentGuidelineSection];
    const Icon = currentSection.icon;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-50 px-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon className="h-8 w-8 text-slate-700" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">{currentSection.title}</h1>
              <div className="flex items-center justify-center space-x-2 mb-6">
                {guidelinesSections.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentGuidelineSection
                        ? 'bg-slate-900 w-8'
                        : index < currentGuidelineSection
                        ? 'bg-slate-400'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-8 min-h-[200px]">
              {currentSection.content.map((item, index) => (
                <div
                  key={index}
                  className="text-slate-700 leading-relaxed text-base sm:text-lg"
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <button
                onClick={prevGuidelineSection}
                disabled={currentGuidelineSection === 0}
                className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Previous
              </button>

              <div className="text-sm text-slate-500">
                {currentGuidelineSection + 1} of {guidelinesSections.length}
              </div>

              {currentGuidelineSection < guidelinesSections.length - 1 ? (
                <button
                  onClick={nextGuidelineSection}
                  className="px-6 py-3 rounded-xl font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleAcceptGuidelines}
                  className="px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-orange-500 text-white hover:from-teal-600 hover:to-orange-600 transition-all flex items-center space-x-3"
                >
                  <Check className="h-5 w-5" />
                  <span>I Accept & Continue</span>
                </button>
              )}
            </div>

            {/* Terms Notice */}
            {currentGuidelineSection === guidelinesSections.length - 1 && (
              <div className="mt-8 p-4 bg-slate-50/60 rounded-2xl border border-slate-200/50">
                <p className="text-sm text-slate-600 text-center leading-relaxed">
                  By continuing, you agree to follow our community guidelines and acknowledge that this platform provides spiritual guidance and support, but is not a substitute for professional counseling or medical advice when needed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (hasAcceptedGuidelines) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-200/60 to-orange-200/60 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Check className="h-8 w-8 text-slate-700" />
          </div>
          <div className="text-slate-900 text-xl font-light tracking-wide">
            Welcome to the community!
          </div>
          <div className="text-slate-600 text-sm mt-2">
            Preparing your experience...
          </div>
        </div>
      </div>
    );
  }

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