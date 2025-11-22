import React, { useState, useEffect } from 'react';
import { Mail, Check, X, Bell, BellOff, AlertCircle } from 'lucide-react';
import { useEmailNotifications } from '../hooks/useEmailNotifications';

const EmailNotificationManager: React.FC = () => {
  const { loading, subscribeToNotifications, unsubscribeFromNotifications, getSubscription } = useEmailNotifications();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setError(null);
      setSuccess(null);
      await subscribeToNotifications(email, ['question_answered']);
      setIsSubscribed(true);
      setSuccess('Successfully subscribed! You\'ll receive email notifications when Pastor Stefan answers questions.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to subscribe to notifications');
    }
  };

  const handleUnsubscribe = async () => {
    if (!email.trim()) return;

    try {
      setError(null);
      setSuccess(null);
      await unsubscribeFromNotifications(email);
      setIsSubscribed(false);
      setSuccess('Successfully unsubscribed from email notifications.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to unsubscribe from notifications');
    }
  };

  const checkSubscription = async () => {
    if (!email.trim()) {
      setIsSubscribed(false);
      return;
    }

    setCheckingSubscription(true);
    try {
      const subscription = await getSubscription(email);
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Check subscription status when email changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkSubscription();
    }, 500); // Debounce email input

    return () => clearTimeout(timeoutId);
  }, [email]);

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
          <Mail className="h-5 w-5 text-slate-900" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-900">Email Notifications</h3>
          <p className="text-sm text-slate-600">
            Get notified when Pastor Stefan answers questions
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-50/60 border border-green-200/50 rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50/60 border border-red-200/50 rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubscribe} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
              required
            />
            {checkingSubscription && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-900 rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        {email && !checkingSubscription && (
          <div className="flex items-center space-x-2 text-sm">
            {isSubscribed ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Subscribed to notifications</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Not subscribed</span>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isSubscribed ? (
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  <span>Subscribe to Notifications</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  <span>Unsubscribe</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Information */}
      <div className="mt-6 p-4 bg-slate-50/60 rounded-xl">
        <h4 className="text-sm font-medium text-slate-900 mb-2">What you'll receive:</h4>
        <div className="space-y-1 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
            <span>Email when Pastor Stefan answers any question</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
            <span>Direct link to read the answer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
            <span>Unsubscribe anytime with one click</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mt-3">
          We respect your privacy. Your email is only used for notifications and will never be shared.
        </p>
      </div>
    </div>
  );
};

export default EmailNotificationManager;