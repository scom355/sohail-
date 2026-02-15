
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/geminiService';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm Gemini. I can help you with questions, coding, or just chatting. I have access to Google Search for the most up-to-date information.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await geminiService.chatWithSearch(input, history);
      const modelMessage: Message = {
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        groundingUrls: response.urls
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error processing that request.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-[#222] text-gray-200 border border-white/5 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-[#333] hover:bg-blue-500/20 hover:text-blue-400 border border-white/5 px-2 py-1 rounded transition-colors"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#222] border border-white/5 p-4 rounded-2xl rounded-tl-none animate-pulse">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-[#0a0a0a]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything (e.g., 'What are the current top news headlines?')"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
