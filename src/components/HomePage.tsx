import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Heart, Send, ArrowRight, Sparkles } from 'lucide-react';
import { useEmailSubscription } from '../hooks/useEmailSubscription';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { subscribe, loading } = useEmailSubscription();

  // Typing animation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Define questions outside of useEffect to avoid dependency issues
  const questions = [
    "Will God forgive me?",
    "Why is God allowing me and my family to suffer?",
    "Why is my mother sick - we have been praying?"
  ];

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (isTyping) {
      if (currentText.length < currentQuestion.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentQuestion.slice(0, currentText.length + 1));
        }, 100); // Typing speed
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause before erasing
        return () => clearTimeout(timeout);
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50); // Erasing speed
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next question
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
        setIsTyping(true);
      }
    }
  }, [currentText, isTyping, currentQuestionIndex]); // Removed 'questions' from dependencies

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await subscribe(email);
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to subscribe');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Orb */}
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 hidden lg:block">
          <div className="w-96 h-96 bg-gradient-to-br from-orange-200/30 to-teal-200/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-slate-900 mb-6 lg:mb-8 leading-tight">
                Pastor, I have a question:
                <br />
                <span className="text-slate-600 min-h-[1.2em] block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                  {currentText}
                  <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-8 lg:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Share your hardest questions, I am here to answer them through the wisdom of the Holy Spirit.
              </p>
              
              <button
                onClick={() => onNavigate('questions')}
                className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center space-x-3 group mx-auto lg:mx-0"
              >
                <span>LET'S TALK</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Content */}
            <div className="text-center lg:text-right order-first lg:order-last">
              <p className="text-base sm:text-lg text-slate-600 mb-6 lg:mb-8 leading-relaxed">
                Whether through deep conversations, 
                live community sessions, or personal spiritual 
                guidance, we create moments that 
                people don't just hear — they feel.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-4">
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 sm:px-4 py-2 rounded-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide">QUESTIONS</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 sm:px-4 py-2 rounded-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide">LIVE CHAT</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 sm:px-4 py-2 rounded-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide">COMMUNITY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="text-center mb-12 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 mb-4 lg:mb-6">Why This Hits Different</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            This isn't your typical church website. We're here to tackle the real stuff.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 lg:mb-4">Ask Anything</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              No question is too deep, too weird, or too personal. Pastor Stefan gets it.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 lg:mb-4">Live Sessions</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Jump into real-time conversations with Pastor Stefan and other young believers.
            </p>
          </div>

          <div className="text-center group sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 lg:mb-4">Safe Space</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Share your struggles without judgment. This is your space to be real.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-slate-200/50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-2">500+</div>
              <div className="text-slate-600 tracking-wide text-sm sm:text-base">Questions Answered</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-2">50+</div>
              <div className="text-slate-600 tracking-wide text-sm sm:text-base">Live Sessions</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-2">1000+</div>
              <div className="text-slate-600 tracking-wide text-sm sm:text-base">Young People Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 lg:mb-8">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-4 lg:mb-6">Stay Connected</h2>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 lg:mb-12 max-w-2xl mx-auto">
            Get notified when Pastor Stefan goes live, plus weekly encouragement straight to your inbox.
          </p>
          
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium hover:bg-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
          
          {subscribed && (
            <div className="mt-6 text-teal-600 font-medium text-sm sm:text-base">
              ✓ You're in! Check your email for confirmation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;