import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface EmailNotificationSubscription {
  id: string;
  email: string;
  is_active: boolean;
  notification_types: string[];
  created_at: string;
}

export const useEmailNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<EmailNotificationSubscription[]>([]);

  const subscribeToNotifications = async (email: string, notificationTypes: string[] = ['question_answered']) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_notification_subscriptions')
        .insert([{
          email,
          notification_types: notificationTypes,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          // Update existing subscription
          const { data: updatedData, error: updateError } = await supabase
            .from('email_notification_subscriptions')
            .update({
              notification_types: notificationTypes,
              is_active: true
            })
            .eq('email', email)
            .select()
            .single();

          if (updateError) throw updateError;
          return updatedData;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error subscribing to email notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_notification_subscriptions')
        .update({ is_active: false })
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error unsubscribing from email notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSubscription = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('email_notification_subscriptions')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  };

  return {
    loading,
    subscriptions,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    getSubscription
  };
};