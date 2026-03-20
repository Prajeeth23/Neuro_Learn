import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

export const AiTutor = ({ context, level = 3, topic = '' }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      content: `Hello! I'm your NeuroLearn AI Tutor. I see you're learning about **${context || 'this course'}**. How can I help?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/tutor', { 
        message: userMessage, 
        history: messages.map(m => ({ role: m.role, content: m.content })),
        level: level || 3,
        topic: topic || context || ''
      });
      setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting right now. Please try again." }]);
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
    <Card className="flex flex-col h-[600px] border border-accent/30 shadow-[0_0_20px_rgba(0,180,255,0.1)]">
      <CardHeader className="bg-white/5 border-b border-white/10 p-4">
        <CardTitle className="flex items-center gap-2 text-lg text-accent">
          <Sparkles size={18} className="animate-pulse" />
          <span>AI Tutor</span>
          {level && (
            <span className="ml-auto text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
              Level {level}★
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-xl p-3 text-sm whitespace-pre-wrap ${
            m.role === 'user' ? 'bg-primary text-white ml-auto rounded-tr-none' : 'bg-white/10 text-white/90 mr-auto rounded-tl-none'
          }`}>
            {m.role === 'model' ? renderContent(m.content) : m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-white/10 text-white/50 rounded-xl rounded-tl-none p-3 max-w-[85%] text-sm w-fit flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex gap-2 w-full">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask me anything..." 
            className="flex-1 bg-black/50"
          />
          <Button type="submit" variant="primary" size="icon" className="px-3" disabled={loading}>
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
