import React, { useState, useEffect } from 'react';
import { Bell, X, Smartphone, Monitor } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationBanner: React.FC = () => {
  const { isSupported, permission, isSubscribed, subscribe } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('notificationBannerDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner if notifications are supported but not enabled
    if (isSupported && permission !== 'granted' && !isSubscribed) {
      // Show after a short delay to not overwhelm users
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  const handleEnable = async () => {
    try {
      await subscribe();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  if (!isVisible || isDismissed || !isSupported || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/20">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Bell className="h-4 w-4" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Stay Connected!</h3>
            <p className="text-xs text-blue-100 mb-3">
              Get instant notifications when Pastor Stefan answers questions or posts new content.
            </p>
            
            <div className="flex items-center space-x-2 mb-3">
              <Smartphone className="h-3 w-3 text-blue-200" />
              <Monitor className="h-3 w-3 text-blue-200" />
              <span className="text-xs text-blue-200">Works on all devices</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleEnable}
                className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-50 transition-all"
              >
                Enable Notifications
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/30 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;