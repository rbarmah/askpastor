import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Heart, Send, ArrowRight, Sparkles, Quote, BookOpen, Book } from 'lucide-react';
import { useEmailSubscription } from '../hooks/useEmailSubscription';
import { useBlog } from '../hooks/useBlog';
import { useTestimonies } from '../hooks/useTestimonies';
import { useNovels } from '../hooks/useNovels';
import { useWeeklyChat } from '../hooks/useWeeklyChat';
import NotificationManager from './NotificationManager';
import NotificationPrompt from './NotificationPrompt';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { subscribe, loading } = useEmailSubscription();
  const { blogPosts } = useBlog();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const { getFeaturedTestimonies } = useTestimonies();
  const { novels } = useNovels();
  const { getNextSession, getCurrentSession, isSessionLive } = useWeeklyChat();

  // Typing animation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Define questions outside of useEffect to avoid dependency issues
  const questions = [
    "Will God forgive me?",
    "Why is God allowing me and my family to suffer?",
    "Why is my mother sick - we have been praying?",
    "Is it wrong to have doubts about my faith?",
    "Why do bad things happen to good people?",
    "How do I know if God is real or just in my head?",
    "Is masturbation a sin that will send me to hell?",
    "Why does God feel so distant when I need Him most?",
    "Am I going to hell for being attracted to the same sex?",
    "Why didn't God answer my prayers when my dad left?",
    "Is it okay to be angry at God for taking my friend?"
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

  const featuredTestimonies = getFeaturedTestimonies().slice(0, 3);
  const latestNovels = novels.filter(n => n.is_published).slice(0, 3);
  const nextSession = getNextSession();
  const currentSession = getCurrentSession();
  const isLive = nextSession && isSessionLive(nextSession);
  
  // Show notification prompt for first-time visitors
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('hasSeenNotificationPrompt');
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
        localStorage.setItem('hasSeenNotificationPrompt', 'true');
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Orb */}
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 hidden lg:block">
          <div className="w-96 h-96 bg-gradient-to-br from-orange-200/30 to-teal-200/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-slate-900 mb-4 lg:mb-6 leading-tight">
                Pastor, I have a question:
                <br />
                <span className="text-slate-600 min-h-[1.2em] block text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                  {currentText}
                  <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 mb-6 lg:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Real answers for real struggles.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('questions')}
                  className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center space-x-3 group"
                >
                  <span>ASK A QUESTION</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => onNavigate('testimonies')}
                  className="bg-white/60 backdrop-blur-sm border border-slate-200/50 text-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium tracking-wide hover:bg-white/80 transition-all duration-300 flex items-center space-x-3 group"
                >
                  <Heart className="h-5 w-5" />
                  <span>SHARE YOUR STORY</span>
                </button>
              </div>
            </div>

            {/* Right Content - Simplified for mobile */}
            <div className="text-center lg:text-right order-first lg:order-last">
              <div className="flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-3">
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 sm:px-4 py-2 rounded-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide">QUESTIONS</span>
                </div>
                <button
                  onClick={() => onNavigate('chat')}
                  className={`backdrop-blur-sm border px-3 sm:px-4 py-2 rounded-full transition-all ${
                    isLive 
                      ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                      : 'bg-white/60 border-slate-200/50 text-slate-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium tracking-wide">
                    {isLive ? '🔴 LIVE CHAT' : 'LIVE CHAT'}
                  </span>
                </button>
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 sm:px-4 py-2 rounded-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide">STORIES</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 sm:px-4 py-2 rounded-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide">TESTIMONIES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Banner */}
      {isLive && (
        <div className="bg-red-500 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-medium">Pastor Stefan is LIVE now!</span>
                <span className="text-red-100">Weekly chat session in progress</span>
              </div>
              <button
                onClick={() => onNavigate('chat')}
                className="bg-white text-red-500 px-6 py-2 rounded-full font-medium hover:bg-red-50 transition-all self-start sm:self-auto"
              >
                Join Live Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section - Simplified */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3 lg:mb-4">Why This Hits Different</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Ask Anything</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              No question is too deep or personal.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Live Sessions</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Real-time conversations with Pastor Stefan.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Book className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Inspiring Stories</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Fiction and non-fiction to encourage your faith.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Share Stories</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Inspire others with your testimony.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonies Section */}
      {featuredTestimonies.length > 0 && (
        <div className="bg-white/50 backdrop-blur-sm border-y border-slate-200/50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 lg:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">Stories of Hope</h2>
                <p className="text-slate-600 text-sm sm:text-base">Real transformation, real people</p>
              </div>
              <button
                onClick={() => onNavigate('testimonies')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">View All</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredTestimonies.map((testimony, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="h-6 w-6 text-slate-400 mr-3" />
                    <div>
                      <div className="font-medium text-slate-900">{testimony.author_name}</div>
                      {testimony.age && <div className="text-sm text-slate-500">Age {testimony.age}</div>}
                    </div>
                  </div>
                  <h4 className="font-medium text-slate-900 mb-2">{testimony.title}</h4>
                  <p className="text-slate-700 leading-relaxed text-sm mb-4 line-clamp-4">{testimony.content}</p>
                  <button
                    onClick={() => onNavigate('testimonies')}
                    className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-all"
                  >
                    Read full story →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Latest Stories Section */}
      {latestNovels.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">Latest Stories</h2>
              <p className="text-slate-600 text-sm sm:text-base">Fiction and non-fiction to inspire your journey</p>
            </div>
            <button
              onClick={() => onNavigate('novels')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
            >
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">View All</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNovels.map((novel) => (
              <div key={novel.id} className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all cursor-pointer">
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full border text-xs font-medium ${
                    novel.genre === 'Fiction' 
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    {novel.genre === 'Fiction' ? '📚' : '📖'} {novel.genre}
                  </span>
                  <span className="text-xs text-slate-500">{novel.reading_time} min read</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-3 line-clamp-2">{novel.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{novel.description}</p>
                <div className="text-xs text-slate-500">
                  {new Date(novel.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">Latest from Pastor Stefan</h2>
            <p className="text-slate-600 text-sm sm:text-base">Wisdom for your journey</p>
          </div>
          <button
            onClick={() => onNavigate('blog')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">View All</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all cursor-pointer">
              <h3 className="text-lg font-medium text-slate-900 mb-3 line-clamp-2">{post.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="text-xs text-slate-500">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section - Simplified */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-slate-200/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-1">500+</div>
              <div className="text-slate-600 text-xs sm:text-sm">Questions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-1">50+</div>
              <div className="text-slate-600 text-xs sm:text-sm">Live Sessions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-1">{latestNovels.length}+</div>
              <div className="text-slate-600 text-xs sm:text-sm">Stories</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-1">1000+</div>
              <div className="text-slate-600 text-xs sm:text-sm">Lives Changed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3">Stay Updated</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Get instant notifications when new content is posted or when Pastor Stefan goes live.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <NotificationManager />
        </div>
      </div>

      {/* Newsletter Section - Simplified */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-5 w-5 text-slate-700" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-light text-slate-900 mb-3">Stay Connected</h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base">
            Get notified when Pastor Stefan goes live.
          </p>
          
          <form onSubmit={handleSubscribe} className="max-w-sm mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
          
          {subscribed && (
            <div className="mt-4 text-teal-600 font-medium text-sm">
              ✓ You're in! Check your email.
            </div>
          )}
        </div>
      </div>
      
      {/* First Visit Notification Prompt */}
      {showNotificationPrompt && (
        <NotificationPrompt
          trigger="first_visit"
          onClose={() => setShowNotificationPrompt(false)}
        />
      )}
    </div>
  );
};

export default HomePage;