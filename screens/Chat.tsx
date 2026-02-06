
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Loader2, Sparkles, ChevronLeft, Save, Check } from 'lucide-react';
import { ChatMessage, LibraryItem } from '../types';
import { startAvocadoChat } from '../services/geminiService';
import { Mascot, MascotMood } from '../components/Mascot';
import { persistenceService } from '../services/persistenceService';
import { audioService } from '../services/audioService';

interface ChatScreenProps {
  onBack?: () => void;
  onSaveInsight?: (data: any) => Promise<void>;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, onSaveInsight }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hey friend! 🥑 I'm Avocado, your personal cheer-squad! How's your day going? Ready to crush some goals together? ✨", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  
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

  const handleSaveToLibrary = async () => {
    if (isSaving || isSaved || messages.length < 2) return;
    
    setIsSaving(true);
    setMascotMood('success');
    audioService.playIce();

    try {
      // Create a summary snapshot of the conversation
      const summary = messages
        .filter(m => m.role === 'model')
        .slice(-2)
        .map(m => m.text)
        .join('\n\n');

      if (onSaveInsight) {
        await onSaveInsight({
          title: "AI Chat Insight",
          content: summary,
          timestamp: new Date().toISOString()
        });
      }
      
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setMascotMood('idle');
      }, 3000);
    } catch (err) {
      console.error("Save chat error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const userChatMessage: ChatMessage = { role: 'user', text: userMsg, timestamp: new Date() };
    const newMessages: ChatMessage[] = [...messages, userChatMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setMascotMood('typing');

    await persistenceService.saveChatMessage(userChatMessage);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg });
      const modelChatMessage: ChatMessage = { 
        role: 'model', 
        text: response.text || "Oops, I got lost in the pit! Try again? 🥑", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, modelChatMessage]);
      await persistenceService.saveChatMessage(modelChatMessage);
      setMascotMood('happy');
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I'm having a tiny avocado-malfunction! Can we try that again? 🌈", 
        timestamp: new Date() 
      }]);
      setMascotMood('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAF5] relative overflow-hidden">
      {/* Global Mobile Top Nav */}
      <header className="lg:hidden h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-500 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="bg-[#DFF2C2] p-2 rounded-xl shadow-sm">
            <Mascot size={32} mood={mascotMood} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-brand font-bold text-[#2F3E2E]">Avocado AI</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#A0C55F] rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-widest">Always Here! ✨</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSaveToLibrary}
          disabled={isSaving || messages.length < 2}
          className={`p-3.5 rounded-2xl transition-all active:scale-90 shadow-sm flex items-center gap-2 ${
            isSaved ? 'bg-[#A0C55F] text-white shadow-[#A0C55F]/20' : 'bg-white text-gray-400 border border-gray-100'
          } disabled:opacity-30`}
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : (isSaved ? <Check size={20} /> : <Save size={20} />)}
        </button>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex p-6 bg-white border-b border-gray-100 items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-[#2F3E2E] transition-all active:scale-95 mr-2">
            <ArrowLeft size={20} />
          </button>
          <div className="bg-[#DFF2C2] p-2 rounded-xl">
            <Mascot size={40} mood={mascotMood} />
          </div>
          <div>
            <h2 className="text-xl font-brand font-bold text-[#2F3E2E]">Chat with Avocado</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Always Here! ✨</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSaveToLibrary}
          disabled={isSaving || messages.length < 2}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
            isSaved ? 'bg-[#A0C55F] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isSaved ? <Check size={18} /> : <Save size={18} />)}
          <span className="text-sm uppercase tracking-widest">{isSaved ? 'Saved!' : 'Save Insight'}</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col min-h-0"
      >
        <div className="mt-auto" />
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
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[32px] rounded-tl-lg border border-gray-50 flex items-center gap-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-bold text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 md:p-6 pb-28 lg:pb-6 shrink-0">
        <div className="relative max-w-4xl mx-auto flex items-center gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to me! 🥑..."
            className="flex-1 bg-[#F8FAF5] border-none focus:ring-2 focus:ring-[#A0C55F]/30 rounded-[28px] px-6 py-4 text-lg font-medium shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-[24px] shadow-lg transition-all active:scale-95 ${
              !input.trim() || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-[#FFE66D] text-[#2F3E2E]'
            }`}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};
