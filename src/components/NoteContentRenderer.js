import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

// Custom Mermaid component using native mermaid library
const MermaidDiagram = ({ chart, id }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !containerRef.current) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Add a small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Dynamically import mermaid to ensure client-side only
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid with safe settings
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: { curve: 'linear' },
          logLevel: 'error'
        });
        
        // Clean the chart content
        const cleanChart = chart.trim();
        console.log('Rendering Mermaid chart:', cleanChart);
        
        // Validate syntax before rendering
        const isValid = await mermaid.parse(cleanChart);
        if (!isValid) {
          throw new Error('Invalid Mermaid syntax');
        }
        
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.removeAttribute('data-processed');
          
          // Render the diagram
          const { svg } = await mermaid.render(`mermaid-${id}-${Date.now()}`, cleanChart);
          containerRef.current.innerHTML = svg;
        }
        
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    renderDiagram();
  }, [chart, id]);
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded flex items-center justify-center">Loading diagram...</div>;
  }
  
  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <div className="text-red-600 dark:text-red-400 font-medium mb-2">
          ⚠️ Mermaid Diagram Error
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Copy the code below and try it in an online Mermaid editor:
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded border font-mono text-sm overflow-x-auto">
          <pre>{chart}</pre>
        </div>
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          💡 Try: <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="underline">mermaid.live</a>
        </div>
        <div className="mt-1 text-xs text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }
  
  return <div ref={containerRef} className="mermaid-container" />;
};

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
    // First, handle custom <mermaid> tags
    const customTagParts = text.split(/(<mermaid>.*?<\/mermaid>)/s);
    const elements = [];
    
    customTagParts.forEach((part, index) => {
      if (part.startsWith('<mermaid>')) {
        const chart = part.substring(9, part.length - 10).trim();
        if (showDiagrams && chart.trim()) {
          elements.push(
            <div key={`mermaid-custom-${index}`} className="flex justify-center my-4">
              <MermaidDiagram chart={chart} id={`custom-${index}`} />
            </div>
          );
        }
      } else if (part.trim()) {
        // Handle markdown with code blocks, including mermaid
        elements.push(
          <ReactMarkdown 
            key={`markdown-${index}`}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');
                
                // Handle mermaid code blocks
                if (match && match[1] === 'mermaid' && showDiagrams) {
                  return (
                    <div className="flex justify-center my-4">
                      <MermaidDiagram chart={codeContent} id={`code-${index}`} />
                    </div>
                  );
                }
                
                // Handle regular code blocks
                return !inline && match ? (
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md my-4 overflow-x-auto">
                    <code className={`language-${match[1]}`} {...props}>
                      {codeContent}
                    </code>
                  </div>
                ) : (
                  <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-sm" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {part}
          </ReactMarkdown>
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
