import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Sparkles } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationPromptProps {
  trigger: 'question_submitted' | 'first_visit' | 'content_viewed';
  onClose: () => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ trigger, onClose }) => {
  const { isSupported, permission, isSubscribed, subscribe } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    // Only show if notifications are supported and not already enabled
    if (isSupported && permission !== 'granted' && !isSubscribed) {
      setIsVisible(true);
    }
  }, [isSupported, permission, isSubscribed]);

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      await subscribe();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setIsEnabling(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const getPromptContent = () => {
    switch (trigger) {
      case 'question_submitted':
        return {
          title: 'Get notified when Pastor Stefan answers!',
          description: 'We\'ll let you know as soon as your question gets a response.',
          icon: '💬'
        };
      case 'first_visit':
        return {
          title: 'Never miss new content!',
          description: 'Get notified about new questions, answers, blog posts, and live sessions.',
          icon: '🔔'
        };
      case 'content_viewed':
        return {
          title: 'Enjoying the content?',
          description: 'Get notified when Pastor Stefan posts new blogs and stories.',
          icon: '📚'
        };
      default:
        return {
          title: 'Stay connected!',
          description: 'Get notifications for new content and updates.',
          icon: '✨'
        };
    }
  };

  if (!isVisible || !isSupported || isSubscribed) {
    return null;
  }

  const content = getPromptContent();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isEnabling ? (
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            ) : isSubscribed ? (
              <Check className="h-8 w-8 text-green-600" />
            ) : (
              <Bell className="h-8 w-8 text-blue-600" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {isSubscribed ? 'All set!' : content.title}
          </h3>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            {isSubscribed ? 'You\'ll now receive notifications for new content!' : content.description}
          </p>
          
          {!isSubscribed && (
            <div className="space-y-3">
              <button
                onClick={handleEnable}
                disabled={isEnabling}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isEnabling ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>Enable Notifications</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleClose}
                className="w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                Not Now
              </button>
            </div>
          )}
          
          {isSubscribed && (
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Continue</span>
            </button>
          )}
        </div>
        
        {!isSubscribed && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationPrompt;