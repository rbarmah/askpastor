import React, { useState } from 'react';
import { Bell, BellOff, Check, X, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationManager: React.FC = () => {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    loading, 
    subscribe, 
    unsubscribe, 
    sendTestNotification 
  } = useNotifications();
  
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setError(null);
      await subscribe();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to enable notifications');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setError(null);
      await unsubscribe();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disable notifications');
    }
  };

  const handleTestNotification = () => {
    try {
      setError(null);
      sendTestNotification();
    } catch (error) {
      setError('Failed to send test notification');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-slate-50/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-slate-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-900">Notifications Not Supported</p>
            <p className="text-xs text-slate-600 mt-1">
              Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-slate-900" />
            ) : (
              <BellOff className="h-5 w-5 text-slate-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">Push Notifications</h3>
            <p className="text-sm text-slate-600">
              Get notified about new questions, answers, and blog posts
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span className="text-sm">Details</span>
        </button>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          {permission === 'granted' ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm font-medium text-slate-700">
            Permission: {permission === 'granted' ? 'Granted' : permission === 'denied' ? 'Denied' : 'Not Requested'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isSubscribed ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm font-medium text-slate-700">
            Status: {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-slate-50/60 border border-slate-200/50 rounded-xl p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-slate-600 flex-shrink-0" />
            <p className="text-sm text-slate-700">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Enable Notifications</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleTestNotification}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span>Send Test Notification</span>
            </button>
            
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  <span>Disable Notifications</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-slate-200/50">
          <h4 className="text-sm font-medium text-slate-900 mb-3">What you'll be notified about:</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
              <span>New questions from community members</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
              <span>Pastor Stefan's answers to questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <span>New blog posts and stories</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span>Live chat session announcements</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-50/60 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="h-4 w-4 text-slate-600" />
              <Monitor className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700">Works on all devices</span>
            </div>
            <p className="text-xs text-slate-600">
              Notifications work on desktop and mobile browsers. You can manage them in your browser settings anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;