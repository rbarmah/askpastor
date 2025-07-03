import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Send, Clock, User, Reply, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';

interface QuestionsPageProps {
  isPastorLoggedIn: boolean;
}

const QuestionsPage: React.FC<QuestionsPageProps> = ({ isPastorLoggedIn }) => {
  const { questions, loading, submitQuestion, answerQuestion, toggleLike } = useQuestions();
  const [newQuestion, setNewQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
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
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      try {
        await submitQuestion(newQuestion, authorName, isAnonymous);
        setNewQuestion('');
        setAuthorName('');
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
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
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-slate-900 mb-6">Drop Your Questions</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            No topic is off-limits. Ask what's really on your heart.
          </p>
        </div>

        {/* Submit Question Form */}
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 mb-12">
          <form onSubmit={handleSubmitQuestion} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 tracking-wide">
                What's on your mind?
              </label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Share your question, struggle, or what you're thinking about..."
                className="w-full h-32 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                />
                <span className="tracking-wide">Post anonymously</span>
              </label>
              
              {!isAnonymous && (
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-medium tracking-wide hover:bg-slate-800 transition-all duration-300"
            >
              <span className="flex items-center justify-center space-x-3">
                <Send className="h-5 w-5" />
                <span>Submit Question</span>
              </span>
            </button>
          </form>
        </div>

        {/* Questions Stats */}
        {questions.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="text-slate-600">
                Showing {startIndex + 1}-{Math.min(endIndex, questions.length)} of {questions.length} questions
              </div>
              <div className="text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8 mb-12">
          {currentQuestions.map((question) => (
            <div key={question.id} className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
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
                  
                  <button
                    onClick={() => handleLike(question.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all bg-slate-100/60 text-slate-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{question.likes}</span>
                  </button>
                </div>
                
                <p className="text-slate-700 leading-relaxed text-lg">{question.text}</p>
              </div>

              {/* Answer */}
              {question.answered && question.answer && (
                <div className="bg-gradient-to-br from-teal-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl p-6 border border-teal-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <Reply className="h-4 w-4 text-slate-700" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 tracking-wide">Pastor Stefan</div>
                      <div className="text-sm text-slate-600">
                        {question.answer_timestamp && formatTimestamp(question.answer_timestamp)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{question.answer}</p>
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
                        className="w-full h-24 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSubmitAnswer(question.id)}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                        >
                          Submit Answer
                        </button>
                        <button
                          onClick={() => setAnsweringId(null)}
                          className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAnsweringId(question.id)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                    >
                      Answer This Question
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
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
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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