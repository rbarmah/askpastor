import { useState, useEffect } from 'react';
import { supabase, BlogPost } from '../lib/supabase';

export const useBlog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title: string, content: string, excerpt?: string) => {
    try {
      console.log('Creating new blog post:', title);
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          published: true,
          author: 'Pastor Stefan'
        }])
        .select()
        .single();

      if (error) throw error;
      setBlogPosts(prev => [data, ...prev]);
      console.log('Blog post created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  };

  const updatePost = async (postId: string, title: string, content: string, excerpt?: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + '...',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      setBlogPosts(prev => prev.map(post => post.id === postId ? data : post));
      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBlogPosts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blog_posts' },
        () => fetchBlogPosts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    blogPosts,
    loading,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchBlogPosts
  };
};