import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageCircle, Send, Sparkles, Paperclip, X } from 'lucide-react';

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
    <Card className="flex flex-col h-[600px] border border-indigo-100 bg-white shadow-xl shadow-indigo-100/20">
      <CardHeader className="bg-white border-b border-gray-50 p-4">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-600">
          <Sparkles size={18} className="animate-pulse" />
          <span>AI Tutor</span>
          {level && (
            <span className="ml-auto text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              Level {level}★
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium whitespace-pre-wrap ${
            m.role === 'user' ? 'bg-indigo-600 text-white ml-auto rounded-tr-none shadow-md shadow-indigo-200' : 'bg-slate-50 text-[#191C1E] mr-auto rounded-tl-none border border-slate-100'
          }`}>
            {m.file && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50/50 rounded-lg text-xs border border-indigo-100/50 text-indigo-700">
                <Paperclip size={12} className="text-indigo-400 shrink-0" /> 
                <span className="break-all font-semibold font-mono">{m.file}</span>
              </div>
            )}
            {m.role === 'model' ? renderContent(m.content) : m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-slate-50 text-indigo-400 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm w-fit flex items-center gap-2 border border-slate-100">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 bg-white border-t border-gray-50 flex-col gap-3">
        {selectedFile && (
          <div className="w-full flex items-center justify-between p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary animate-in fade-in slide-in-from-bottom-2">
            <span className="flex items-center gap-2 font-medium truncate pr-4">
              <Paperclip size={14} className="shrink-0" /> 
              <span className="truncate">{selectedFile.name}</span>
            </span>
            <button 
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }} 
              className="hover:text-red-500 transition-colors bg-white p-1 rounded-full shrink-0 shadow-sm"
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
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className={`px-3 border-slate-200 transition-colors shrink-0 shadow-sm ${selectedFile ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
            onClick={() => fileInputRef.current?.click()} 
            disabled={loading}
            title="Attach a file, image, or document"
          >
            <Paperclip size={18} />
          </Button>
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder={selectedFile ? "Ask a question about this file..." : "Ask me anything..."} 
            className="flex-1 bg-slate-50 border-slate-200 text-[#191C1E] focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
            disabled={loading}
          />
          <Button type="submit" variant="primary" size="icon" className="px-3 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" disabled={loading || (!input.trim() && !selectedFile)}>
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
