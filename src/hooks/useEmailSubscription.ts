import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useEmailSubscription = () => {
  const [loading, setLoading] = useState(false);

  const subscribe = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .insert([{ email }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('This email is already subscribed!');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error subscribing email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
};