import React from 'react';
import { MessageCircle, Users, Shield, Home } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isPastorLoggedIn: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isPastorLoggedIn }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'questions', label: 'Questions', icon: MessageCircle },
    { id: 'chat', label: 'Live Chat', icon: Users },
    { id: 'pastor', label: 'Pastor', icon: Shield },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-light tracking-wider text-slate-900">
              ASK PASTOR STEFAN
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
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
            
            {/* CTA Button */}
            <button 
              onClick={() => onNavigate('questions')}
              className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Let's talk</span>
              <span className="text-orange-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;