import React, { useState } from 'react';
import { MessageCircle, Users, Shield, Home, Menu, X, BookOpen, Heart, Book } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isPastorLoggedIn: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isPastorLoggedIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'questions', label: 'Questions', icon: MessageCircle },
    { id: 'chat', label: 'Live Chat', icon: Users },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'novels', label: 'Stories', icon: Book },
    { id: 'testimonies', label: 'Testimonies', icon: Heart },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <img 
                src="/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png" 
                alt="Ask Pastor Stefan Logo" 
                className="h-8 w-auto sm:h-10"
              />
              <div className="text-lg sm:text-2xl font-light tracking-wider text-slate-900">
                <span className="hidden sm:inline">ASK PASTOR STEFAN</span>
                <span className="sm:hidden">APS</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-full transition-all duration-300 ${
                      currentPage === item.id
                        ? 'text-slate-900 bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  </button>
                );
              })}
              
              {/* Desktop CTA Button */}
              <button 
                onClick={() => handleNavigate('questions')}
                className="bg-slate-900 text-white px-4 lg:px-6 py-2 rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Let's talk</span>
                <span className="text-orange-400">→</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                        currentPage === item.id
                          ? 'text-slate-900 bg-slate-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
                
                {/* Mobile CTA Button */}
                <button 
                  onClick={() => handleNavigate('questions')}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
                >
                  <span>Let's talk</span>
                  <span className="text-orange-400">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hidden Pastor Access Button - Bottom Right Corner */}
      <button
        onClick={() => handleNavigate('pastor')}
        className="fixed bottom-4 right-4 w-12 h-12 bg-slate-800/20 hover:bg-slate-800/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 opacity-30 hover:opacity-100 z-30"
        title="Pastor Access"
      >
        <Shield className="h-5 w-5 text-slate-600" />
      </button>
    </>
  );
};

export default Navigation;