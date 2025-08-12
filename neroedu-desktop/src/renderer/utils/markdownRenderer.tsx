import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // Find all bold text patterns (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText) {
          parts.push(<span key={key++}>{beforeText}</span>);
        }
      }

      // Add the bold text
      parts.push(<strong key={key++}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        parts.push(<span key={key++}>{remainingText}</span>);
      }
    }

    return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
  };

  // Split by line breaks and render each line
  const renderContent = () => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="markdown-line">
        {parseMarkdown(line)}
      </div>
    ));
  };

  return (
    <div className={`markdown-content ${className}`}>
      {renderContent()}
    </div>
  );
};

// Simple function version for inline use
export const renderMarkdown = (content: string): React.ReactNode => {
  return <MarkdownRenderer content={content} />;
};
