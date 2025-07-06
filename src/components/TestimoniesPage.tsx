import React, { useState } from 'react';
import { Heart, User, Calendar, Send, ArrowLeft, Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useTestimonies } from '../hooks/useTestimonies';
import RichTextEditor from './RichTextEditor';
import RichTextDisplay from './RichTextDisplay';

interface TestimoniesPageProps {
  isPastorLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

const TestimoniesPage: React.FC<TestimoniesPageProps> = ({ isPastorLoggedIn, onNavigate }) => {
  const { testimonies, loading, submitTestimony, approveTestimony, featureTestimony, deleteTestimony, refetch } = useTestimonies();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    age: '',
    isAnonymous: false
  });

  // Fetch all testimonies for pastor, only approved for public
  React.useEffect(() => {
    if (isPastorLoggedIn) {
      refetch(true); // Include unapproved testimonies for pastor
    } else {
      refetch(false); // Only approved testimonies for public
    }
  }, [isPastorLoggedIn]);

  const handleSubmitTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      try {
        await submitTestimony(
          formData.title,
          formData.content,
          formData.authorName,
          formData.age ? parseInt(formData.age) : undefined,
          formData.isAnonymous
        );
        setFormData({ title: '', content: '', authorName: '', age: '', isAnonymous: false });
        setShowSubmitForm(false);
        alert('Thank you for sharing your testimony! It will be reviewed and published soon.');
      } catch (error) {
        alert('Failed to submit testimony. Please try again.');
      }
    }
  };

  const handleApprove = async (testimonyId: string, approved: boolean) => {
    try {
      await approveTestimony(testimonyId, approved);
    } catch (error) {
      alert('Failed to update testimony status.');
    }
  };

  const handleFeature = async (testimonyId: string, featured: boolean) => {
    try {
      await featureTestimony(testimonyId, featured);
    } catch (error) {
      alert('Failed to update featured status.');
    }
  };

  const handleDelete = async (testimonyId: string) => {
    if (confirm('Are you sure you want to delete this testimony?')) {
      try {
        await deleteTestimony(testimonyId);
      } catch (error) {
        alert('Failed to delete testimony.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const approvedTestimonies = testimonies.filter(t => t.is_approved);
  const pendingTestimonies = testimonies.filter(t => !t.is_approved);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
      </div>
    );
  }

  const currentTestimony = selectedTestimony ? testimonies.find(t => t.id === selectedTestimony) : null;

  if (currentTestimony) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <button
            onClick={() => setSelectedTestimony(null)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Testimonies</span>
          </button>

          <article className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-slate-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{currentTestimony.author_name}</span>
                  {currentTestimony.age && (
                    <span className="text-sm">• Age {currentTestimony.age}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(currentTestimony.created_at)}</span>
                </div>
              </div>
              
              {currentTestimony.is_featured && (
                <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Featured</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-8 leading-tight">
              {currentTestimony.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
              <RichTextDisplay content={currentTestimony.content} className="text-base sm:text-lg" />
            </div>

            {isPastorLoggedIn && (
              <div className="mt-8 pt-6 border-t border-slate-200/50">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleApprove(currentTestimony.id, !currentTestimony.is_approved)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentTestimony.is_approved
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {currentTestimony.is_approved ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <span>{currentTestimony.is_approved ? 'Unapprove' : 'Approve'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleFeature(currentTestimony.id, !currentTestimony.is_featured)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentTestimony.is_featured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span>{currentTestimony.is_featured ? 'Unfeature' : 'Feature'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(currentTestimony.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-4 lg:mb-6">
            Lives touched through conversations with Pastor Stefan
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Real stories from people who found hope, healing, and transformation through Pastor Stefan's guidance and ministry.
          </p>
          
          <button
            onClick={() => setShowSubmitForm(true)}
            className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center space-x-3 mx-auto"
          >
            <Heart className="h-5 w-5" />
            <span>Share How Pastor Stefan Helped You</span>
          </button>
        </div>

        {/* Submit Testimony Form */}
        {showSubmitForm && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-4">Share Your Testimony</h3>
            <p className="text-slate-600 mb-6">
              Tell us how Pastor Stefan's guidance, answers, or ministry has impacted your life and faith journey.
            </p>
            
            <form onSubmit={handleSubmitTestimony} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  How did Pastor Stefan help you?
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Helped me overcome depression, Answered my questions about faith, Guided me through family crisis"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="Your first name or initials"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                    disabled={formData.isAnonymous}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Your age"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                    disabled={formData.isAnonymous}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isAnonymous: e.target.checked,
                      authorName: e.target.checked ? '' : formData.authorName,
                      age: e.target.checked ? '' : formData.age
                    })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                  />
                  <span className="tracking-wide text-sm sm:text-base">Share anonymously</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Your Story
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Share your story... What was your situation before? How did Pastor Stefan help you? What changed in your life? How has your faith grown?"
                  className="w-full"
                  minHeight="h-40"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center space-x-3"
                >
                  <Send className="h-5 w-5" />
                  <span>Submit Testimony</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="bg-slate-100 text-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pastor Management Section */}
        {isPastorLoggedIn && pendingTestimonies.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">Pending Approval ({pendingTestimonies.length})</h3>
            
            <div className="space-y-4">
              {pendingTestimonies.map((testimony) => (
                <div key={testimony.id} className="bg-yellow-50/60 border border-yellow-200/50 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-slate-900 mb-2">{testimony.title}</h4>
                      <p className="text-slate-600 text-sm mb-3">
                        By {testimony.author_name} {testimony.age && `• Age ${testimony.age}`}
                      </p>
                      <p className="text-slate-700 text-sm line-clamp-3">{testimony.content}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <button
                        onClick={() => setSelectedTestimony(testimony.id)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-sm"
                      >
                        Read Full
                      </button>
                      <button
                        onClick={() => handleApprove(testimony.id, true)}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDelete(testimony.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {approvedTestimonies.map((testimony) => (
            <div
              key={testimony.id}
              className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 hover:bg-white/80 transition-all cursor-pointer group relative"
              onClick={() => setSelectedTestimony(testimony.id)}
            >
              {testimony.is_featured && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span className="text-xs font-medium">Featured</span>
                </div>
              )}

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{testimony.author_name}</div>
                  <div className="text-sm text-slate-500">
                    {testimony.age && `Age ${testimony.age} • `}
                    {formatDate(testimony.created_at)}
                  </div>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 line-clamp-2 group-hover:text-slate-700 transition-colors">
                {testimony.title}
              </h3>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-4 mb-4">
                {testimony.content}
              </p>

              <div className="flex items-center text-slate-500 text-sm">
                <Heart className="h-4 w-4 mr-2" />
                <span>Read full story</span>
              </div>

              {isPastorLoggedIn && (
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeature(testimony.id, !testimony.is_featured);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      testimony.is_featured
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {testimony.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(testimony.id);
                    }}
                    className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {approvedTestimonies.length === 0 && !isPastorLoggedIn && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No testimonies yet</h3>
            <p className="text-slate-600 mb-6">
              Be the first to share how Pastor Stefan has impacted your life.
            </p>
            <button
              onClick={() => setShowSubmitForm(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
            >
              Share Your Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimoniesPage;