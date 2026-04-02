import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const linkifyHtml = (htmlContent: string) => {
  if (!htmlContent) return '';
  if (typeof window === 'undefined') return htmlContent;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
  const nodesToReplace: { node: Node, newNodes: Node[] }[] = [];
  
  const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && node.parentElement.tagName === 'A') continue;
    
    if (node.nodeValue && urlPattern.test(node.nodeValue)) {
      const parts = node.nodeValue.split(urlPattern);
      const newNodes = parts.map(part => {
        if (/^https?:\/\//.test(part)) {
          const a = document.createElement('a');
          a.href = part;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'text-teal-600 hover:text-teal-800 underline';
          a.textContent = part;
          return a;
        }
        return document.createTextNode(part);
      });
      nodesToReplace.push({ node, newNodes });
    }
  }
  
  nodesToReplace.forEach(({ node, newNodes }) => {
    const parent = node.parentNode;
    if (parent) {
      newNodes.forEach(n => parent.insertBefore(n, node));
      parent.removeChild(node);
    }
  });
  
  return doc.body.innerHTML;
};

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, className = "" }) => {
  const processedContent = React.useMemo(() => linkifyHtml(content), [content]);

  return (
    <div 
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
      style={{
        wordBreak: 'break-word'
      }}
    />
  );
};

export default RichTextDisplay;