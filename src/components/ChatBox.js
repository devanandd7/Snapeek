import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wand2, X, Sparkles } from 'lucide-react';

export default function ChatBox({ noteId, noteContent, onNoteUpdate, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/notes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteContent, userMessage: input }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage = { role: 'ai', content: data.reply };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: 'ai', content: 'Sorry, I had trouble getting a response. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'ai', content: 'Sorry, an error occurred. Please check your connection and try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWithAI = async () => {
    if (messages.length === 0) return; // Don't update if there's no chat
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, noteContent, chatHistory: messages, action: 'update_ai' }),
      });

      if (res.ok) {
        const data = await res.json();
        // Ensure we are passing only the string content back, not the whole object
        onNoteUpdate(data.note.noteContent); 
        const systemMessage = { role: 'ai', content: 'I have updated the notes for you based on our conversation.' };
        setMessages(prev => [...prev, systemMessage]);
      } else {
        const errorMessage = { role: 'ai', content: 'Sorry, I had trouble updating the notes. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'ai', content: 'An error occurred while updating the notes. Please check your connection.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          AI Study Assistant
        </h3>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center"><Bot className="w-5 h-5 text-purple-600 dark:text-purple-300" /></div>}
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center"><User className="w-5 h-5 text-blue-600 dark:text-blue-300" /></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center"><Bot className="w-5 h-5 text-purple-600 dark:text-purple-300" /></div>
              <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button 
          onClick={handleUpdateWithAI}
          disabled={isUpdating || isLoading || messages.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
        >
          <Wand2 className="w-5 h-5" />
          {isUpdating ? 'Updating Notes...' : 'Update Notes with AI'}
        </button>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your notes..."
            className="flex-grow bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed" disabled={isLoading}>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
