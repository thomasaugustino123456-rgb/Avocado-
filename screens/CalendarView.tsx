import React, { useState, useMemo } from 'react';
import { TrophyStatus } from '../types';
import { audioService } from '../services/audioService';
import { 
  ChevronLeft, ChevronRight, Star, Snowflake, Sparkles, 
  ZapOff, Info, AlertTriangle, ShieldCheck, Trophy,
  Zap, HeartCrack, Flame
} from 'lucide-react';

interface CalendarViewProps {
  history?: any[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ history = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate Trophy Status based on "Duolingo" decay logic
  // Today Active -> Golden
  // Missed Today but Yesterday Active -> Ice
  // Missed 2+ Days -> Broken
  const status = useMemo((): TrophyStatus => {
    if (!history || history.length === 0) return 'broken';

    // history[0] is most recent (usually today)
    const todayLog = history[0];
    const yesterdayLog = history[1];

    if (todayLog?.hasActivity) return 'golden';
    if (yesterdayLog?.hasActivity) return 'ice';
    
    return 'broken'; 
  }, [history]);

  // Calculate total trophies earned in the current history view
  const totalTrophiesEarned = useMemo(() => {
    return history.filter(h => h.hasActivity).length;
  }, [history]);

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
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in fade-in duration-500 relative pb-40">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A0C55F]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-[#F8FAF5]/80 backdrop-blur-md py-4 z-50">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E]">Performance Log</h2>
          <p className="text-gray-400 font-medium">Tracking your consistency one day at a time 🥑</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
            className="p-4 bg-white rounded-2xl shadow-sm hover:bg-gray-50 active:scale-90 transition-all border border-gray-100"
          >
            <ChevronLeft size={20}/>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
            className="p-4 bg-white rounded-2xl shadow-sm hover:bg-gray-50 active:scale-90 transition-all border border-gray-100"
          >
            <ChevronRight size={20}/>
          </button>
        </div>
      </header>

      {/* Trophy Showcase Area */}
      <div className={`bg-white rounded-[64px] p-10 md:p-14 shadow-sm border border-gray-50 flex flex-col items-center gap-10 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-700`}>
        <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${
          status === 'golden' ? 'bg-yellow-400' : status === 'ice' ? 'bg-blue-400' : 'bg-gray-400'
        }`} />

        {/* Trophy Display */}
        <div 
          className="relative cursor-pointer select-none z-10 p-10" 
          onClick={playTrophySound}
        >
          {status === 'golden' && (
            <div className="relative animate-float">
              <div className="absolute -inset-10 bg-yellow-200/50 rounded-full blur-[50px] animate-pulse" />
              <div className="relative z-10 p-8 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-full shadow-[0_0_80px_rgba(255,215,0,0.5)] border-4 border-yellow-200">
                <Trophy size={120} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none rounded-full" />
              </div>
              <Sparkles className="absolute -top-6 -right-6 text-yellow-500 animate-bounce" size={48} />
              <Star className="absolute top-1/2 -left-16 text-yellow-300 animate-spin-slow" size={32} />
              <Star className="absolute bottom-0 -right-8 text-yellow-400 animate-pulse" size={24} />
              
              {/* Counter Badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#2F3E2E] text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-xl animate-pop-in">
                 {totalTrophiesEarned}
              </div>
            </div>
          )}

          {status === 'ice' && (
            <div className="relative animate-shiver">
              <div className="absolute -inset-10 bg-blue-100/60 rounded-full blur-[40px] animate-glow-blue" />
              <div className="relative z-10 p-8 bg-gradient-to-br from-blue-50 via-blue-200 to-blue-400 rounded-full shadow-[0_0_60px_rgba(173,216,230,0.8)] border-4 border-white/50">
                <Trophy size={120} className="text-white opacity-80" strokeWidth={1.5} />
              </div>
              <Snowflake className="absolute -top-4 -left-4 text-blue-300 animate-spin-slow" size={40} />
              <Snowflake className="absolute bottom-0 right-0 text-blue-200 animate-pulse" size={32} />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-blue-100/40 rounded-full blur-xl" />
              
              <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 border-white shadow-xl">
                 {totalTrophiesEarned}
              </div>
            </div>
          )}

          {status === 'broken' && (
            <div className="relative animate-shatter-jolt">
              <div className="relative z-10 p-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full shadow-inner border-4 border-gray-300/50">
                <Trophy size={120} className="text-gray-500 opacity-60" strokeWidth={1.5} />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <path d="M50 20 L45 40 L55 50 L40 70 L50 85" stroke="#4B5563" strokeWidth="2" fill="none" className="opacity-40" />
                  <path d="M20 50 L40 45 L60 55 L80 50" stroke="#4B5563" strokeWidth="1.5" fill="none" className="opacity-30" />
                </svg>
              </div>
              <HeartCrack className="absolute -top-6 -right-6 text-gray-400 animate-pulse" size={48} />
              <AlertTriangle className="absolute bottom-0 -left-8 text-red-400 animate-bounce" size={32} />
              <ZapOff className="absolute top-1/2 -right-16 text-gray-300 opacity-50" size={24} />
              
              <div className="absolute -bottom-4 -right-4 bg-gray-400 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 border-white shadow-xl">
                 {totalTrophiesEarned}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-center gap-3">
             <div className={`w-3 h-3 rounded-full ${status === 'golden' ? 'bg-[#A0C55F]' : status === 'ice' ? 'bg-blue-400' : 'bg-red-400'} animate-pulse`} />
             <h3 className={`text-4xl font-brand font-bold capitalize tracking-tight ${
                status === 'golden' ? 'text-yellow-600' : 
                status === 'ice' ? 'text-blue-500' : 'text-gray-500'
             }`}>
                {status === 'golden' ? 'Glowing Gold! 🏆' : 
                 status === 'ice' ? 'Freezing Over... 🧊' : 'Log your First Goal 💔'}
             </h3>
          </div>
          <p className="text-gray-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">
            {status === 'golden' ? `You earned a new trophy today! You have ${totalTrophiesEarned} in your collection. Keep the fire burning! 🔥` : 
             status === 'ice' ? "Watch out! You missed today. Your trophy has frozen into ice! Complete a mission now to turn it back to gold! 🥑✨" : 
             "Your streak is broken! But don't worry—Bito believes in you. Log one thing today to start your new golden collection! 🚀"}
          </p>
          
          <div className="pt-4 flex flex-wrap justify-center gap-4">
             <div className="px-6 py-3 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center gap-3">
                <Flame size={18} className={status === 'golden' ? 'text-[#A0C55F] animate-pulse' : 'text-gray-300'} />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Earned: {totalTrophiesEarned}</span>
             </div>
             <button 
                onClick={playTrophySound}
                className={`px-8 py-3 rounded-full text-xs font-black tracking-[0.2em] uppercase transition-all active:scale-95 shadow-lg ${
                  status === 'golden' ? 'bg-yellow-100 text-yellow-700 shadow-yellow-100/50' : 
                  status === 'ice' ? 'bg-blue-50 text-blue-600 shadow-blue-50/50' : 'bg-gray-100 text-gray-500 shadow-gray-100/50'
                }`}
              >
                Check Status Sound
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[56px] p-8 md:p-12 shadow-sm border border-gray-50 space-y-10 relative group">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-3xl font-brand font-bold text-[#2F3E2E]">{monthName} {currentDate.getFullYear()}</h4>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Consistency Tracker</p>
          </div>
          <div className="flex items-center gap-3 bg-[#F8FAF5] px-6 py-3 rounded-[24px] border border-gray-100">
             <Info size={16} className="text-[#A0C55F]" />
             <span className="text-sm font-bold text-[#2F3E2E]">Active days earn you 1 Golden Trophy</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-center text-[11px] font-black text-gray-300 pb-4">{d}</div>
          ))}
          
          {emptyDays.map(i => <div key={`empty-${i}`} className="aspect-square opacity-0" />)}
          
          {days.map(day => {
            const isToday = isThisMonth && day === currentDayOfMonth;
            const historyDay = history.find(h => {
               const hDate = new Date(h.date);
               return hDate.getDate() === day && hDate.getMonth() === currentDate.getMonth() && hDate.getFullYear() === currentDate.getFullYear();
            });
            const hasProgress = historyDay?.hasActivity;
            
            return (
              <div 
                key={day} 
                className={`aspect-square flex flex-col items-center justify-center rounded-[24px] md:rounded-[32px] relative transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1 ${
                  isToday ? 'bg-[#FFE66D] ring-4 ring-[#FFE66D]/20 shadow-xl scale-110 z-10' : 'bg-[#F8FAF5]/60 hover:bg-white border-2 border-transparent hover:border-[#A0C55F]/10'
                }`}
              >
                <span className={`text-lg font-black ${isToday ? 'text-[#2F3E2E]' : 'text-gray-400'}`}>{day}</span>
                {hasProgress && (
                  <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <div className="w-3 h-3 bg-[#A0C55F] rounded-full border-2 border-white shadow-sm animate-pulse" />
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
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes glow-blue {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes shiver {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          25% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          75% { transform: translate(1px, 1px) rotate(0.5deg); }
        }
        @keyframes shatter-jolt {
          0%, 90% { transform: translate(0, 0) rotate(0); }
          91% { transform: translate(2px, 2px) rotate(2deg); }
          93% { transform: translate(-2px, -2px) rotate(-2deg); }
          95% { transform: translate(2px, -2px) rotate(1.5deg); }
          97% { transform: translate(-2px, 2px) rotate(-1.5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-shimmer { animation: shimmer 3s infinite linear; }
        .animate-float { animation: float 4s infinite ease-in-out; }
        .animate-glow-blue { animation: glow-blue 2.5s infinite ease-in-out; }
        .animate-shiver { animation: shiver 0.2s infinite linear; }
        .animate-shatter-jolt { animation: shatter-jolt 3s infinite ease-in-out; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};