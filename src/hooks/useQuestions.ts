import { useState, useEffect } from 'react';
import { supabase, Question } from '../lib/supabase';

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async (text: string, authorName: string, isAnonymous: boolean) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          text,
          author_name: isAnonymous ? 'Anonymous' : authorName || 'Anonymous',
          is_anonymous: isAnonymous
        }])
        .select()
        .single();

      if (error) throw error;
      setQuestions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error submitting question:', error);
      throw error;
    }
  };

  const answerQuestion = async (questionId: string, answer: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .update({
          answered: true,
          answer,
          answer_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? data : q));
      return data;
    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    }
  };

  const toggleLike = async (questionId: string, userIdentifier: string) => {
    try {
      // Check if user already liked this question
      const { data: existingLike } = await supabase
        .from('question_likes')
        .select('id')
        .eq('question_id', questionId)
        .eq('user_identifier', userIdentifier)
        .single();

      if (existingLike) {
        // Remove like
        await supabase
          .from('question_likes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_identifier', userIdentifier);

        // Decrease like count
        const { data, error } = await supabase
          .from('questions')
          .update({ likes: questions.find(q => q.id === questionId)!.likes - 1 })
          .eq('id', questionId)
          .select()
          .single();

        if (error) throw error;
        setQuestions(prev => prev.map(q => q.id === questionId ? data : q));
      } else {
        // Add like
        await supabase
          .from('question_likes')
          .insert([{ question_id: questionId, user_identifier: userIdentifier }]);

        // Increase like count
        const { data, error } = await supabase
          .from('questions')
          .update({ likes: questions.find(q => q.id === questionId)!.likes + 1 })
          .eq('id', questionId)
          .select()
          .single();

        if (error) throw error;
        setQuestions(prev => prev.map(q => q.id === questionId ? data : q));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchQuestions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('questions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'questions' },
        () => fetchQuestions()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    questions,
    loading,
    submitQuestion,
    answerQuestion,
    toggleLike,
    refetch: fetchQuestions
  };
};