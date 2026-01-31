import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { startAvocadoChat } from '../services/geminiService';
import { Mascot } from '../components/Mascot';
import { persistenceService } from '../services/persistenceService';

export const ChatScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hey friend! 🥑 I'm Avocado, your personal cheer-squad! How's your day going? Ready to crush some goals together? ✨", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = startAvocadoChat([]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const userChatMessage: ChatMessage = { role: 'user', text: userMsg, timestamp: new Date() };
    const newMessages: ChatMessage[] = [...messages, userChatMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Persist user message to charts collection
    await persistenceService.saveChatMessage(userChatMessage);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg });
      const modelChatMessage: ChatMessage = { 
        role: 'model', 
        text: response.text || "Oops, I got lost in the pit! Try again? 🥑", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, modelChatMessage]);
      
      // Persist model response to charts collection
      await persistenceService.saveChatMessage(modelChatMessage);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I'm having a tiny avocado-malfunction! Can we try that again? 🌈", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen animate-in fade-in duration-500">
      <header className="p-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-50 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="bg-[#DFF2C2] p-2 rounded-xl">
            <Mascot size={40} />
          </div>
          <div>
            <h2 className="text-xl font-brand font-bold text-[#2F3E2E]">Chat with Avocado</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Always Here! ✨</span>
            </div>
          </div>
        </div>
        <div className="bg-[#FFE66D]/20 p-2 rounded-xl">
           <Sparkles className="text-[#A0C55F]" size={20} />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAF5]/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] lg:max-w-[70%] p-5 rounded-[32px] shadow-sm ${
              msg.role === 'user' 
              ? 'bg-[#A0C55F] text-white rounded-tr-lg' 
              : 'bg-white text-[#2F3E2E] rounded-tl-lg border border-gray-50'
            }`}>
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-2 font-bold opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white p-5 rounded-[32px] rounded-tl-lg border border-gray-50 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-bold text-gray-400">Avocado is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
        <div className="relative max-w-4xl mx-auto flex items-center gap-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me something fun! 🥑..."
            className="flex-1 bg-[#F8FAF5] border-none focus:ring-2 focus:ring-[#A0C55F]/30 rounded-[24px] px-6 py-4 text-lg font-medium shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-2xl shadow-lg transition-all active:scale-95 ${
              !input.trim() || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-[#FFE66D] text-[#2F3E2E] hover:bg-[#ffed8d]'
            }`}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-300 mt-4 font-black uppercase tracking-widest">
          Avocado loves hearing from you! 🌈✨
        </p>
      </div>
    </div>
  );
};