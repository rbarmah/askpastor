import React, { useState } from 'react';
import { BookOpen, Clock, User, ArrowLeft, Filter, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNovels } from '../hooks/useNovels';
import { NOVEL_GENRES, NOVEL_CATEGORIES, NovelGenre, NovelCategory } from '../lib/supabase';
import RichTextEditor from './RichTextEditor';
import RichTextDisplay from './RichTextDisplay';

interface NovelsPageProps {
  isPastorLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

const NovelsPage: React.FC<NovelsPageProps> = ({ isPastorLoggedIn, onNavigate }) => {
  const { novels, loading, createNovel, updateNovel, deleteNovel, togglePublished, refetch } = useNovels();
  const [selectedNovel, setSelectedNovel] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNovel, setEditingNovel] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState<NovelGenre | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<NovelCategory | 'all'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    genre: 'Fiction' as NovelGenre,
    category: 'Inspirational' as NovelCategory,
    readingTime: '',
    coverImageUrl: ''
  });

  // Fetch all novels for pastor, only published for public
  React.useEffect(() => {
    if (isPastorLoggedIn) {
      refetch(true); // Include unpublished novels for pastor
    } else {
      refetch(false); // Only published novels for public
    }
  }, [isPastorLoggedIn]);

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      try {
        await createNovel(
          formData.title,
          formData.description,
          formData.content,
          formData.genre,
          formData.category,
          formData.readingTime ? parseInt(formData.readingTime) : undefined,
          formData.coverImageUrl || undefined
        );
        setFormData({
          title: '',
          description: '',
          content: '',
          genre: 'Fiction',
          category: 'Inspirational',
          readingTime: '',
          coverImageUrl: ''
        });
        setShowCreateForm(false);
      } catch (error) {
        alert('Failed to create novel. Please try again.');
      }
    }
  };

  const handleUpdateNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel && formData.title.trim() && formData.content.trim()) {
      try {
        await updateNovel(
          editingNovel,
          formData.title,
          formData.description,
          formData.content,
          formData.genre,
          formData.category,
          formData.readingTime ? parseInt(formData.readingTime) : undefined,
          formData.coverImageUrl || undefined
        );
        setFormData({
          title: '',
          description: '',
          content: '',
          genre: 'Fiction',
          category: 'Inspirational',
          readingTime: '',
          coverImageUrl: ''
        });
        setEditingNovel(null);
        setShowCreateForm(false);
      } catch (error) {
        alert('Failed to update novel. Please try again.');
      }
    }
  };

  const handleDeleteNovel = async (novelId: string) => {
    if (confirm('Are you sure you want to delete this novel?')) {
      try {
        await deleteNovel(novelId);
      } catch (error) {
        alert('Failed to delete novel. Please try again.');
      }
    }
  };

  const handleTogglePublished = async (novelId: string, published: boolean) => {
    try {
      await togglePublished(novelId, published);
    } catch (error) {
      alert('Failed to update publication status.');
    }
  };

  const startEditing = (novel: any) => {
    setFormData({
      title: novel.title,
      description: novel.description,
      content: novel.content,
      genre: novel.genre,
      category: novel.category,
      readingTime: novel.reading_time.toString(),
      coverImageUrl: novel.cover_image_url || ''
    });
    setEditingNovel(novel.id);
    setShowCreateForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenreIcon = (genre: string) => {
    return genre === 'Fiction' ? '📚' : '📖';
  };

  const getGenreColor = (genre: string) => {
    return genre === 'Fiction' 
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  // Filter novels
  const filteredNovels = novels.filter(novel => {
    const genreMatch = filterGenre === 'all' || novel.genre === filterGenre;
    const categoryMatch = filterCategory === 'all' || novel.category === filterCategory;
    const publishedMatch = isPastorLoggedIn || novel.is_published;
    return genreMatch && categoryMatch && publishedMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
      </div>
    );
  }

  const currentNovel = selectedNovel ? novels.find(n => n.id === selectedNovel) : null;

  if (currentNovel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <button
            onClick={() => setSelectedNovel(null)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Novels</span>
          </button>

          <article className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-slate-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{currentNovel.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{currentNovel.reading_time} min read</span>
                </div>
              </div>
              
              {isPastorLoggedIn && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditing(currentNovel)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNovel(currentNovel.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getGenreColor(currentNovel.genre)}`}>
                <span className="mr-1">{getGenreIcon(currentNovel.genre)}</span>
                {currentNovel.genre}
              </span>
              <span className="px-3 py-1 rounded-full border text-sm font-medium bg-slate-100 text-slate-700 border-slate-200">
                {currentNovel.category}
              </span>
              {!currentNovel.is_published && isPastorLoggedIn && (
                <span className="px-3 py-1 rounded-full border text-sm font-medium bg-yellow-100 text-yellow-700 border-yellow-200">
                  Draft
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-4 leading-tight">
              {currentNovel.title}
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {currentNovel.description}
            </p>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
              <RichTextDisplay content={currentNovel.content} className="text-base sm:text-lg" />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/50 text-sm text-slate-500">
              Published on {formatDate(currentNovel.created_at)}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-2 sm:mb-4">Pastor Stefan's Stories</h1>
            <p className="text-lg sm:text-xl text-slate-600">Fiction and non-fiction stories to inspire and encourage</p>
          </div>
          
          {isPastorLoggedIn && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingNovel(null);
                setFormData({
                  title: '',
                  description: '',
                  content: '',
                  genre: 'Fiction',
                  category: 'Inspirational',
                  readingTime: '',
                  coverImageUrl: ''
                });
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-all flex items-center space-x-3 self-start sm:self-auto"
            >
              <Plus className="h-5 w-5" />
              <span>New Story</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900">Browse Stories</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Genre</label>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value as NovelGenre | 'all')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
              >
                <option value="all">All Genres</option>
                {NOVEL_GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {getGenreIcon(genre)} {genre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as NovelCategory | 'all')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
              >
                <option value="all">All Categories</option>
                {NOVEL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && isPastorLoggedIn && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">
              {editingNovel ? 'Edit Story' : 'Create New Story'}
            </h3>
            
            <form onSubmit={editingNovel ? handleUpdateNovel : handleCreateNovel} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter story title"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Reading Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.readingTime}
                    onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                    placeholder="Auto-calculated if empty"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value as NovelGenre })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                  >
                    {NOVEL_GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {getGenreIcon(genre)} {genre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as NovelCategory })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                  >
                    {NOVEL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Brief description of the story"
                  className="w-full"
                  minHeight="h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Story Content
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write your story here..."
                  className="w-full"
                  minHeight="h-80"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                >
                  {editingNovel ? 'Update Story' : 'Publish Story'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingNovel(null);
                    setFormData({
                      title: '',
                      description: '',
                      content: '',
                      genre: 'Fiction',
                      category: 'Inspirational',
                      readingTime: '',
                      coverImageUrl: ''
                    });
                  }}
                  className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Novels Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredNovels.map((novel) => (
            <div
              key={novel.id}
              className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 hover:bg-white/80 transition-all cursor-pointer group"
              onClick={() => setSelectedNovel(novel.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getGenreColor(novel.genre)}`}>
                    <span className="mr-1">{getGenreIcon(novel.genre)}</span>
                    {novel.genre}
                  </span>
                  {!novel.is_published && isPastorLoggedIn && (
                    <span className="px-2 py-1 rounded-full border text-xs font-medium bg-yellow-100 text-yellow-700 border-yellow-200">
                      Draft
                    </span>
                  )}
                </div>
                
                {isPastorLoggedIn && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublished(novel.id, !novel.is_published);
                      }}
                      className={`p-1 rounded transition-all ${
                        novel.is_published
                          ? 'text-green-600 hover:text-green-800'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {novel.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(novel);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNovel(novel.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 line-clamp-2 group-hover:text-slate-700 transition-colors">
                {novel.title}
              </h3>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4">
                {novel.description}
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{novel.reading_time} min read</span>
                </div>
                <span className="text-xs">{novel.category}</span>
              </div>

              <div className="mt-4 flex items-center text-slate-500 text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Read story</span>
              </div>
            </div>
          ))}
        </div>

        {filteredNovels.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No stories found</h3>
            <p className="text-slate-600">
              {isPastorLoggedIn 
                ? 'Create your first story to get started.' 
                : 'Check back soon for new stories from Pastor Stefan.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelsPage;