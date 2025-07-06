import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationManager from './NotificationManager';

const NotificationFloatingButton: React.FC = () => {
  const { isSupported, isSubscribed } = useNotifications();
  const [showManager, setShowManager] = useState(false);

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowManager(true)}
        className={`fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 z-40 flex items-center justify-center ${
          isSubscribed 
            ? 'bg-slate-900 text-white hover:bg-slate-800' 
            : 'bg-slate-600 text-white hover:bg-slate-700 animate-pulse'
        }`}
        title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
      >
        {isSubscribed ? (
          <Bell className="h-6 w-6" />
        ) : (
          <BellOff className="h-6 w-6" />
        )}
      </button>

      {showManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
                <button
                  onClick={() => setShowManager(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ×
                </button>
              </div>
              <NotificationManager />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationFloatingButton;