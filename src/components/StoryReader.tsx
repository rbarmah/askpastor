import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, X, Menu } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
}

interface StoryReaderProps {
  story: {
    id: string;
    title: string;
    description: string;
    content: string;
    author: string;
    genre: string;
    category: string;
    reading_time: number;
    created_at: string;
  };
  onClose: () => void;
}

const StoryReader: React.FC<StoryReaderProps> = ({ story, onClose }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Parse the story content into chapters
    const parseChapters = (content: string): Chapter[] => {
      const chapterSections = content.split(/Chapter \d+:/i);
      const parsedChapters: Chapter[] = [];

      chapterSections.forEach((section, index) => {
        if (index === 0 && !section.trim().startsWith('Chapter')) {
          // This is content before the first chapter (introduction, etc.)
          if (section.trim()) {
            parsedChapters.push({
              id: 'intro',
              title: 'Introduction',
              content: section.trim()
            });
          }
          return;
        }

        const lines = section.trim().split('\n');
        if (lines.length === 0) return;

        // Extract chapter title from first line
        const titleMatch = lines[0].match(/^(.+?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1].trim() : `Chapter ${index}`;
        
        // Rest is content
        const chapterContent = lines.slice(1).join('\n').trim();
        
        if (chapterContent) {
          parsedChapters.push({
            id: `chapter-${index}`,
            title: title,
            content: chapterContent
          });
        }
      });

      // If no chapters were found, treat the entire content as one chapter
      if (parsedChapters.length === 0) {
        parsedChapters.push({
          id: 'main',
          title: story.title,
          content: content
        });
      }

      return parsedChapters;
    };

    const parsedChapters = parseChapters(story.content);
    setChapters(parsedChapters);
    setIsLoading(false);
  }, [story.content, story.title]);

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setShowMobileMenu(false);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setShowMobileMenu(false);
    }
  };

  const goToChapter = (index: number) => {
    setCurrentChapter(index);
    setShowMobileMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentChapterData = chapters[currentChapter];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-medium text-slate-900 truncate">{story.title}</h1>
              <p className="text-xs sm:text-sm text-slate-600">by {story.author}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            
            {/* Desktop Chapter Info */}
            <span className="hidden sm:block text-sm text-slate-600">
              {currentChapter + 1} of {chapters.length}
            </span>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={prevChapter}
                disabled={currentChapter === 0}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <button
                onClick={nextChapter}
                disabled={currentChapter === chapters.length - 1}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chapter Menu Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 px-4 py-3 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => goToChapter(index)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  currentChapter === index
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {index === 0 && chapter.id === 'intro' ? 'Introduction' : `Chapter ${index + 1}`}
                </div>
                <div className="text-xs opacity-80 line-clamp-1">
                  {chapter.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 bg-white/60 backdrop-blur-sm border-r border-slate-200/50">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200/50">
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Chapters</span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => goToChapter(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      currentChapter === index
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {index === 0 && chapter.id === 'intro' ? 'Introduction' : `Chapter ${index + 1}`}
                    </div>
                    <div className="text-xs opacity-80 line-clamp-2">
                      {chapter.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Story Info */}
            <div className="p-6 border-t border-slate-200/50">
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <span className="font-medium">Genre:</span> {story.genre}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {story.category}
                </div>
                <div>
                  <span className="font-medium">Reading Time:</span> {story.reading_time} min
                </div>
                <div>
                  <span className="font-medium">Published:</span> {formatDate(story.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
              {/* Chapter Image */}
              {currentChapterData?.imageUrl && (
                <div className="mb-8">
                  <img
                    src={currentChapterData.imageUrl}
                    alt={currentChapterData.imageCaption || currentChapterData.title}
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-2xl shadow-lg"
                  />
                  {currentChapterData.imageCaption && (
                    <p className="text-sm text-slate-600 text-center mt-3 italic">
                      {currentChapterData.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Chapter Title */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-4 leading-tight">
                  {currentChapterData?.title}
                </h2>
                {currentChapter === 0 && (
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {story.description}
                  </p>
                )}
              </div>

              {/* Chapter Content */}
              <div className="prose prose-slate prose-lg max-w-none">
                <div 
                  className="text-slate-700 leading-relaxed whitespace-pre-line text-base sm:text-lg"
                  style={{ lineHeight: '1.8' }}
                >
                  {currentChapterData?.content}
                </div>
              </div>

              {/* Extra spacing for mobile navigation */}
              <div className="h-24 sm:h-32 lg:h-16"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={prevChapter}
              disabled={currentChapter === 0}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Previous</span>
            </button>

            {/* Chapter Progress */}
            <div className="flex flex-col items-center space-y-2">
              <div className="text-xs sm:text-sm text-slate-600">
                Chapter {currentChapter + 1} of {chapters.length}
              </div>
              
              {/* Progress Dots */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {chapters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToChapter(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                      currentChapter === index
                        ? 'bg-slate-900'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextChapter}
              disabled={currentChapter === chapters.length - 1}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm sm:text-base">Next</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;