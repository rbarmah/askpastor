import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import QuestionsPage from './components/QuestionsPage';
import ChatPage from './components/ChatPage';
import BlogPage from './components/BlogPage';
import TestimoniesPage from './components/TestimoniesPage';
import NovelsPage from './components/NovelsPage';
import PastorDashboard from './components/PastorDashboard';
import Navigation from './components/Navigation';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isPastorLoggedIn, setIsPastorLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user should see loading screen
  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    
    if (visitCount < 2) {
      setIsLoading(true);
      // Increment visit count
      localStorage.setItem('visitCount', (visitCount + 1).toString());
    }
  }, []);

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
      case 'blog':
        return <BlogPage isPastorLoggedIn={isPastorLoggedIn} onNavigate={setCurrentPage} />;
      case 'testimonies':
        return <TestimoniesPage isPastorLoggedIn={isPastorLoggedIn} onNavigate={setCurrentPage} />;
      case 'novels':
        return <NovelsPage isPastorLoggedIn={isPastorLoggedIn} onNavigate={setCurrentPage} />;
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