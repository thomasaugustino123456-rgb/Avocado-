
import { Share2, Download, Instagram, Facebook, X as CloseIcon, Smartphone, Camera as CameraIcon, Video, Wand2, Sparkles as SparklesIcon, PartyPopper, Smile, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, DailyLog } from '../types';
import { Mascot, MascotMood } from '../components/Mascot';
import { 
  Footprints, Droplets, Plus, Sparkles, Lightbulb, 
  X, Award, Star, Zap, Flame 
} from 'lucide-react';
import { getEncouragement } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface HomeProps {
  user: User;
  dailyLog: DailyLog;
  streak: number;
  onUpdateWater: (amount: number) => void;
  onUpdateSteps: (amount: number) => void;
  onAddMealClick: () => void;
  isCreatorMode?: boolean;
  setIsCreatorMode?: (v: boolean) => void;
}

interface FloatingFeedback {
  id: number;
  value: string;
  type: 'water' | 'steps';
  x: number;
  y: number;
}

export const Home: React.FC<HomeProps> = ({ user, dailyLog, streak, onUpdateWater, onUpdateSteps, onAddMealClick, isCreatorMode = false, setIsCreatorMode }) => {
  const [encouragement, setEncouragement] = useState("Hi friend! I'm so happy to see you! 🥑");
  const [clickCount, setClickCount] = useState(0);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [tempMood, setTempMood] = useState<MascotMood | null>(null);
  const [lastMouseY, setLastMouseY] = useState(0);
  const [pettingScore, setPettingScore] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [greeting, setGreeting] = useState("Hello");
  const [showTip, setShowTip] = useState(true);
  
  const [celebratedGoals, setCelebratedGoals] = useState<Set<string>>(new Set());
  const [goalCelebration, setGoalCelebration] = useState<{
    show: boolean, 
    title: string, 
    subtitle: string, 
    icon: React.ReactNode,
    color: string
  } | null>(null);

  useEffect(() => {
    if (!user?.name) return;

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    getEncouragement(user.name, dailyLog.steps, dailyLog.waterGlasses).then(setEncouragement);
  }, [user?.name, dailyLog.steps, dailyLog.waterGlasses]);

  const triggerGoalCelebration = useCallback((goal: any) => {
    setGoalCelebration({ 
      show: true, 
      title: goal.title, 
      subtitle: goal.subtitle, 
      icon: goal.icon,
      color: goal.color
    });
    setTempMood('success');
    audioService.playGold();
    
    setTimeout(() => {
      setGoalCelebration(null);
      setTempMood(null);
    }, 5000);
  }, []);

  const triggerManualConfetti = () => {
    setShowConfetti(true);
    audioService.playGold();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useEffect(() => {
    if (!user) return;

    const goalsToTrack = [
      { 
        id: 'water', 
        current: dailyLog.waterGlasses, 
        target: user.dailyWaterGoal, 
        title: 'Hydration Hero!', 
        subtitle: 'You are glowing! Bito is so proud! 💧', 
        icon: <Droplets className="text-blue-500 animate-bounce" size={56} />,
        color: 'from-blue-400 to-blue-600'
      },
      { 
        id: 'steps', 
        current: dailyLog.steps, 
        target: user.dailyStepGoal, 
        title: 'Step Master!', 
        subtitle: 'Bito loves those moves! Keep it up! 🐾', 
        icon: <Footprints className="text-[#A0C55F] animate-bounce" size={56} />,
        color: 'from-[#A0C55F] to-[#7d9e48]'
      }
    ];

    for (const goal of goalsToTrack) {
      if (goal.target > 0 && goal.current >= goal.target && !celebratedGoals.has(goal.id)) {
        triggerGoalCelebration(goal);
        setCelebratedGoals(prev => new Set(prev).add(goal.id));
        break;
      }
    }
  }, [dailyLog, user, celebratedGoals, triggerGoalCelebration]);

  const handleNativeShare = async () => {
    if (!user) return;
    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: `Bito Health - ${user.name}'s Progress`,
          text: `Check out Bito! I've taken ${dailyLog.steps} steps and drank ${dailyLog.waterGlasses} glasses of water today. 🥑✨`,
          url: 'https://getbito.vercel.app',
        });
      } catch (err) {
        console.log("Share failed or cancelled");
      } finally {
        setIsSharing(false);
      }
    } else {
      alert("Sharing isn't supported on this browser. Just take a screenshot of the card! 📸");
    }
  };

  useEffect(() => {
    if (mood === 'petting' || tempMood) return;

    if (clickCount === 0) setMood('idle');
    else if (clickCount >= 1 && clickCount <= 4) setMood('happy');
    else if (clickCount >= 7) setMood('angry');

    const resetTimer = setTimeout(() => {
      if (mood !== 'petting' && !tempMood) {
        setClickCount(0);
        setMood('idle');
      }
    }, 4000);

    return () => clearTimeout(resetTimer);
  }, [clickCount, mood, tempMood]);

  const handleInteractionMotion = (e: React.MouseEvent | React.TouchEvent) => {
    if (mood !== 'angry' && mood !== 'very-angry') return;
    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = Math.abs(currentY - lastMouseY);
    setLastMouseY(currentY);

    if (deltaY > 12) {
      setPettingScore(prev => prev + 1);
      if (pettingScore > 18) {
        setMood('petting');
        setClickCount(0);
        setPettingScore(0);
        setTimeout(() => setMood('happy'), 2000);
      }
    }
  };

  const addFeedback = (type: 'water' | 'steps', val: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    const newFeedback: FloatingFeedback = { id: Date.now(), value: val, type, x, y };
    setFeedbacks(prev => [...prev, newFeedback]);
    setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== newFeedback.id)), 1000);
    setTempMood('happy');
    setTimeout(() => setTempMood(null), 1200);
  };

  const handleWaterAdd = (e: React.MouseEvent) => {
    audioService.playIce();
    addFeedback('water', '+1 Glass', e);
    onUpdateWater(1);
  };

  const handleStepAdd = (e: React.MouseEvent) => {
    audioService.playIce();
    addFeedback('steps', '+500 Steps', e);
    onUpdateSteps(500);
  };

  const totalCalories = useMemo(() => dailyLog.meals.reduce((acc, meal) => acc + meal.calories, 0), [dailyLog.meals]);
  const progressPercent = user ? Math.min(100, (totalCalories / user.dailyCalorieGoal) * 100) : 0;
  const currentMood = tempMood || mood;

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAF5]">
        <Loader2 className="animate-spin text-[#A0C55F]" size={48} />
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 lg:p-12 space-y-8 pb-32 relative transition-all duration-700 ${isCreatorMode ? 'bg-white' : ''}`}>
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-4 h-4 rounded-sm animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#A0C55F', '#FFE66D', '#FFB347', '#60A5FA'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                top: '-20px'
              }}
            />
          ))}
        </div>
      )}

      {isCreatorMode && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[300] flex gap-4 bg-[#2F3E2E] p-4 rounded-[40px] shadow-2xl animate-in slide-in-from-bottom-10 border-4 border-white/20">
           <button onClick={() => setTempMood('happy')} className="p-4 bg-white/10 text-white rounded-3xl hover:bg-white/20 transition-all"><Smile size={24} /></button>
           <button onClick={() => setTempMood('success')} className="p-4 bg-white/10 text-white rounded-3xl hover:bg-white/20 transition-all"><Zap size={24} /></button>
           <button onClick={() => setTempMood('angry')} className="p-4 bg-white/10 text-white rounded-3xl hover:bg-white/20 transition-all"><Flame size={24} /></button>
           <button onClick={triggerManualConfetti} className="p-4 bg-[#FFE66D] text-[#2F3E2E] rounded-3xl hover:scale-105 transition-all"><PartyPopper size={24} /></button>
        </div>
      )}

      {showShareCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#2F3E2E]/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[56px] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col border border-white/20">
              <div id="capture-card" className="p-10 text-center space-y-8 bg-gradient-to-b from-[#F8FAF5] to-white relative">
                 <button onClick={() => setShowShareCard(false)} className="absolute top-6 right-6 p-3 bg-white shadow-md rounded-2xl hover:bg-gray-50 transition-all z-10"><CloseIcon size={24} /></button>
                 
                 <div className="space-y-2 pt-4">
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-8 h-8 bg-[#A0C55F] rounded-lg flex items-center justify-center font-brand font-black text-white text-sm">B</div>
                       <p className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.4em]">Bito Daily Wins</p>
                    </div>
                    <h3 className="text-4xl font-brand font-bold text-[#2F3E2E] leading-tight tracking-tight">
                       Look what <span className="text-[#A0C55F]">{user.name}</span> <br/>did today!
                    </h3>
                 </div>

                 <div className="bg-white p-14 rounded-[72px] shadow-2xl border-4 border-[#DFF2C2] relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#A0C55F]/5 to-transparent rounded-[68px]" />
                    <Mascot size={200} mood="success" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#A0C55F] text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">Level Up! 🥑✨</div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#EBF7DA] p-8 rounded-[40px] space-y-2 shadow-sm border border-white">
                       <Footprints className="text-[#A0C55F] mx-auto mb-2" size={28} />
                       <p className="text-3xl font-brand font-bold text-[#2F3E2E]">{dailyLog.steps.toLocaleString()}</p>
                       <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Steps Walked</p>
                    </div>
                    <div className="bg-[#E9F3FC] p-8 rounded-[40px] space-y-2 shadow-sm border border-white">
                       <Droplets className="text-blue-500 mx-auto mb-2" size={28} />
                       <p className="text-3xl font-brand font-bold text-[#2F3E2E]">{dailyLog.waterGlasses}</p>
                       <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Water Glasses</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-[#A0C55F] space-y-4">
                 <button 
                    onClick={handleNativeShare}
                    disabled={isSharing}
                    className="w-full bg-white py-5 rounded-3xl font-black text-[#2F3E2E] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isSharing ? <Loader2 className="animate-spin" /> : <Share2 size={24} />}
                    Share Progress
                 </button>
              </div>
           </div>
        </div>
      )}

      {!isCreatorMode && (
        <header className="stagger-in flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-2">
            <h2 className="text-6xl md:text-8xl font-brand font-bold text-[#2F3E2E] tracking-tighter leading-none">
              {greeting},<br /> {user.name}!
            </h2>
            <div className="flex items-center gap-3 pt-4">
              <div className="bg-[#A0C55F] text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                <Flame size={14} className="animate-pulse" /> {streak} Day Streak
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowShareCard(true)}
            className="px-8 py-5 bg-[#2F3E2E] text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#3d4f3b] transition-all shadow-xl active:scale-95 group"
          >
             <Smartphone size={18} className="group-hover:rotate-12 transition-transform" /> 
             Promote Bito
          </button>
        </header>
      )}

      <div className={`grid grid-cols-1 ${isCreatorMode ? '' : 'lg:grid-cols-12'} gap-10`}>
        <div className={`${isCreatorMode ? 'w-full flex flex-col items-center' : 'lg:col-span-7'} space-y-10`}>
          <div 
            className={`stagger-in ${isCreatorMode ? 'bg-transparent border-none shadow-none max-w-2xl' : 'bg-white p-12 rounded-[80px] shadow-sm hover:shadow-2xl'} active:scale-[0.98] transition-all duration-500 flex flex-col md:flex-row items-center gap-14 border border-white relative group cursor-pointer`}
            style={{ animationDelay: '0.2s' }}
            onMouseMove={handleInteractionMotion}
            onClick={() => setClickCount(prev => prev + 1)}
          >
            {!isCreatorMode && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A0C55F] to-[#FFE66D] opacity-20" />}
            <Mascot size={isCreatorMode ? 320 : 180} mood={currentMood} />
            <div className={`flex-1 ${isCreatorMode ? 'text-center' : 'text-center md:text-left'} space-y-4`}>
              {!isCreatorMode && (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Sparkles size={18} className="text-[#A0C55F]" />
                  <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.4em]">Bito Says</span>
                </div>
              )}
              <p className={`text-[#2F3E2E] ${isCreatorMode ? 'text-5xl' : 'text-3xl'} font-brand font-bold italic leading-tight`}>
                {currentMood === 'angry' ? "Hey! Bito needs some space! 😠" :
                 currentMood === 'petting' ? "Mmm... I could stay here all day... ♥" :
                 currentMood === 'success' ? "WOOHOO! YOU ARE AMAZING!! 🥑✨" :
                 `"${encouragement}"`}
              </p>
            </div>
          </div>
          
          {!isCreatorMode && (
            <div className="stagger-in bg-white p-12 rounded-[72px] shadow-sm border border-gray-50 space-y-8 group hover:shadow-xl transition-all" style={{ animationDelay: '0.3s' }}>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="font-brand font-bold text-3xl text-[#2F3E2E]">Daily Fuel</h3>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Target: {user.dailyCalorieGoal} KCAL</p>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-brand font-bold text-[#2F3E2E]">{totalCalories}</span>
                </div>
              </div>
              <div className="h-12 bg-[#F8FAF5] rounded-full p-2 border border-gray-100 shadow-inner overflow-hidden relative">
                <div 
                  className="h-full rounded-full transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) shadow-lg relative bg-[#A0C55F]"
                  style={{ width: `${progressPercent}%` }}
                >
                   <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
            </div>
          )}
        </div>

        {!isCreatorMode && (
          <div className="lg:col-span-5 grid grid-cols-1 gap-10">
            {[
              { 
                id: 'steps', 
                val: dailyLog.steps, 
                target: user.dailyStepGoal, 
                icon: Footprints, 
                color: 'text-[#A0C55F]', 
                bg: 'bg-[#EBF7DA]', 
                unit: 'steps',
                handler: handleStepAdd,
                delay: '0.4s'
              },
              { 
                id: 'water', 
                val: dailyLog.waterGlasses, 
                target: user.dailyWaterGoal, 
                icon: Droplets, 
                color: 'text-blue-500', 
                bg: 'bg-[#E9F3FC]', 
                unit: 'glasses',
                handler: handleWaterAdd,
                delay: '0.5s'
              }
            ].map((card) => (
              <div 
                key={card.id}
                className={`stagger-in p-10 rounded-[72px] shadow-sm space-y-8 relative overflow-hidden group hover:shadow-2xl active:scale-[0.95] active:shadow-inner transition-all ${card.bg}`}
                style={{ animationDelay: card.delay }}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="bg-white p-5 rounded-[32px] shadow-md group-hover:rotate-6 transition-transform">
                    <card.icon className={card.color} size={48} />
                  </div>
                  <button 
                    onClick={card.handler}
                    className="bg-white p-5 rounded-[32px] hover:scale-110 active:scale-90 transition-all shadow-xl"
                  >
                    <Plus size={40} className="text-[#2F3E2E]" />
                  </button>
                </div>
                <div className="space-y-1 relative z-10">
                  <h4 className="font-brand font-bold text-7xl text-[#2F3E2E] tracking-tighter">
                    {card.val.toLocaleString()}
                  </h4>
                  <p className={`text-[10px] font-black ${card.color} uppercase tracking-[0.4em]`}>Goal: {card.target} {card.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-confetti-fall { animation: confetti-fall 3s linear forwards; }
      `}</style>
    </div>
  );
};
