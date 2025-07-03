import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Heart, Send, LogIn, Plus, Bell, Search, TrendingUp as Trending } from 'lucide-react';
import HomePage from './components/HomePage';
import QuestionsPage from './components/QuestionsPage';
import ChatPage from './components/ChatPage';
import PastorDashboard from './components/PastorDashboard';
import Navigation from './components/Navigation';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isPastorLoggedIn, setIsPastorLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'questions':
        return <QuestionsPage isPastorLoggedIn={isPastorLoggedIn} />;
      case 'chat':
        return <ChatPage isPastorLoggedIn={isPastorLoggedIn} />;
      case 'pastor':
        return <PastorDashboard 
          isLoggedIn={isPastorLoggedIn} 
          onLogin={setIsPastorLoggedIn}
          onNavigate={setCurrentPage}
        />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navigation 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          isPastorLoggedIn={isPastorLoggedIn}
        />
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;