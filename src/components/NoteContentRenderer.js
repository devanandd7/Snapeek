import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

// Dynamically import Mermaid to ensure it only runs on the client-side
const Mermaid = dynamic(() => import('react-mermaid2'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded">Loading diagram...</div>
});

// This component is responsible for rendering the note content,
// including parsing and displaying Mermaid diagrams.
export default function NoteContentRenderer({ content, showDiagrams, fontStyleClass }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!content) return null;
  
  // Don't render anything on the server to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`prose dark:prose-invert max-w-none ${fontStyleClass}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const renderNoteContent = (text) => {
    const parts = text.split(/(<mermaid>.*?<\/mermaid>)/s);
    const elements = [];
    
    parts.forEach((part, index) => {
      if (part.startsWith('<mermaid>')) {
        const chart = part.substring(9, part.length - 10).trim();
        if (showDiagrams && chart.trim()) {
          elements.push(
            <div key={`mermaid-${index}`} className="flex justify-center my-4">
              <Mermaid chart={chart} />
            </div>
          );
        }
      } else if (part.trim()) {
        elements.push(
          <ReactMarkdown key={`markdown-${index}`}>{part}</ReactMarkdown>
        );
      }
    });
    
    return elements;
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${fontStyleClass}`}>
      {renderNoteContent(content)}
    </div>
  );
}
