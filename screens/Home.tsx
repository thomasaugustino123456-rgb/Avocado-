
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, DailyLog } from '../types';
import { Mascot, MascotMood } from '../components/Mascot';
import { 
  Footprints, Droplets, Plus, Sparkles, Heart, Lightbulb, 
  X, Trophy, Award, CheckCircle2, Star, Zap, Flame 
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
}

interface FloatingFeedback {
  id: number;
  value: string;
  type: 'water' | 'steps';
  x: number;
  y: number;
}

export const Home: React.FC<HomeProps> = ({ user, dailyLog, streak, onUpdateWater, onUpdateSteps, onAddMealClick }) => {
  const [encouragement, setEncouragement] = useState("Hi friend! I'm so happy to see you! 🥑");
  const [clickCount, setClickCount] = useState(0);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [tempMood, setTempMood] = useState<MascotMood | null>(null);
  const [lastMouseY, setLastMouseY] = useState(0);
  const [pettingScore, setPettingScore] = useState(0);
  
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [greeting, setGreeting] = useState("Hello");
  const [showTip, setShowTip] = useState(true);
  
  // Advanced Goal Tracking
  const [celebratedGoals, setCelebratedGoals] = useState<Set<string>>(new Set());
  const [goalCelebration, setGoalCelebration] = useState<{
    show: boolean, 
    title: string, 
    subtitle: string, 
    icon: React.ReactNode,
    color: string
  } | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    getEncouragement(user.name, dailyLog.steps, dailyLog.waterGlasses).then(setEncouragement);
  }, [user.name, dailyLog.steps, dailyLog.waterGlasses]);

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
    
    // Auto-dismiss celebration
    setTimeout(() => {
      setGoalCelebration(null);
      setTempMood(null);
    }, 5000);
  }, []);

  // Monitor goals and trigger celebrations
  useEffect(() => {
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
      },
      { 
        id: 'calories', 
        current: dailyLog.meals.reduce((acc, m) => acc + m.calories, 0), 
        target: user.dailyCalorieGoal, 
        title: 'Energy Balanced!', 
        subtitle: 'The perfect fuel for a perfect day! 🥑', 
        icon: <Zap className="text-orange-400 animate-bounce" size={56} />,
        color: 'from-orange-400 to-orange-600'
      }
    ];

    for (const goal of goalsToTrack) {
      if (goal.target > 0 && goal.current >= goal.target && !celebratedGoals.has(goal.id)) {
        triggerGoalCelebration(goal);
        setCelebratedGoals(prev => new Set(prev).add(goal.id));
        break; // Only one celebration at a time
      }
    }
  }, [dailyLog, user, celebratedGoals, triggerGoalCelebration]);

  useEffect(() => {
    if (mood === 'petting' || tempMood) return;

    if (clickCount === 0) setMood('idle');
    else if (clickCount >= 1 && clickCount <= 4) setMood('happy');
    else if (clickCount >= 5 && clickCount <= 6) setMood('little-happy');
    else if (clickCount >= 7 && clickCount <= 8) setMood('angry');
    else if (clickCount >= 9) setMood('very-angry');

    const resetTimer = setTimeout(() => {
      if (mood !== 'petting' && mood !== 'very-angry' && !tempMood) {
        setClickCount(0);
        setMood('idle');
      }
    }, 4000);

    return () => clearTimeout(resetTimer);
  }, [clickCount, mood, tempMood]);

  const handleInteractionMotion = (e: React.MouseEvent | React.TouchEvent) => {
    if (mood !== 'angry' && mood !== 'very-angry' && mood !== 'annoyed') return;

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
    const parentRect = (e.currentTarget as HTMLElement).closest('.relative')?.getBoundingClientRect() || rect;
    
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    const newFeedback: FloatingFeedback = { id: Date.now(), value: val, type, x, y };
    setFeedbacks(prev => [...prev, newFeedback]);
    
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== newFeedback.id));
    }, 1000);

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
  const progressPercent = Math.min(100, (totalCalories / user.dailyCalorieGoal) * 100);
  const currentMood = tempMood || mood;

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative overflow-hidden min-h-full">
      
      {/* Celebration Overlay */}
      {goalCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2F3E2E]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[72px] p-12 shadow-2xl border-4 border-[#A0C55F] max-w-md w-full text-center space-y-8 animate-in zoom-in-95 cubic-bezier(0.34, 1.56, 0.64, 1) duration-700 relative overflow-hidden">
             {/* Gradient Background Decoration */}
             <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${goalCelebration.color}`} />
             
             <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-4">
                <Star className="text-yellow-400 animate-bounce" size={48} />
                <Star className="text-yellow-400 animate-bounce delay-150" size={64} />
                <Star className="text-yellow-400 animate-bounce delay-300" size={48} />
             </div>
             
             <div className="bg-[#F8FAF5] p-16 rounded-[56px] shadow-inner flex items-center justify-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
                {goalCelebration.icon}
                <Sparkles className="absolute top-4 right-4 text-yellow-400 animate-pulse" size={32} />
             </div>
             
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EBF7DA] text-[#A0C55F] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                   <Award size={14} /> New Achievement
                </div>
                <h3 className="text-5xl font-brand font-black text-[#2F3E2E] leading-tight">
                  {goalCelebration.title}
                </h3>
                <p className="text-xl text-gray-500 font-medium leading-relaxed italic">
                  "{goalCelebration.subtitle}"
                </p>
             </div>

             <button 
              onClick={() => setGoalCelebration(null)}
              className="w-full bg-[#A0C55F] text-white py-6 rounded-[36px] font-black text-2xl shadow-2xl shadow-[#A0C55F]/40 hover:scale-105 active:scale-95 transition-all transform"
             >
               Awesome job, Bito! ✨
             </button>

             {/* Animated Confetti Particles */}
             <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-3 h-3 rounded-full animate-confetti" 
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        backgroundColor: ['#A0C55F', '#FFE66D', '#60A5FA', '#F87171', '#C084FC'][i % 5],
                        animationDelay: `${Math.random() * 4}s`,
                        top: '-20px'
                      }} 
                    />
                ))}
             </div>
          </div>
        </div>
      )}

      {showTip && (
        <div className="bg-[#FFE66D]/20 border border-[#FFE66D]/50 p-6 rounded-[32px] flex items-center gap-6 animate-in slide-in-from-top-4 relative group hover:bg-[#FFE66D]/30 transition-all">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-yellow-600 group-hover:rotate-12 transition-transform">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-[#2F3E2E] text-base">Pro Tip!</h4>
             <p className="text-sm text-gray-600 font-medium italic">Bito does a happy dance when you hit your water target! Try to reach 8 glasses today. 💧</p>
          </div>
          <button onClick={() => setShowTip(false)} className="text-gray-400 hover:text-gray-600 p-2">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h2 className="text-6xl md:text-8xl font-brand font-bold text-[#2F3E2E] tracking-tighter leading-none">
                {greeting},<br /> {user.name}!
              </h2>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <div className="bg-[#A0C55F] text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#A0C55F]/20 flex items-center gap-2">
                  <Flame size={14} className="animate-pulse" /> {streak} Day Streak
                </div>
                {celebratedGoals.size > 0 && (
                   <div className="bg-[#FFE66D] text-[#2F3E2E] px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 animate-bounce">
                     <Award size={14} /> {celebratedGoals.size} Goals Hit Today!
                   </div>
                )}
              </div>
            </div>
          </header>

          <div 
            className="bg-white p-12 md:p-16 rounded-[80px] shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row items-center gap-14 border border-white/50 relative overflow-hidden group active:scale-[0.99] cursor-default"
            onMouseMove={handleInteractionMotion}
            onTouchMove={handleInteractionMotion}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A0C55F] via-[#FFE66D] to-[#A0C55F] opacity-20" />
            
            <div 
              className="flex-shrink-0 cursor-pointer active:scale-90 transition-all relative z-10 hover:rotate-3"
              onClick={() => setClickCount(prev => prev + 1)}
            >
              <Mascot size={180} mood={currentMood} />
              {currentMood === 'very-angry' && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full animate-bounce whitespace-nowrap shadow-2xl uppercase tracking-widest">
                  GIVE ME SOME LOVE! 🐾
                </div>
              )}
            </div>

            <div className="relative z-10 flex-1 text-center md:text-left space-y-6">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="p-2.5 bg-[#F8FAF5] rounded-2xl text-[#A0C55F] shadow-sm">
                  <Sparkles size={20} />
                </div>
                <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.4em]">The Bito Feed</span>
              </div>
              <p className="text-[#2F3E2E] text-3xl md:text-4xl font-brand font-bold leading-tight italic max-w-md">
                {currentMood === 'very-angry' ? "WOOF! THAT TICKLES! TOO MUCH! 😡" : 
                 currentMood === 'angry' ? "Hey! Bito needs some space! 😠" :
                 currentMood === 'petting' ? "Mmm... I could stay here all day... ♥" :
                 currentMood === 'success' ? "WOOHOO! YOU ARE AMAZING!! 🥑✨" :
                 currentMood === 'little-happy' ? "Hehe! You're so kind! 😊" :
                 currentMood === 'happy' ? "YAY! Let's keep moving! 🐶" :
                 `"${encouragement}"`}
              </p>
            </div>
          </div>

          <div className="bg-white p-12 md:p-16 rounded-[72px] shadow-sm border border-gray-50 space-y-12 group hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#F8FAF5] rounded-full group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-2">
                <h3 className="font-brand font-bold text-4xl text-[#2F3E2E]">Daily Fuel</h3>
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">Calorie Progress Bar</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-brand font-bold transition-colors duration-500 ${totalCalories >= user.dailyCalorieGoal && user.dailyCalorieGoal > 0 ? 'text-[#A0C55F]' : 'text-[#2F3E2E]'}`}>{totalCalories}</span>
                  <span className="text-sm font-black text-gray-300">/ {user.dailyCalorieGoal} KCAL</span>
                </div>
              </div>
            </div>
            <div className="h-14 bg-[#F8FAF5] rounded-full p-2.5 border border-gray-100 shadow-inner overflow-hidden relative z-10">
              <div 
                className={`h-full rounded-full transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1) shadow-lg relative overflow-hidden ${
                   totalCalories >= user.dailyCalorieGoal && user.dailyCalorieGoal > 0 
                   ? 'bg-gradient-to-r from-[#A0C55F] via-yellow-300 to-[#A0C55F]' 
                   : 'bg-[#A0C55F]'
                }`}
                style={{ width: `${progressPercent}%` }}
              >
                 <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-10">
          <div className={`p-12 rounded-[72px] shadow-sm space-y-10 relative overflow-hidden group hover:shadow-2xl transition-all active:scale-[0.98] border-4 ${
            dailyLog.steps >= user.dailyStepGoal && user.dailyStepGoal > 0 ? 'bg-white border-[#A0C55F]' : 'bg-[#EBF7DA] border-transparent'
          }`}>
            <div className="flex justify-between items-center relative z-10">
              <div className="bg-white p-5 rounded-[32px] shadow-md group-hover:rotate-12 transition-transform">
                <Footprints className="text-[#A0C55F]" size={48} />
              </div>
              <button 
                onClick={handleStepAdd}
                className="bg-white p-5 rounded-[32px] hover:bg-[#FFE66D] transition-all shadow-xl active:scale-90 relative hover:-translate-y-2 group-active:scale-110"
              >
                <Plus size={40} className="text-[#2F3E2E]" />
              </button>
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-brand font-bold text-7xl md:text-8xl text-[#2F3E2E] tracking-tighter">
                {dailyLog.steps.toLocaleString()}
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.4em]">Goal: {user.dailyStepGoal} steps</p>
              </div>
            </div>
            {feedbacks.filter(f => f.type === 'steps').map(f => (
              <div key={f.id} className="absolute text-4xl font-black text-[#2F3E2E] pointer-events-none animate-float-up z-20" style={{ left: f.x, top: f.y }}>{f.value}</div>
            ))}
          </div>

          <div className={`p-12 rounded-[72px] shadow-sm space-y-10 relative overflow-hidden group hover:shadow-2xl transition-all active:scale-[0.98] border-4 ${
            dailyLog.waterGlasses >= user.dailyWaterGoal && user.dailyWaterGoal > 0 ? 'bg-white border-blue-400' : 'bg-[#E9F3FC] border-transparent'
          }`}>
            <div className="flex justify-between items-center relative z-10">
              <div className="bg-white p-5 rounded-[32px] shadow-md group-hover:-rotate-12 transition-transform">
                <Droplets className="text-blue-500" size={48} />
              </div>
              <button 
                onClick={handleWaterAdd}
                className="bg-white p-5 rounded-[32px] hover:bg-blue-100 transition-all shadow-xl active:scale-90 relative hover:-translate-y-2 group-active:scale-110"
              >
                <Plus size={40} className="text-blue-500" />
              </button>
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-brand font-bold text-7xl md:text-8xl text-[#2F3E2E] tracking-tighter">
                {dailyLog.waterGlasses}
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Goal: {user.dailyWaterGoal} glasses</p>
              </div>
            </div>
            {feedbacks.filter(f => f.type === 'water').map(f => (
              <div key={f.id} className="absolute text-4xl font-black text-blue-600 pointer-events-none animate-float-up z-20" style={{ left: f.x, top: f.y }}>{f.value}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
