import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useBlog } from '../hooks/useBlog';
import RichTextEditor from './RichTextEditor';
import RichTextDisplay from './RichTextDisplay';
import NotificationPrompt from './NotificationPrompt';

interface BlogPageProps {
  isPastorLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ isPastorLoggedIn, onNavigate }) => {
  const { blogPosts, loading, createPost, updatePost, deletePost } = useBlog();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  });

  const currentPost = selectedPost ? blogPosts.find(p => p.id === selectedPost) : null;

  // Show notification prompt when user reads a blog post
  useEffect(() => {
    if (currentPost) {
      const hasSeenBlogPrompt = localStorage.getItem('hasSeenBlogNotificationPrompt');
      if (!hasSeenBlogPrompt) {
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
          localStorage.setItem('hasSeenBlogNotificationPrompt', 'true');
        }, 10000); // Show after 10 seconds of reading
        return () => clearTimeout(timer);
      }
    }
  }, [currentPost]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      try {
        await createPost(formData.title, formData.content, formData.excerpt);
        setFormData({ title: '', content: '', excerpt: '' });
        setShowCreateForm(false);
      } catch (error) {
        alert('Failed to create post. Please try again.');
      }
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost && formData.title.trim() && formData.content.trim()) {
      try {
        await updatePost(editingPost, formData.title, formData.content, formData.excerpt);
        setFormData({ title: '', content: '', excerpt: '' });
        setEditingPost(null);
      } catch (error) {
        alert('Failed to update post. Please try again.');
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const startEditing = (post: any) => {
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || ''
    });
    setEditingPost(post.id);
    setShowCreateForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
      </div>
    );
  }

  if (currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Blog</span>
          </button>

          <article className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-slate-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Pastor Stefan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(currentPost.created_at)}</span>
                </div>
              </div>
              
              {isPastorLoggedIn && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditing(currentPost)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(currentPost.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-8 leading-tight">
              {currentPost.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
              <RichTextDisplay content={currentPost.content} className="text-base sm:text-lg" />
            </div>
          </article>
        </div>
        
        {/* Content Viewed Notification Prompt */}
        {showNotificationPrompt && (
          <NotificationPrompt
            trigger="content_viewed"
            onClose={() => setShowNotificationPrompt(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-2 sm:mb-4">Pastor Stefan's Blog</h1>
            <p className="text-lg sm:text-xl text-slate-600">Wisdom for your spiritual journey</p>
          </div>
          
          {isPastorLoggedIn && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingPost(null);
                setFormData({ title: '', content: '', excerpt: '' });
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all flex items-center space-x-3 self-start sm:self-auto"
            >
              <Plus className="h-5 w-5" />
              <span>New Post</span>
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && isPastorLoggedIn && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h3>
            
            <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Excerpt (Optional)
                </label>
                <RichTextEditor
                  value={formData.excerpt}
                  onChange={(value) => setFormData({ ...formData, excerpt: value })}
                  placeholder="Brief description for the blog preview"
                  className="w-full"
                  minHeight="h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Content
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write your blog post content here..."
                  className="w-full"
                  minHeight="h-80"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-slate-800 transition-all"
                >
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPost(null);
                    setFormData({ title: '', content: '', excerpt: '' });
                  }}
                  className="bg-slate-100 text-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 hover:bg-white/80 transition-all cursor-pointer group"
              onClick={() => setSelectedPost(post.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(post.created_at)}</span>
                </div>
                
                {isPastorLoggedIn && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(post);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 line-clamp-2 group-hover:text-slate-700 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                {post.excerpt || post.content.substring(0, 150) + '...'}
              </p>

              <div className="mt-4 flex items-center text-slate-500 text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Read more</span>
              </div>
            </div>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No blog posts yet</h3>
            <p className="text-slate-600">
              {isPastorLoggedIn ? 'Create your first blog post to get started.' : 'Check back soon for new content from Pastor Stefan.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;