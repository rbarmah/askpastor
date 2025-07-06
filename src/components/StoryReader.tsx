import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, X, Image as ImageIcon } from 'lucide-react';

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
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const goToChapter = (index: number) => {
    setCurrentChapter(index);
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-medium text-slate-900">{story.title}</h1>
              <p className="text-sm text-slate-600">by {story.author}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              {currentChapter + 1} of {chapters.length}
            </span>
            <div className="flex items-center space-x-2">
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

      {/* Main Content */}
      <div className="flex h-full">
        {/* Chapter Navigation Sidebar */}
        <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-slate-200/50 p-6 overflow-y-auto hidden lg:block">
          <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Chapters</span>
          </h3>
          
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

          {/* Story Info */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
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

        {/* Chapter Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
            {/* Chapter Image */}
            {currentChapterData?.imageUrl && (
              <div className="mb-8">
                <img
                  src={currentChapterData.imageUrl}
                  alt={currentChapterData.imageCaption || currentChapterData.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
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
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-4">
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
                className="text-slate-700 leading-relaxed whitespace-pre-line"
                style={{ lineHeight: '1.8' }}
              >
                {currentChapterData?.content}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevChapter}
                  disabled={currentChapter === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {chapters.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToChapter(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentChapter === index
                          ? 'bg-slate-900'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextChapter}
                  disabled={currentChapter === chapters.length - 1}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chapter Navigation */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevChapter}
              disabled={currentChapter === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Prev</span>
            </button>

            <div className="text-center">
              <div className="text-sm font-medium text-slate-900">
                Chapter {currentChapter + 1} of {chapters.length}
              </div>
              <div className="text-xs text-slate-600 line-clamp-1">
                {currentChapterData?.title}
              </div>
            </div>

            <button
              onClick={nextChapter}
              disabled={currentChapter === chapters.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;