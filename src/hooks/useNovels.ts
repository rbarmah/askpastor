import { useState, useEffect } from 'react';
import { supabase, Novel, NovelGenre, NovelCategory } from '../lib/supabase';

export const useNovels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNovels = async (includeUnpublished = false) => {
    try {
      let query = supabase
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNovel = async (
    title: string,
    description: string,
    content: string,
    genre: NovelGenre,
    category: NovelCategory,
    readingTime?: number,
    coverImageUrl?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .insert([{
          title,
          description,
          content,
          genre,
          category,
          reading_time: readingTime || Math.ceil(content.split(' ').length / 200), // Estimate reading time
          cover_image_url: coverImageUrl,
          is_published: true
        }])
        .select()
        .single();

      if (error) throw error;
      setNovels(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating novel:', error);
      throw error;
    }
  };

  const updateNovel = async (
    novelId: string,
    title: string,
    description: string,
    content: string,
    genre: NovelGenre,
    category: NovelCategory,
    readingTime?: number,
    coverImageUrl?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .update({
          title,
          description,
          content,
          genre,
          category,
          reading_time: readingTime || Math.ceil(content.split(' ').length / 200),
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', novelId)
        .select()
        .single();

      if (error) throw error;
      setNovels(prev => prev.map(novel => novel.id === novelId ? data : novel));
      return data;
    } catch (error) {
      console.error('Error updating novel:', error);
      throw error;
    }
  };

  const deleteNovel = async (novelId: string) => {
    try {
      const { error } = await supabase
        .from('novels')
        .delete()
        .eq('id', novelId);

      if (error) throw error;
      setNovels(prev => prev.filter(novel => novel.id !== novelId));
    } catch (error) {
      console.error('Error deleting novel:', error);
      throw error;
    }
  };

  const togglePublished = async (novelId: string, published: boolean) => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .update({
          is_published: published,
          updated_at: new Date().toISOString()
        })
        .eq('id', novelId)
        .select()
        .single();

      if (error) throw error;
      setNovels(prev => prev.map(novel => novel.id === novelId ? data : novel));
      return data;
    } catch (error) {
      console.error('Error toggling published status:', error);
      throw error;
    }
  };

  const getNovelsByGenre = (genre: NovelGenre) => {
    return novels.filter(novel => novel.genre === genre && novel.is_published);
  };

  const getNovelsByCategory = (category: NovelCategory) => {
    return novels.filter(novel => novel.category === category && novel.is_published);
  };

  useEffect(() => {
    fetchNovels();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('novels_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'novels' },
        () => fetchNovels()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    novels,
    loading,
    createNovel,
    updateNovel,
    deleteNovel,
    togglePublished,
    getNovelsByGenre,
    getNovelsByCategory,
    refetch: fetchNovels
  };
};