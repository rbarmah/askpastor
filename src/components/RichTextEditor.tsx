import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
  className = "",
  minHeight = "h-24"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          toggleBold();
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          toggleItalic();
        }
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
      return () => editor.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement
        : range.commonAncestorContainer as Element;

      if (parentElement && editorRef.current?.contains(parentElement)) {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
      }
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const toggleBold = () => {
    document.execCommand('bold', false);
    setIsBold(!isBold);
    editorRef.current?.focus();
    handleInput();
  };

  const toggleItalic = () => {
    document.execCommand('italic', false);
    setIsItalic(!isItalic);
    editorRef.current?.focus();
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  return (
    <div className={`border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-3 border-b border-slate-200/50">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded-lg transition-all ${
            isBold 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded-lg transition-all ${
            isItalic 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <div className="text-xs text-slate-500 flex items-center space-x-1">
          <Type className="h-3 w-3" />
          <span>Ctrl+B for bold, Ctrl+I for italic</span>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className={`px-4 py-3 focus:outline-none text-sm sm:text-base text-slate-700 leading-relaxed ${minHeight} overflow-y-auto`}
        style={{ minHeight: minHeight === 'h-24' ? '96px' : minHeight === 'h-32' ? '128px' : '200px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] strong {
          font-weight: 600;
        }
        [contenteditable] em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;