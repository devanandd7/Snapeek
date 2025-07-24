import React from 'react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

// Dynamically import Mermaid to ensure it only runs on the client-side
const Mermaid = dynamic(() => import('react-mermaid2'), { ssr: false });

// This component is responsible for rendering the note content,
// including parsing and displaying Mermaid diagrams.
export default function NoteContentRenderer({ content, showDiagrams, fontStyleClass }) {
  if (!content) return null;

  const renderNoteContent = (text) => {
    const parts = text.split(/(<mermaid>.*?<\/mermaid>)/s);
    return parts.map((part, index) => {
      if (part.startsWith('<mermaid>')) {
        const chart = part.substring(9, part.length - 10).trim();
        if (showDiagrams) {
          return <div key={index} className="flex justify-center my-4"><Mermaid chart={chart} /></div>;
        }
        return null;
      }
      return <ReactMarkdown key={index}>{part}</ReactMarkdown>;
    });
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${fontStyleClass}`}>
      {renderNoteContent(content)}
    </div>
  );
}
