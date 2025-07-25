import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

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
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="text-red-600 font-medium mb-2">
          ⚠️ Mermaid Diagram Error
        </div>
        <div className="text-sm text-gray-600 mb-3">
          Copy the code below and try it in an online Mermaid editor:
        </div>
        <div className="bg-gray-100 p-3 rounded border font-mono text-sm overflow-x-auto">
          <pre>{chart}</pre>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          💡 Try: <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="underline">mermaid.live</a>
        </div>
      </div>
    );
  }
  
  return <div ref={containerRef} className="mermaid-container" />;
};

const NoteContentRenderer = ({ content, showDiagrams = true, backgroundType = 'plain' }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  const renderNoteContent = () => {
    if (!content) return null;

    // Split content by Mermaid diagram blocks (both custom tags and markdown code blocks)
    const mermaidRegex = /(<mermaid>[\s\S]*?<\/mermaid>|```mermaid[\s\S]*?```)/g;
    const parts = content.split(mermaidRegex).filter(part => part.trim() !== '');

    return parts.map((part, index) => {
      // Handle custom <mermaid> tags
      if (part.startsWith('<mermaid>')) {
        const chart = part.substring(9, part.length - 10).trim();
        if (showDiagrams) {
          return (
            <div key={index} className="flex justify-center my-8">
              <MermaidDiagram chart={chart} id={`custom-${index}`} />
            </div>
          );
        }
        return null;
      }
      
      // Handle markdown code blocks with mermaid
      if (part.startsWith('```mermaid')) {
        const chart = part.substring(10, part.length - 3).trim();
        if (showDiagrams) {
          return (
            <div key={index} className="flex justify-center my-8">
              <MermaidDiagram chart={chart} id={`code-${index}`} />
            </div>
          );
        }
        return null;
      }

      // Render regular markdown content with HTML support for color spans
      return (
        <div key={index} className="note-content-section prose prose-lg max-w-none">
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({children}) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-300">
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">
                  {children}
                </h3>
              ),
              p: ({children}) => (
                <p className="text-gray-700 leading-relaxed mb-4 text-base">
                  {children}
                </p>
              ),
              ul: ({children}) => (
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({children}) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({children}) => (
                <li className="text-gray-700 leading-relaxed">
                  {children}
                </li>
              ),
              strong: ({children}) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              hr: () => (
                <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              ),
              blockquote: ({children}) => (
                <blockquote className="border-l-4 border-blue-200 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">
                  {children}
                </blockquote>
              ),
              code: ({children, className}) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4">
                    <code className="text-gray-800 text-sm font-mono">
                      {children}
                    </code>
                  </pre>
                );
              }
            }}
          >
            {part}
          </ReactMarkdown>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className={`note-content-wrapper bg-white min-h-full ${
      backgroundType === 'lined' ? 'lined-paper' : ''
    }`}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          {renderNoteContent()}
        </div>
      </div>
      
      <style jsx>{`
        .note-content-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        
        .lined-paper {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, transparent 23px, #e5e7eb 24px);
          background-size: 24px 24px;
          background-position: 0 0;
        }
        
        .lined-paper .bg-white {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(1px);
        }
        
        /* Color coding styles for HTML spans */
        :global(.note-content-wrapper span[style*="color: #dc2626"]),
        :global(.note-content-wrapper span[style*="color: rgb(220, 38, 38)"]) {
          color: #dc2626 !important;
          font-weight: 600;
          background-color: rgba(220, 38, 38, 0.05);
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        :global(.note-content-wrapper span[style*="color: #059669"]),
        :global(.note-content-wrapper span[style*="color: rgb(5, 150, 105)"]) {
          color: #059669 !important;
          font-weight: 600;
          background-color: rgba(5, 150, 105, 0.05);
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        :global(.note-content-wrapper span[style*="color: #d97706"]),
        :global(.note-content-wrapper span[style*="color: rgb(217, 119, 6)"]) {
          color: #d97706 !important;
          font-weight: 600;
          background-color: rgba(217, 119, 6, 0.05);
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        /* Formula styling */
        :global(.note-content-wrapper) :global(strong:contains("FORMULA:")) {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          display: inline-block;
          margin: 4px 0;
          font-family: 'Courier New', monospace;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default NoteContentRenderer;
