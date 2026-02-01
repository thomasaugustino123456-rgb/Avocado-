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
    
    setTimeout(() => {
      setGoalCelebration(null);
      setTempMood(null);
    }, 5000);
  }, []);

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
  const progressPercent = Math.min(100, (totalCalories / user.dailyCalorieGoal) * 100);
  const currentMood = tempMood || mood;

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 pb-24 relative overflow-hidden min-h-full">
      
      {/* Celebration Overlay */}
      {goalCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2F3E2E]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[72px] p-12 shadow-2xl border-4 border-[#A0C55F] max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-700">
             <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${goalCelebration.color}`} />
             <div className="flex justify-center gap-4">
                <Star className="text-yellow-400 animate-bounce" size={48} />
                <Star className="text-yellow-400 animate-bounce delay-150" size={64} />
             </div>
             <div className="bg-[#F8FAF5] p-12 rounded-[56px] shadow-inner flex items-center justify-center">
                {goalCelebration.icon}
             </div>
             <div className="space-y-2">
                <h3 className="text-4xl font-brand font-black text-[#2F3E2E]">{goalCelebration.title}</h3>
                <p className="text-lg text-gray-500 font-medium italic">"{goalCelebration.subtitle}"</p>
             </div>
             <button onClick={() => setGoalCelebration(null)} className="w-full bg-[#A0C55F] text-white py-5 rounded-[32px] font-black text-xl shadow-lg active:scale-95 transition-all">Awesome! ✨</button>
          </div>
        </div>
      )}

      {showTip && (
        <div className="stagger-in bg-[#FFE66D]/20 border border-[#FFE66D]/50 p-6 rounded-[32px] flex items-center gap-6 relative group transition-all" style={{ animationDelay: '0s' }}>
          <div className="bg-white p-3 rounded-2xl shadow-sm text-yellow-600">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-[#2F3E2E]">Pro Tip!</h4>
             <p className="text-sm text-gray-600 font-medium italic">Bito does a happy dance when you hit your water target! 💧</p>
          </div>
          <button onClick={() => setShowTip(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <header className="stagger-in space-y-2" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-6xl md:text-8xl font-brand font-bold text-[#2F3E2E] tracking-tighter leading-none">
              {greeting},<br /> {user.name}!
            </h2>
            <div className="flex items-center gap-3 pt-4">
              <div className="bg-[#A0C55F] text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                <Flame size={14} className="animate-pulse" /> {streak} Day Streak
              </div>
            </div>
          </header>

          {/* Mascot Card with Elevation */}
          <div 
            className="stagger-in bg-white p-12 rounded-[80px] shadow-sm hover:shadow-2xl active:scale-[0.98] transition-all duration-500 flex flex-col md:flex-row items-center gap-14 border border-white relative overflow-hidden group cursor-pointer"
            style={{ animationDelay: '0.2s' }}
            onMouseMove={handleInteractionMotion}
            onClick={() => setClickCount(prev => prev + 1)}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A0C55F] to-[#FFE66D] opacity-20" />
            <Mascot size={180} mood={currentMood} />
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles size={18} className="text-[#A0C55F]" />
                <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.4em]">Bito Says</span>
              </div>
              <p className="text-[#2F3E2E] text-3xl font-brand font-bold italic leading-tight">
                {currentMood === 'angry' ? "Hey! Bito needs some space! 😠" :
                 currentMood === 'petting' ? "Mmm... I could stay here all day... ♥" :
                 currentMood === 'success' ? "WOOHOO! YOU ARE AMAZING!! 🥑✨" :
                 `"${encouragement}"`}
              </p>
            </div>
          </div>

          {/* Calorie Card with Dynamic Fill & Shimmer */}
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
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-10">
          {/* Activity Cards with Tap Elevation */}
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
      </div>
      
      {/* Floating point feedbacks */}
      {feedbacks.map(f => (
        <div key={f.id} className="fixed text-3xl font-black text-[#2F3E2E] pointer-events-none animate-float-up z-[200]" style={{ left: f.x, top: f.y }}>{f.value}</div>
      ))}
    </div>
  );
};