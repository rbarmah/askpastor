import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, MessageCircle, Users, TrendingUp, Calendar, LogOut, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { useChat } from '../hooks/useChat';
import { useBlog } from '../hooks/useBlog';

interface PastorDashboardProps {
  isLoggedIn: boolean;
  onLogin: (status: boolean) => void;
  onNavigate: (page: string) => void;
}

const PastorDashboard: React.FC<PastorDashboardProps> = ({ isLoggedIn, onLogin, onNavigate }) => {
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  });

  const { questions } = useQuestions();
  const { chatRooms } = useChat();
  const { blogPosts, createPost, updatePost, deletePost } = useBlog();

  const pastorPasskeys = [
    'Faith2024!Strong',
    'HopeAnchor#777',
    'GracePower$99',
    'TruthSeeker@123',
    'LoveWins&Always',
    'SpiritLed*456',
    'WisdomPath#888',
    'PrayerWarrior!321',
    'BibleStudy@555',
    'PastorHeart$777'
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastorPasskeys.includes(passkeyInput)) {
      onLogin(true);
    } else {
      alert('Invalid passkey. Please try again.');
    }
  };

  const handleSignOut = () => {
    onLogin(false);
    onNavigate('home');
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blogFormData.title.trim() && blogFormData.content.trim()) {
      try {
        await createPost(blogFormData.title, blogFormData.content, blogFormData.excerpt);
        setBlogFormData({ title: '', content: '', excerpt: '' });
        setShowCreateBlog(false);
      } catch (error) {
        alert('Failed to create blog post. Please try again.');
      }
    }
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlogId && blogFormData.title.trim() && blogFormData.content.trim()) {
      try {
        await updatePost(editingBlogId, blogFormData.title, blogFormData.content, blogFormData.excerpt);
        setBlogFormData({ title: '', content: '', excerpt: '' });
        setEditingBlogId(null);
        setShowCreateBlog(false);
      } catch (error) {
        alert('Failed to update blog post. Please try again.');
      }
    }
  };

  const handleDeleteBlog = async (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        alert('Failed to delete blog post. Please try again.');
      }
    }
  };

  const startEditingBlog = (post: any) => {
    setBlogFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || ''
    });
    setEditingBlogId(post.id);
    setShowCreateBlog(true);
    setActiveTab('blog');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const unansweredQuestions = questions.filter(q => !q.answered).length;
  const answeredToday = questions.filter(q => {
    if (!q.answer_timestamp) return false;
    const today = new Date().toDateString();
    return new Date(q.answer_timestamp).toDateString() === today;
  }).length;
  const activeChats = chatRooms.filter(r => r.is_active).length;
  const totalParticipants = chatRooms.reduce((sum, room) => sum + room.participants, 0);

  const stats = [
    { label: 'Unanswered Questions', value: unansweredQuestions.toString(), icon: MessageCircle, color: 'from-teal-100 to-teal-200' },
    { label: 'Answered Today', value: answeredToday.toString(), icon: TrendingUp, color: 'from-orange-100 to-orange-200' },
    { label: 'Active Chat Rooms', value: activeChats.toString(), icon: Users, color: 'from-pink-100 to-pink-200' },
    { label: 'Blog Posts', value: blogPosts.length.toString(), icon: BookOpen, color: 'from-purple-100 to-purple-200' }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-slate-700" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3">Pastor Login</h1>
              <p className="text-slate-600 text-sm sm:text-base">Enter your secure passkey to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 sm:space-y-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Passkey
                </label>
                <div className="relative">
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Enter your passkey"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 sm:right-4 top-3 sm:top-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPasskey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300"
              >
                <span className="flex items-center justify-center space-x-3">
                  <Lock className="h-5 w-5" />
                  <span>Access Dashboard</span>
                </span>
              </button>
            </form>

            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-slate-50/60 rounded-2xl border border-slate-200/50">
              <h3 className="text-sm font-medium text-slate-700 mb-4 tracking-wide">Quick Access (Demo)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pastorPasskeys.slice(0, 4).map((passkey, index) => (
                  <button
                    key={index}
                    onClick={() => setPasskeyInput(passkey)}
                    className="text-xs text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/80 px-3 py-2 rounded-lg transition-all border border-slate-200/50 text-left"
                  >
                    {passkey}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header with Sign Out */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 lg:mb-16 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-2 sm:mb-4">Welcome back, Pastor Stefan!</h1>
            <p className="text-lg sm:text-xl text-slate-600">Here's what's happening with your ministry today</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium tracking-wide transition-all duration-300 flex items-center space-x-3 self-start sm:self-auto"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-2 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'blog'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Blog Management
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">{stat.value}</div>
                    <div className="text-slate-600 tracking-wide text-sm sm:text-base">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16">
              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6 sm:mb-8">Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => onNavigate('questions')}
                    className="w-full bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all text-left"
                  >
                    Answer New Questions
                  </button>
                  <button
                    onClick={() => onNavigate('chat')}
                    className="w-full bg-slate-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium tracking-wide hover:bg-slate-600 transition-all text-left"
                  >
                    Start Live Chat Session
                  </button>
                  <button
                    onClick={() => setActiveTab('blog')}
                    className="w-full bg-slate-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium tracking-wide hover:bg-slate-400 transition-all text-left"
                  >
                    Write New Blog Post
                  </button>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6 sm:mb-8">Recent Activity</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-4 p-3 sm:p-4 bg-slate-50/60 rounded-2xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-slate-900 font-medium text-sm sm:text-base">Answered {answeredToday} questions</div>
                      <div className="text-slate-500 text-xs sm:text-sm">Today</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 sm:p-4 bg-slate-50/60 rounded-2xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-slate-900 font-medium text-sm sm:text-base">{activeChats} active chat rooms</div>
                      <div className="text-slate-500 text-xs sm:text-sm">Right now</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 sm:p-4 bg-slate-50/60 rounded-2xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-slate-900 font-medium text-sm sm:text-base">{blogPosts.length} blog posts published</div>
                      <div className="text-slate-500 text-xs sm:text-sm">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Passkeys */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-4 sm:mb-6">Your Secure Passkeys</h3>
              <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Keep these passkeys secure. You can use any of them to access your dashboard.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {pastorPasskeys.map((passkey, index) => (
                  <div
                    key={index}
                    className="bg-slate-50/60 border border-slate-200/50 rounded-xl p-3 sm:p-4 font-mono text-xs sm:text-sm text-slate-700 break-all"
                  >
                    {passkey}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-8">
            {/* Blog Management Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">Blog Management</h2>
                <p className="text-slate-600">Create and manage your blog posts</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateBlog(true);
                  setEditingBlogId(null);
                  setBlogFormData({ title: '', content: '', excerpt: '' });
                }}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all flex items-center space-x-3 self-start sm:self-auto"
              >
                <Plus className="h-5 w-5" />
                <span>New Blog Post</span>
              </button>
            </div>

            {/* Create/Edit Blog Form */}
            {showCreateBlog && (
              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">
                  {editingBlogId ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h3>
                
                <form onSubmit={editingBlogId ? handleUpdateBlog : handleCreateBlog} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                      Title
                    </label>
                    <input
                      type="text"
                      value={blogFormData.title}
                      onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                      placeholder="Enter blog post title"
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                      Excerpt (Optional)
                    </label>
                    <textarea
                      value={blogFormData.excerpt}
                      onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                      placeholder="Brief description for the blog preview"
                      className="w-full h-20 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                      Content
                    </label>
                    <textarea
                      value={blogFormData.content}
                      onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                      placeholder="Write your blog post content here..."
                      className="w-full h-64 sm:h-80 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-slate-800 transition-all"
                    >
                      {editingBlogId ? 'Update Post' : 'Publish Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateBlog(false);
                        setEditingBlogId(null);
                        setBlogFormData({ title: '', content: '', excerpt: '' });
                      }}
                      className="bg-slate-100 text-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Blog Posts List */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">Your Blog Posts</h3>
              
              {blogPosts.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-900 mb-2">No blog posts yet</h4>
                  <p className="text-slate-600 mb-6">Create your first blog post to get started.</p>
                  <button
                    onClick={() => {
                      setShowCreateBlog(true);
                      setEditingBlogId(null);
                      setBlogFormData({ title: '', content: '', excerpt: '' });
                    }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-slate-900 mb-2">{post.title}</h4>
                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                            {post.excerpt || post.content.substring(0, 150) + '...'}
                          </p>
                          <div className="text-xs text-slate-500">
                            Published on {formatDate(post.created_at)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <button
                            onClick={() => startEditingBlog(post)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(post.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastorDashboard;