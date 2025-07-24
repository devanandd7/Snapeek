import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import { BookOpen, Calendar, Search, Filter, Eye, Download, Type, FileText, Palette, GitBranch, Workflow, Sparkles, X, Trash2 } from 'lucide-react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { PDFDownloadLink } from '@react-pdf/renderer';
import NotePDF from '../components/NotePDF';
import NoteCardSkeleton from '../components/NoteCardSkeleton';

// Dynamically import Mermaid to avoid SSR issues
const Mermaid = dynamic(() => import('react-mermaid2'), { ssr: false });

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);
  const [fontStyle, setFontStyle] = useState('kalam');
  const [paperStyle, setPaperStyle] = useState('plain');
  const mermaidRef = useRef(null);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [isClient, setIsClient] = useState(false);

  const handleNoteUpdate = (newContent) => {
    if (selectedNote) {
      const updatedNote = { ...selectedNote, noteContent: newContent };
      setSelectedNote(updatedNote);
      setUpdateStatus('Note successfully updated by AI!');
      // Also update the main notes list to reflect the change immediately
      setNotes(prevNotes => prevNotes.map(n => n._id === selectedNote._id ? updatedNote : n));
      setTimeout(() => setUpdateStatus(''), 3000);
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note permanently?')) {
      try {
        const res = await fetch('/api/notes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete note');
        }

        setNotes(notes.filter(n => n._id !== noteId));
        if (selectedNote && selectedNote._id === noteId) {
          setSelectedNote(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      } else {
        setError('Failed to fetch notes');
      }
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }

  // Get unique subjects for filtering
  const subjects = ['All', ...new Set(notes.map(note => note.subject).filter(Boolean))];

  // Font options
  const fontOptions = [
    { value: 'kalam', label: 'Kalam (Handwritten)', class: 'font-kalam' },
    { value: 'caveat', label: 'Caveat (Casual)', class: 'font-caveat' },
    { value: 'indie', label: 'Indie Flower (Playful)', class: 'font-indie' },
    { value: 'system', label: 'System (Clean)', class: 'font-system' }
  ];

  // Paper background options
  const paperOptions = [
    { value: 'plain', label: 'Plain Paper', class: 'bg-white dark:bg-gray-800' },
    { value: 'lined', label: 'Lined Paper', class: 'bg-lined-paper dark:bg-lined-paper-dark' },
    { value: 'grid', label: 'Grid Paper', class: 'bg-grid-paper dark:bg-grid-paper-dark' }
  ];

  // Filter notes based on search and subject
    const fontStyleClass = fontOptions.find(f => f.value === fontStyle)?.class || 'font-system';

  // Filter notes based on search and subject
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.noteContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.subject && note.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Render note content, parsing for embedded Mermaid diagrams
  function renderNoteContent(content) {
    if (!content) return null;

    // Split content by Mermaid blocks, keeping the blocks
    const parts = content.split(/(<MERMAID>[\s\S]*?<\/MERMAID>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('<MERMAID>')) {
        // This is a Mermaid block
        const diagramCode = part.replace('<MERMAID>', '').replace('</MERMAID>', '').trim();
        return (
          <div key={index} className="my-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto">
            <Mermaid chart={diagramCode} />
          </div>
        );
      } else if (part.trim() !== '') {
        // This is a regular text block, process it for markdown
        return part.split('\n').map((line, lineIndex) => {
          if (line.trim() === '') return null; // Ignore empty lines
          if (line.startsWith('**') && line.endsWith('**')) {
            return <h3 key={`${index}-${lineIndex}`} className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
          }
          if (line.startsWith('•') || line.startsWith('-')) {
            return <li key={`${index}-${lineIndex}`} className="ml-5 list-disc">{line.substring(2)}</li>;
          }
          return <p key={`${index}-${lineIndex}`} className="mb-2">{line}</p>;
        });
      }
      return null; // Don't render empty parts
    });
  }

  // Download note as text file
  function downloadNote(note) {
    const element = document.createElement('a');
    const file = new Blob([note.noteContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `study-notes-${new Date(note.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const NoteModal = ({ note, onClose, onUpdate, downloadNote, fontStyle, paperStyle, fontStyleClass, renderNoteContent }) => {
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    if (!note) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 truncate">{note.subject}</h2>
            <div className="flex items-center gap-2 self-end sm:self-center">
              {!isChatOpen && (
                <button onClick={() => setIsChatOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="AI Assistant">
                <Sparkles size={20} />
              </button>
              )}
              {isClient && (
                <PDFDownloadLink
                  document={<NotePDF note={note} />}
                  fileName={`${note.subject || 'note'}.pdf`}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? 'Loading...' : 'Download PDF'
                  }
                </PDFDownloadLink>
              )}
              <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500 hover:text-white">
                <X size={20} />
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDelete(note._id); 
                }}
                className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                title="Delete Note"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            <div 
              id={`pdf-image-container-${note._id}`}
              className="w-full md:w-2/5 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <img 
                src={note.imageUrl} 
                alt={`Image for note on ${note.subject}`} 
                className="max-h-48 md:max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div id={`pdf-text-container-${note._id}`} className={`p-6 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'w-full md:w-2/5' : 'w-full md:w-3/5'}`}>
              <div className={`${paperOptions.find(p => p.value === paperStyle)?.class} h-full`}>
                <div className={`prose ${paperStyle === 'lined' ? 'text-gray-900' : 'dark:prose-invert'} max-w-none ${fontOptions.find(f => f.value === fontStyle)?.class}`}>
                  <div className={`prose dark:prose-invert max-w-none ${fontStyleClass}`}>
                  <ReactMarkdown
                    children={note.noteContent}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 border-b pb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (className === 'language-mermaid') {
                          return <div className="flex justify-center my-4"><Mermaid chart={String(children)} /></div>;
                        }
                        return !inline && match ? (
                          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md my-4 overflow-x-auto">
                            <code className={`language-${match[1]}`} {...props}>
                              {String(children).replace(/\n$/, '')}
                            </code>
                          </div>
                        ) : (
                          <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  />
                </div>
                </div>
              </div>
            </div>
            {isChatOpen && (
              <div className="w-full md:w-2/5 p-4 border-l border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex flex-col">
                <ChatBox 
                  noteId={note._id} 
                  noteContent={note.noteContent} 
                  onNoteUpdate={onUpdate} 
                  onClose={() => setIsChatOpen(false)} 
                />
              </div>
            )}
          </div>
          {updateStatus && <div className="p-2 text-center text-sm bg-gray-200 dark:bg-gray-700">{updateStatus}</div>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-purple-700 dark:text-purple-300 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10" />
            Study Notes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            AI-generated study notes from your uploaded images
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Style and Feature Controls */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-gray-500" />
            <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} className="border rounded-lg px-2 py-1 dark:bg-gray-700 dark:border-gray-600">
              {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <select value={paperStyle} onChange={(e) => setPaperStyle(e.target.value)} className="border rounded-lg px-2 py-1 dark:bg-gray-700 dark:border-gray-600">
              {paperOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-gray-500" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showDiagrams} onChange={() => setShowDiagrams(!showDiagrams)} className="form-checkbox h-5 w-5"/>
              <span>Show Diagrams</span>
            </label>
          </div>
        </div>

        {/* Client-side Render Guard */}
      {isClient && (
        <>
          {/* Notes Grid */}
          {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <NoteCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No notes found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter, or create a new note!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                {/* Note Preview */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {note.subject || 'General'}
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Note Content Preview */}
                  <div className="handwritten-container mb-4 max-h-32 overflow-hidden">
                    {renderNoteContent(note.noteContent.slice(0, 200) + (note.noteContent.length > 200 ? '...' : ''))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedNote(note)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Full
                    </button>
                    <button
                      onClick={() => downloadNote(note)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Download as text file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDelete(note._id); 
                      }}
                      className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                      title="Delete Note"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Note Modal */}
        {selectedNote && (
          <NoteModal 
            note={selectedNote} 
            onClose={() => setSelectedNote(null)} 
            onUpdate={handleNoteUpdate}
            downloadNote={downloadNote}
            fontStyle={fontStyle}
            paperStyle={paperStyle}
            renderNoteContent={renderNoteContent}
            fontStyleClass={fontStyleClass}
          />
        )}
        </>
      )}
      </main>

      {/* Handwritten Font Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Caveat:wght@400;700&family=Indie+Flower&display=swap');
        
        .font-kalam { font-family: 'Kalam', cursive; }
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-indie { font-family: 'Indie Flower', cursive; }
        .font-system { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }

        .bg-lined-paper {
          background-image: repeating-linear-gradient(white 0px, white 23px, #dce1e6 24px);
          background-size: 100% 24px;
        }
        .dark .bg-lined-paper-dark {
          background-image: repeating-linear-gradient(#1f2937 0px, #1f2937 23px, #374151 24px);
        }

        .bg-grid-paper {
           background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
           background-size: 20px 20px;
        }
        .dark .bg-grid-paper-dark {
           background-image: linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
