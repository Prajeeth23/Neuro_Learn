import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageCircle, Send, Sparkles, Paperclip, X, Loader2 } from 'lucide-react';

export const AiTutor = ({ context, level = 3, topic = '' }) => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Hello! I'm your NeuroLearn AI Tutor. I see you're learning about **${context || 'this course'}**. How can I help?`
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage, file: selectedFile ? selectedFile.name : null }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('message', userMessage);
        formData.append('history', JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))));
        formData.append('level', level || 3);
        formData.append('topic', topic || context || '');
        formData.append('file', selectedFile);

        const { data } = await api.post('/upload/tutor', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessages([...newMessages, { role: 'model', content: data.reply }]);
        setSelectedFile(null); // Clear file after send
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
      } else {
        const { data } = await api.post('/ai/tutor', {
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          level: level || 3,
          topic: topic || context || ''
        });
        setMessages([...newMessages, { role: 'model', content: data.reply }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'model', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown-like rendering for bold text
  const renderContent = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-accent font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border-2 border-indigo-100 shadow-2xl shadow-indigo-100/50 overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E7FF', height: '100%' }}>
      <div className="bg-indigo-50/50 border-b border-indigo-100 p-5 flex flex-col items-center justify-center" style={{ backgroundColor: '#F5F7FF', borderBottomColor: '#E0E7FF' }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-indigo-600 animate-pulse" />
          <span className="text-xl font-black italic tracking-tight text-indigo-800" style={{ color: '#3730A3' }}>AI</span>
        </div>
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Cognitive Assistant</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-white" style={{ backgroundColor: '#FFFFFF' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                }`}
              style={m.role === 'user'
                ? { backgroundColor: '#4338CA', color: '#FFFFFF', fontWeight: 600 }
                : { backgroundColor: '#FFFFFF', color: '#191C1E', borderColor: '#E0E7FF', borderStyle: 'solid', borderWidth: '2px', fontWeight: 600 }
              }
            >
              {m.file && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50/50 rounded-lg text-[10px] border border-indigo-100/50 text-indigo-700">
                  <Paperclip size={10} className="text-indigo-400 shrink-0" />
                  <span className="break-all font-semibold font-mono">{m.file}</span>
                </div>
              )}
              <div className="text-sm leading-relaxed" style={{ color: m.role === 'user' ? '#FFFFFF' : '#000000' }}>
                {m.role === 'model' ? renderContent(m.content) : m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-indigo-100 p-4 rounded-2xl rounded-tl-none flex items-center justify-center gap-3 shadow-sm" style={{ borderColor: '#E0E7FF', borderStyle: 'solid', borderWidth: '2px' }}>
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs font-black text-indigo-900 animate-pulse uppercase tracking-widest">Reasoning...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-indigo-50/30 border-t border-indigo-100 flex flex-col gap-3" style={{ backgroundColor: '#F9FAFF', borderTopColor: '#E0E7FF' }}>
        {selectedFile && (
          <div className="w-full flex items-center justify-between p-2.5 bg-white border border-indigo-200 rounded-xl text-xs text-indigo-600 shadow-sm">
            <span className="flex items-center gap-2 font-bold truncate pr-4">
              <Paperclip size={14} className="shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="hover:text-red-500 transition-colors p-1 bg-gray-50 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-2 w-full items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
          />
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center shrink-0 bg-white border-2 border-indigo-100 text-indigo-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E7FF' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Paperclip size={18} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={selectedFile ? "Ask a question about this file..." : "Ask me anything..."}
            className="flex-1 bg-white border-2 border-indigo-100 text-black font-semibold h-12 px-4 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none placeholder:text-slate-400"
            style={{ backgroundColor: '#FFFFFF', color: '#000000', borderColor: '#E0E7FF', borderWidth: '2px', borderStyle: 'solid' }}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-12 h-12 flex items-center justify-center shrink-0 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#4338CA', color: '#FFFFFF' }}
            disabled={loading || (!input.trim() && !selectedFile)}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
