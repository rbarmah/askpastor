import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotificationTriggers } from './useNotificationTriggers';

interface NotificationSubscription {
  id: string;
  user_identifier: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  is_active: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useNotificationTriggers();

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if user is already subscribed
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    let permission: NotificationPermission;
    
    // Handle both callback and promise-based permission requests
    if ('Notification' in window) {
      if (typeof Notification.requestPermission === 'function') {
        permission = await Notification.requestPermission();
      } else {
        // Fallback for older browsers
        permission = await new Promise((resolve) => {
          Notification.requestPermission(resolve);
        });
      }
    } else {
      throw new Error('Notifications not supported');
    }
    
    setPermission(permission);
    return permission === 'granted';
  };

  const subscribe = async (): Promise<void> => {
    setLoading(true);
    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update(); // Force update to latest version

      // Default VAPID key for development (in production, this should come from environment)
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f4EmOGOzOtQjMnyqyaaiAGcQXJQQOOEHuLLjXRBhWJ2U33yiNk8';

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      // Save subscription to database
      const subscriptionData = subscription.toJSON();
      const userIdentifier = localStorage.getItem('userIdentifier') || 
        (() => {
          const id = Math.random().toString(36).substr(2, 9);
          localStorage.setItem('userIdentifier', id);
          return id;

      const { error } = await supabase
        .from('notification_subscriptions')
        .insert([{
          user_identifier: userIdentifier,
          endpoint: subscriptionData.endpoint,
          p256dh_key: subscriptionData.keys?.p256dh,
          auth_key: subscriptionData.keys?.auth
        }]);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (): Promise<void> => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        const userIdentifier = localStorage.getItem('userIdentifier');
        if (userIdentifier) {
          const { error } = await supabase
            .from('notification_subscriptions')
            .update({ is_active: false })
            .eq('user_identifier', userIdentifier);
            
          if (error) {
            console.error('Database error:', error);
          }
        }
      }
      
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      try {
        // Try to send via service worker first
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'Test Notification',
            body: 'This is a test notification from Ask Pastor Stefan!',
            icon: '/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png'
          });
        }
      } catch (error) {
        console.error('Failed to send test notification:', error);
      }
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}