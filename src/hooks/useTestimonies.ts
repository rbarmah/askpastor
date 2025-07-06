import { useState, useEffect } from 'react';
import { supabase, Testimony } from '../lib/supabase';

export const useTestimonies = () => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonies = async (includeUnapproved = false) => {
    try {
      let query = supabase
        .from('testimonies')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeUnapproved) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTestimonies(data || []);
    } catch (error) {
      console.error('Error fetching testimonies:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitTestimony = async (
    title: string,
    content: string,
    authorName: string,
    age?: number,
    isAnonymous: boolean = false
  ) => {
    try {
      const { data, error } = await supabase
        .from('testimonies')
        .insert([{
          title,
          content,
          author_name: isAnonymous ? 'Anonymous' : authorName || 'Anonymous',
          age: isAnonymous ? null : age,
          is_anonymous: isAnonymous,
          is_approved: false // Requires pastor approval
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting testimony:', error);
      throw error;
    }
  };

  const approveTestimony = async (testimonyId: string, approved: boolean) => {
    try {
      console.log('Approving testimony:', testimonyId, approved);
      const { data, error } = await supabase
        .from('testimonies')
        .update({
          is_approved: approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonyId)
        .select()
        .single();

      if (error) throw error;
      setTestimonies(prev => prev.map(t => t.id === testimonyId ? data : t));
      console.log('Testimony approval updated:', data);
      return data;
    } catch (error) {
      console.error('Error approving testimony:', error);
      throw error;
    }
  };

  const featureTestimony = async (testimonyId: string, featured: boolean) => {
    try {
      const { data, error } = await supabase
        .from('testimonies')
        .update({
          is_featured: featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonyId)
        .select()
        .single();

      if (error) throw error;
      setTestimonies(prev => prev.map(t => t.id === testimonyId ? data : t));
      return data;
    } catch (error) {
      console.error('Error featuring testimony:', error);
      throw error;
    }
  };

  const deleteTestimony = async (testimonyId: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .delete()
        .eq('id', testimonyId);

      if (error) throw error;
      setTestimonies(prev => prev.filter(t => t.id !== testimonyId));
    } catch (error) {
      console.error('Error deleting testimony:', error);
      throw error;
    }
  };

  const getFeaturedTestimonies = () => {
    return testimonies.filter(t => t.is_featured && t.is_approved);
  };

  useEffect(() => {
    fetchTestimonies();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('testimonies_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'testimonies' },
        () => fetchTestimonies()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    testimonies,
    loading,
    submitTestimony,
    approveTestimony,
    featureTestimony,
    deleteTestimony,
    getFeaturedTestimonies,
    refetch: fetchTestimonies
  };
};