import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Send, Clock, User, Reply, ChevronLeft, ChevronRight, Edit, Trash2, Users, Filter, Tag } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import { QUESTION_CATEGORIES, QUESTION_SUBCATEGORIES, QuestionCategory } from '../lib/supabase';

interface QuestionsPageProps {
  isPastorLoggedIn: boolean;
}

const QuestionsPage: React.FC<QuestionsPageProps> = ({ isPastorLoggedIn }) => {
  const { questions, loading, submitQuestion, answerQuestion, updateAnswer, deleteAnswer, toggleLike, toggleRelate, getCategoryCounts, refetch } = useQuestions();
  const [newQuestion, setNewQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('Help for my personal issue');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | 'all'>('all');
  const [answerText, setAnswerText] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userIdentifier] = useState(() => 
    localStorage.getItem('userIdentifier') || 
    (() => {
      const id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userIdentifier', id);
      return id;
    })()
  );

  const questionsPerPage = 10;
  
  // Filter questions based on selected category
  const filteredQuestions = filterCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === filterCategory);
  
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  const categoryCounts = getCategoryCounts();

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      try {
        await submitQuestion(
          newQuestion, 
          authorName, 
          isAnonymous, 
          selectedCategory,
          selectedSubcategory || undefined
        );
        setNewQuestion('');
        setAuthorName('');
        setSelectedSubcategory('');
        // Reset to first page to see the new question
        setCurrentPage(1);
      } catch (error) {
        alert('Failed to submit question. Please try again.');
      }
    }
  };

  const handleLike = async (questionId: string) => {
    try {
      await toggleLike(questionId, userIdentifier);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleRelate = async (questionId: string) => {
    try {
      await toggleRelate(questionId, userIdentifier);
    } catch (error) {
      console.error('Failed to toggle relate:', error);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (answerText.trim()) {
      try {
        await answerQuestion(questionId, answerText);
        setAnswerText('');
        setAnsweringId(null);
      } catch (error) {
        alert('Failed to submit answer. Please try again.');
      }
    }
  };

  const handleUpdateAnswer = async (questionId: string) => {
    if (answerText.trim()) {
      try {
        await updateAnswer(questionId, answerText);
        setAnswerText('');
        setEditingAnswerId(null);
      } catch (error) {
        alert('Failed to update answer. Please try again.');
      }
    }
  };

  const handleDeleteAnswer = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this answer?')) {
      try {
        await deleteAnswer(questionId);
      } catch (error) {
        alert('Failed to delete answer. Please try again.');
      }
    }
  };

  const startEditingAnswer = (question: any) => {
    setAnswerText(question.answer || '');
    setEditingAnswerId(question.id);
    setAnsweringId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (category: QuestionCategory | 'all') => {
    setFilterCategory(category);
    setCurrentPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Help for my personal issue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'What does the Bible Say?':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Deepening my walk with God':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'I am not a Christian but have questions about Christianity':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Help for my personal issue':
        return '💭';
      case 'What does the Bible Say?':
        return '📖';
      case 'Deepening my walk with God':
        return '🙏';
      case 'I am not a Christian but have questions about Christianity':
        return '❓';
      default:
        return '💬';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-900 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-4 lg:mb-6">Drop Your Questions</h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            No topic is off-limits. Ask what's really on your heart.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-900">Browse by Category</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`p-4 rounded-2xl border transition-all text-left ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-2">🌟</div>
              <div className="font-medium text-sm mb-1">All Questions</div>
              <div className="text-xs opacity-75">{questions.length} total</div>
            </button>
            
            {QUESTION_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  filterCategory === category
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
                <div className="font-medium text-sm mb-1 line-clamp-2">{category}</div>
                <div className="text-xs opacity-75">{categoryCounts[category]} questions</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Question Form */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-6">Ask Your Question</h3>
          
          <form onSubmit={handleSubmitQuestion} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as QuestionCategory);
                    setSelectedSubcategory('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                >
                  {QUESTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                  Specific Topic (Optional)
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                >
                  <option value="">Choose a specific topic...</option>
                  {QUESTION_SUBCATEGORIES[selectedCategory].map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                What's on your mind?
              </label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Share your question, struggle, or what you're thinking about..."
                className="w-full h-24 sm:h-32 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <label className="flex items-center space-x-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                />
                <span className="tracking-wide text-sm sm:text-base">Post anonymously</span>
              </label>
              
              {!isAnonymous && (
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                />
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300"
            >
              <span className="flex items-center justify-center space-x-3">
                <Send className="h-5 w-5" />
                <span>Submit Question</span>
              </span>
            </button>
          </form>
        </div>

        {/* Questions Stats */}
        {filteredQuestions.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="text-slate-600 text-sm sm:text-base">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredQuestions.length)} of {filteredQuestions.length} questions
                {filterCategory !== 'all' && (
                  <span className="ml-2">
                    in <span className="font-medium">{filterCategory}</span>
                  </span>
                )}
              </div>
              <div className="text-slate-600 text-sm sm:text-base">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          {currentQuestions.map((question) => (
            <div key={question.id} className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
              {/* Question */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 tracking-wide">{question.author_name}</div>
                      <div className="text-sm text-slate-500 flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(question.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 self-start sm:self-auto">
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getCategoryColor(question.category)}`}>
                      <span className="mr-1">{getCategoryIcon(question.category)}</span>
                      {question.category}
                    </div>
                    
                    <button
                      onClick={() => handleLike(question.id)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all bg-slate-100/60 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{question.likes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleRelate(question.id)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all bg-slate-100/60 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{question.relates || 0}</span>
                    </button>
                  </div>
                </div>
                
                {question.subcategory && (
                  <div className="mb-3">
                    <span className="inline-flex items-center space-x-1 text-xs text-slate-500 bg-slate-100/60 px-2 py-1 rounded-full">
                      <Tag className="h-3 w-3" />
                      <span>{question.subcategory}</span>
                    </span>
                  </div>
                )}
                
                <p className="text-slate-700 leading-relaxed text-base sm:text-lg">{question.text}</p>
                
                {/* "This was my issue too" indicator */}
                {(question.relates || 0) > 0 && (
                  <div className="mt-4 text-sm text-slate-500">
                    {question.relates} {question.relates === 1 ? 'person relates' : 'people relate'} to this question
                  </div>
                )}
              </div>

              {/* Answer */}
              {question.answered && question.answer && (
                <div className="bg-gradient-to-br from-teal-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-teal-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Reply className="h-4 w-4 text-slate-700" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 tracking-wide">Pastor Stefan</div>
                        <div className="text-sm text-slate-600">
                          {question.answer_timestamp && formatTimestamp(question.answer_timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    {isPastorLoggedIn && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditingAnswer(question)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnswer(question.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingAnswerId === question.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateAnswer(question.id)}
                          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all text-sm"
                        >
                          Update Answer
                        </button>
                        <button
                          onClick={() => setEditingAnswerId(null)}
                          className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{question.answer}</p>
                  )}
                </div>
              )}

              {/* Pastor Answer Form */}
              {isPastorLoggedIn && !question.answered && (
                <div className="mt-6">
                  {answeringId === question.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write your answer..."
                        className="w-full h-20 sm:h-24 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleSubmitAnswer(question.id)}
                          className="bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                        >
                          Submit Answer
                        </button>
                        <button
                          onClick={() => setAnsweringId(null)}
                          className="bg-slate-100 text-slate-700 px-4 sm:px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAnsweringId(question.id)}
                      className="bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                    >
                      Answer This Question
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Questions Message */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{filterCategory !== 'all' ? getCategoryIcon(filterCategory) : '💭'}</div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              {filterCategory === 'all' ? 'No questions yet' : `No questions in "${filterCategory}"`}
            </h3>
            <p className="text-slate-600 mb-6">
              {filterCategory === 'all' 
                ? 'Be the first to ask a question!' 
                : 'Be the first to ask a question in this category!'
              }
            </p>
            {filterCategory !== 'all' && (
              <button
                onClick={() => handleCategoryFilter('all')}
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all mr-3"
              >
                View All Questions
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2 overflow-x-auto">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all flex-shrink-0 ${
                      currentPage === page
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;