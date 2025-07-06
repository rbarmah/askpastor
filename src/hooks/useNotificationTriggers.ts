import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hook to trigger notifications when new content is created
export const useNotificationTriggers = () => {
  useEffect(() => {
    console.log('Setting up notification triggers...');
    
    // Subscribe to new questions
    const questionsSubscription = supabase
      .channel('questions_notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'questions' },
        (payload) => {
          console.log('New question detected:', payload.new);
          triggerNotification({
            title: 'New Question Posted',
            body: `Someone asked: "${payload.new.text.substring(0, 100)}${payload.new.text.length > 100 ? '...' : ''}"`,
            type: 'question',
            data: { url: '/questions', questionId: payload.new.id }
          });
        }
      )
      .subscribe();

    // Subscribe to new answers
    const answersSubscription = supabase
      .channel('answers_notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'questions',
          filter: 'answered=eq.true'
        },
        (payload) => {
          if (payload.new.answered && !payload.old.answered) {
            console.log('New answer detected:', payload.new);
            triggerNotification({
              title: 'Pastor Stefan Answered a Question',
              body: `"${payload.new.text.substring(0, 80)}${payload.new.text.length > 80 ? '...' : ''}"`,
              type: 'answer',
              data: { url: '/questions', questionId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new blog posts
    const blogSubscription = supabase
      .channel('blog_notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'blog_posts' },
        (payload) => {
          if (payload.new.published) {
            console.log('New blog post detected:', payload.new);
            triggerNotification({
              title: 'New Blog Post from Pastor Stefan',
              body: payload.new.title,
              type: 'blog',
              data: { url: '/blog', postId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new novels/stories
    const novelsSubscription = supabase
      .channel('novels_notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'novels' },
        (payload) => {
          if (payload.new.is_published) {
            console.log('New novel detected:', payload.new);
            triggerNotification({
              title: 'New Story Published',
              body: `"${payload.new.title}" - ${payload.new.genre}`,
              type: 'novel',
              data: { url: '/novels', novelId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new testimonies
    const testimoniesSubscription = supabase
      .channel('testimonies_notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'testimonies',
          filter: 'is_approved=eq.true'
        },
        (payload) => {
          if (payload.new.is_approved && !payload.old.is_approved) {
            console.log('New testimony detected:', payload.new);
            triggerNotification({
              title: 'New Testimony Shared',
              body: `"${payload.new.title}" by ${payload.new.author_name}`,
              type: 'testimony',
              data: { url: '/testimonies', testimonyId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to live chat sessions
    const chatSubscription = supabase
      .channel('chat_notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chat_sessions',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          if (payload.new.is_active && !payload.old.is_active) {
            console.log('Live chat started:', payload.new);
            triggerNotification({
              title: 'Pastor Stefan is Live!',
              body: 'Join the weekly live chat session now',
              type: 'live_chat',
              data: { url: '/chat', sessionId: payload.new.id }
            });
          }
        }
      )
      .subscribe();
    
    console.log('All notification subscriptions set up');

    return () => {
      console.log('Cleaning up notification subscriptions');
      questionsSubscription.unsubscribe();
      answersSubscription.unsubscribe();
      blogSubscription.unsubscribe();
      novelsSubscription.unsubscribe();
      testimoniesSubscription.unsubscribe();
      chatSubscription.unsubscribe();
    };
  }, []);
};

// Function to trigger notifications
const triggerNotification = async (notificationData: {
  title: string;
  body: string;
  type: string;
  data?: any;
}) => {
  try {
    console.log('Triggering notification:', notificationData);
    
    // First try to show local notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('Showing local notification');
      new Notification(notificationData.title, {
        body: notificationData.body,
        icon: '/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png',
        badge: '/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png',
        tag: `ask-pastor-stefan-${notificationData.type}`,
        data: notificationData.data
      });
    } else {
      console.log('Notification permission not granted or not supported');
    }

    // Try to send via service worker for subscribed users
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        console.log('Sending notification via service worker');
        registration.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: notificationData.title,
          body: notificationData.body,
          icon: '/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png'
        });
      }
    }
    
    // In production, you would also send push notifications to all subscribed users
    // via your backend service
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
