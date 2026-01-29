
import React, { useState, useEffect, useRef } from 'react';
import { User, DailyLog, MealType } from '../types';
import { Mascot, MascotMood } from '../components/Mascot';
import { Footprints, Droplets, Plus, ChefHat, Sparkles, Heart } from 'lucide-react';
import { getEncouragement } from '../services/geminiService';

interface HomeProps {
  user: User;
  dailyLog: DailyLog;
  streak: number;
  onUpdateWater: (amount: number) => void;
  onUpdateSteps: (amount: number) => void;
  onAddMealClick: () => void;
}

export const Home: React.FC<HomeProps> = ({ user, dailyLog, streak, onUpdateWater, onUpdateSteps, onAddMealClick }) => {
  const [encouragement, setEncouragement] = useState("Hi friend! I'm so happy to see you! 🥑");
  const [clickCount, setClickCount] = useState(0);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [lastMouseY, setLastMouseY] = useState(0);
  const [pettingScore, setPettingScore] = useState(0);

  // Exact click count logic requested
  useEffect(() => {
    if (mood === 'petting') return;

    if (clickCount === 0) setMood('idle');
    else if (clickCount >= 1 && clickCount <= 4) setMood('happy');
    else if (clickCount >= 5 && clickCount <= 6) setMood('little-happy');
    else if (clickCount >= 7 && clickCount <= 8) setMood('angry');
    else if (clickCount >= 9) setMood('very-angry');

    const resetTimer = setTimeout(() => {
      if (mood !== 'petting' && mood !== 'very-angry') {
        setClickCount(0);
        setMood('idle');
      }
    }, 4000);

    return () => clearTimeout(resetTimer);
  }, [clickCount, mood]);

  // Petting calming logic: Hand/Mouse movement up and down
  const handleInteractionMotion = (e: React.MouseEvent | React.TouchEvent) => {
    // Only need petting if he's grumpy
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

  const totalCalories = dailyLog.meals.reduce((acc, meal) => acc + meal.calories, 0);
  const progressPercent = Math.min(100, (totalCalories / user.dailyCalorieGoal) * 100);

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-4xl md:text-6xl font-brand font-bold text-[#2F3E2E] tracking-tighter">
                Hey, {user.name}! 🥑
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-[#A0C55F] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#A0C55F]/20">
                  {streak} Day Streak
                </div>
                <span className="text-gray-400 font-bold">Bito is your little puppy!</span>
              </div>
            </div>
          </header>

          <div 
            className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[64px] shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row items-center gap-10 border border-white/50 relative overflow-hidden group"
            onMouseMove={handleInteractionMotion}
            onTouchMove={handleInteractionMotion}
          >
            {mood === 'petting' && (
              <div className="absolute inset-0 bg-red-50/20 flex items-center justify-center animate-pulse z-0">
                <Heart size={200} className="text-red-400/10 fill-current" />
              </div>
            )}

            <div 
              className="flex-shrink-0 cursor-pointer active:scale-90 transition-transform relative z-10"
              onClick={() => setClickCount(prev => prev + 1)}
            >
              <Mascot size={130} mood={mood} />
              {isVeryAngry(mood) && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full animate-bounce whitespace-nowrap shadow-xl">
                  PET ME TO CALM DOWN!
                </div>
              )}
            </div>

            <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles size={18} className="text-[#A0C55F]" />
                <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.3em]">Puppy Connection</span>
              </div>
              <p className="text-[#2F3E2E] text-2xl md:text-4xl font-brand font-bold leading-tight italic">
                {mood === 'very-angry' ? "WOOF! TOO MANY POKES! 😡" : 
                 mood === 'angry' ? "Grrr... that's enough now! 😠" :
                 mood === 'petting' ? "Aww... that's the spot... ♥" :
                 mood === 'little-happy' ? "Hehe, that's nice! 😊" :
                 mood === 'happy' ? "YAY! Play with me! 🐶" :
                 `"${encouragement}"`}
              </p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-8 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="font-brand font-bold text-3xl text-[#2F3E2E]">Fuel Status</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nutrition Gauge</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-brand font-bold text-[#2F3E2E]">{totalCalories}</span>
                <span className="text-sm font-black text-gray-300 ml-2">/ {user.dailyCalorieGoal} KCAL</span>
              </div>
            </div>
            <div className="h-10 bg-[#F8FAF5] rounded-full p-2 border border-gray-100 shadow-inner overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#A0C55F] via-[#DFF2C2] to-[#A0C55F] rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-8">
          <div className="bg-[#EBF7DA] p-10 rounded-[56px] shadow-sm space-y-6 relative overflow-hidden group hover:shadow-2xl transition-all active:scale-[0.98]">
            <div className="flex justify-between items-center relative z-10">
              <div className="bg-white p-4 rounded-3xl shadow-sm group-hover:rotate-12 transition-transform">
                <Footprints className="text-[#A0C55F]" size={32} />
              </div>
              <button 
                onClick={() => onUpdateSteps(500)}
                className="bg-white p-4 rounded-3xl hover:bg-[#FFE66D] transition-all shadow-md active:scale-90"
              >
                <Plus size={28} className="text-[#2F3E2E]" />
              </button>
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-brand font-bold text-6xl text-[#2F3E2E] tracking-tighter">{dailyLog.steps.toLocaleString()}</h4>
              <p className="text-xs font-black text-[#A0C55F] uppercase tracking-[0.3em]">Puppy Walk Distance</p>
            </div>
          </div>

          <div className="bg-[#E9F3FC] p-10 rounded-[56px] shadow-sm space-y-6 relative overflow-hidden group hover:shadow-2xl transition-all active:scale-[0.98]">
            <div className="flex justify-between items-center relative z-10">
              <div className="bg-white p-4 rounded-3xl shadow-sm group-hover:-rotate-12 transition-transform">
                <Droplets className="text-blue-500" size={32} />
              </div>
              <button 
                onClick={() => onUpdateWater(1)}
                className="bg-white p-4 rounded-3xl hover:bg-blue-100 transition-all shadow-md active:scale-90"
              >
                <Plus size={28} className="text-blue-500" />
              </button>
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-brand font-bold text-6xl text-[#2F3E2E] tracking-tighter">{dailyLog.waterGlasses}</h4>
              <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Hydration Level</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function isVeryAngry(mood: string) {
  return mood === 'very-angry';
}
