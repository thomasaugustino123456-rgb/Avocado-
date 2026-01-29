
import React, { useState, useEffect } from 'react';
import { TrophyStatus } from '../types';
import { audioService } from '../services/audioService';
// Added ZapOff to the imports from lucide-react
import { ChevronLeft, ChevronRight, Star, Snowflake, Sparkles, ZapOff } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [status, setStatus] = useState<TrophyStatus>('golden');
  
  useEffect(() => {
    // Logic to determine status based on current performance data
    // For this MVP demo, we cycle through to show the UI
    const mockInactivityDays = 0; 
    if (mockInactivityDays === 0) setStatus('golden');
    else if (mockInactivityDays <= 3) setStatus('ice');
    else setStatus('broken');
  }, []);

  const playTrophySound = () => {
    if (status === 'golden') audioService.playGold();
    else if (status === 'ice') audioService.playIce();
    else audioService.playBroken();
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const now = new Date();
  const currentDayOfMonth = now.getDate();
  const isThisMonth = currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">Performance Log</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50"><ChevronLeft size={20}/></button>
          <button className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50"><ChevronRight size={20}/></button>
        </div>
      </header>

      {/* Trophy Showcase Area */}
      <div className="bg-white rounded-[48px] p-10 shadow-sm border border-gray-50 flex flex-col items-center gap-8 text-center relative overflow-hidden group">
        <div 
          className="relative cursor-pointer select-none" 
          onClick={playTrophySound}
          title="Tap for sound!"
        >
          {status === 'golden' && (
            <div className="relative animate-float">
              {/* Golden Glow & Shimmer */}
              <div className="absolute -inset-8 bg-yellow-200/40 rounded-full blur-[40px] animate-pulse" />
              <div className="relative z-10 p-4">
                <img 
                  src="https://img.icons8.com/emoji/160/000000/trophy-emoji.png" 
                  alt="Golden Trophy"
                  className="w-40 h-40 drop-shadow-[0_20px_30px_rgba(255,215,0,0.5)]"
                />
                {/* Overlay Shimmer Effect */}
                <div className="absolute inset-4 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none rounded-full" />
              </div>
              {/* Floating Sparkles */}
              <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" size={32} />
              <Star className="absolute top-1/2 -left-8 text-yellow-300 animate-spin-slow" size={24} />
            </div>
          )}

          {status === 'ice' && (
            <div className="relative animate-shiver">
              {/* Frosty Blue Aura */}
              <div className="absolute -inset-8 bg-blue-100/60 rounded-full blur-[30px] animate-glow-blue" />
              <div className="relative z-10 p-4">
                <img 
                  src="https://img.icons8.com/emoji/160/000000/ice-cube.png" 
                  alt="Ice Trophy"
                  className="w-40 h-40 drop-shadow-xl opacity-90"
                />
              </div>
              <Snowflake className="absolute -top-2 -left-2 text-blue-300 animate-spin-slow" size={28} />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-200/30 rounded-full blur-md animate-pulse" />
            </div>
          )}

          {status === 'broken' && (
            <div className="relative animate-shatter-jolt grayscale group-hover:grayscale-0 transition-all duration-700">
              <div className="relative z-10 p-4 opacity-50">
                <img 
                  src="https://img.icons8.com/external-flatart-icons-outline-flatarticons/160/000000/external-trophy-winner-flatart-icons-outline-flatarticons.png" 
                  alt="Deteriorated Trophy"
                  className="w-40 h-40"
                />
                {/* Cracked CSS Overlays */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-gray-400/30 rotate-45" />
                  <div className="w-full h-0.5 bg-gray-400/30 -rotate-45" />
                </div>
              </div>
              <ZapOff className="absolute top-0 right-0 text-gray-400 animate-pulse" size={24} />
            </div>
          )}
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <h3 className={`text-3xl font-brand font-bold capitalize ${
              status === 'golden' ? 'text-yellow-600' : 
              status === 'ice' ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {status === 'golden' ? 'Unstoppable Streak!' : 
               status === 'ice' ? 'Thawing Period' : 'Start Fresh'}
            </h3>
          </div>
          <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
            {status === 'golden' ? "You're glowing! Every habit you log keeps this trophy shining bright. Keep that energy up!" : 
             status === 'ice' ? "It's been a few days. Don't let your progress freeze over—one log today will thaw it back to gold!" : 
             "Progress takes time. It's okay to start over! Log your next activity to begin building a new trophy today."}
          </p>
          
          <div className="pt-2">
            <button 
              onClick={playTrophySound}
              className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all active:scale-95 ${
                status === 'golden' ? 'bg-yellow-100 text-yellow-700' : 
                status === 'ice' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}
            >
              SOUND EFFECTS ON
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Display */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 space-y-8">
        <div className="flex justify-between items-center px-2">
          <div className="space-y-1">
            <h4 className="text-2xl font-brand font-bold text-[#2F3E2E]">{monthName} {currentDate.getFullYear()}</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Performance History</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-[#A0C55F] bg-[#EBF7DA] px-4 py-2 rounded-2xl">80% Consistent</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-gray-300 pb-2">{d}</div>
          ))}
          
          {emptyDays.map(i => <div key={`empty-${i}`} />)}
          
          {days.map(day => {
            const isToday = isThisMonth && day === currentDayOfMonth;
            const hasProgress = isThisMonth && day < currentDayOfMonth && day % 3 !== 0; 
            
            return (
              <div 
                key={day} 
                className={`aspect-square flex flex-col items-center justify-center rounded-3xl relative transition-all cursor-pointer group hover:shadow-md ${
                  isToday ? 'bg-[#FFE66D] ring-4 ring-[#FFE66D]/20 shadow-xl scale-105' : 'bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100'
                }`}
              >
                <span className={`text-sm font-black ${isToday ? 'text-[#2F3E2E]' : 'text-gray-400'}`}>{day}</span>
                {hasProgress && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2.5 h-2.5 bg-[#A0C55F] rounded-full border-2 border-white shadow-sm animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes glow-blue {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shiver {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          10% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          20% { transform: translate(1px, 1px) rotate(0.5deg); }
          30% { transform: translate(-1px, 1px) rotate(-0.5deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
        }
        @keyframes shatter-jolt {
          0%, 90% { transform: translate(0, 0) rotate(0); }
          92% { transform: translate(2px, 2px) rotate(2deg); }
          94% { transform: translate(-2px, -2px) rotate(-2deg); }
          96% { transform: translate(2px, -2px) rotate(1deg); }
          98% { transform: translate(-2px, 2px) rotate(-1deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-shimmer { animation: shimmer 3s infinite; }
        .animate-float { animation: float 4s infinite ease-in-out; }
        .animate-glow-blue { animation: glow-blue 2s infinite ease-in-out; }
        .animate-shiver { animation: shiver 0.3s infinite linear; }
        .animate-shatter-jolt { animation: shatter-jolt 2s infinite ease-in-out; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};
