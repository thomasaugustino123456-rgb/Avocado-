
import React, { useState, useEffect, useRef } from 'react';
import { User, DailyLog, MealType } from '../types';
import { Mascot } from '../components/Mascot';
import { Footprints, Droplets, Plus, ChefHat, Sparkles } from 'lucide-react';
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
  const [encouragement, setEncouragement] = useState("Hi friend! You're doing great! 🥑");
  const lastFetchTime = useRef<number>(0);
  const lastFetchStats = useRef({ steps: 0, water: 0 });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const totalCalories = dailyLog.meals.reduce((acc, meal) => acc + meal.calories, 0);
  const progressPercent = Math.min(100, (totalCalories / user.dailyCalorieGoal) * 100);

  // Smart Throttled Encouragement: Only fetch if stats change significantly OR 10 mins passed
  useEffect(() => {
    const now = Date.now();
    const timeDiff = now - lastFetchTime.current;
    const stepDiff = Math.abs(dailyLog.steps - lastFetchStats.current.steps);
    const waterDiff = Math.abs(dailyLog.waterGlasses - lastFetchStats.current.water);

    // Initial load OR major milestone (2k steps / 3 water) OR 10 minutes passed
    const shouldFetch = lastFetchTime.current === 0 || stepDiff >= 2000 || waterDiff >= 3 || timeDiff > 600000;

    if (shouldFetch) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = setTimeout(async () => {
        try {
          const msg = await getEncouragement(user.name, dailyLog.steps, dailyLog.waterGlasses);
          setEncouragement(msg);
          lastFetchTime.current = Date.now();
          lastFetchStats.current = { steps: dailyLog.steps, water: dailyLog.waterGlasses };
        } catch (e) {
          console.warn("Throttling fallback triggered.");
        }
      }, 1500);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [dailyLog.steps, dailyLog.waterGlasses, user.name]);

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E] tracking-tight">
                Hey {user.name}! 🥑
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-[#FFE66D] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-[#2F3E2E] shadow-sm">
                  {streak} Day Streak
                </div>
                <span className="text-gray-400 font-medium">You're doing amazing today!</span>
              </div>
            </div>
          </header>

          <div className="bg-white p-8 rounded-[48px] shadow-sm hover:shadow-xl transition-all duration-500 flex items-center gap-8 border border-gray-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8FAF5] rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex-shrink-0">
              <Mascot size={90} />
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#A0C55F]" />
                <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.2em]">Bito's Daily Note</span>
              </div>
              <p className="text-[#2F3E2E] text-xl md:text-2xl font-brand font-medium leading-relaxed italic">
                "{encouragement}"
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 space-y-6 group cursor-default">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="font-brand font-bold text-2xl">Daily Energy</h3>
                <p className="text-sm font-medium text-gray-400">Fueling your body right</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-brand font-bold text-[#2F3E2E]">{totalCalories}</span>
                <span className="text-sm font-bold text-gray-300 ml-1">/ {user.dailyCalorieGoal} kcal</span>
              </div>
            </div>
            <div className="h-6 bg-[#F0F4E8] rounded-full p-1 border border-gray-50 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#A0C55F] to-[#DFF2C2] rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">
              <span>Start</span>
              <span>Almost There!</span>
              <span>Goal</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          <div className="bg-[#EBF7DA] p-8 rounded-[48px] shadow-sm space-y-6 relative overflow-hidden group hover:shadow-lg transition-all active:scale-[0.98]">
            <div className="flex justify-between items-center relative z-10">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <Footprints className="text-[#A0C55F]" size={28} />
              </div>
              <button 
                onClick={() => onUpdateSteps(500)}
                className="bg-white p-3 rounded-2xl hover:bg-[#FFE66D] transition-all shadow-sm active:scale-90"
              >
                <Plus size={24} className="text-[#2F3E2E]" />
              </button>
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-brand font-bold text-5xl text-[#2F3E2E]">{dailyLog.steps.toLocaleString()}</h4>
              <p className="text-sm font-black text-[#A0C55F] uppercase tracking-widest">Steps Logged</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="bg-[#E9F3FC] p-8 rounded-[48px] shadow-sm space-y-6 relative overflow-hidden group hover:shadow-lg transition-all active:scale-[0.98]">
            <div className="flex justify-between items-center relative z-10">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <Droplets className="text-blue-400" size={28} />
              </div>
              <button 
                onClick={() => onUpdateWater(1)}
                className="bg-white p-3 rounded-2xl hover:bg-blue-100 transition-all shadow-sm active:scale-90"
              >
                <Plus size={24} className="text-blue-400" />
              </button>
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-brand font-bold text-5xl text-[#2F3E2E]">{dailyLog.waterGlasses}</h4>
              <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Glasses of Water</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="font-brand font-bold text-3xl">Meal Log</h3>
            <p className="text-gray-400 font-medium text-lg">Your nutrition roadmap for today 🍽️</p>
          </div>
          <button 
            onClick={onAddMealClick} 
            className="bg-[#FFE66D] px-8 py-3 rounded-2xl font-bold text-[#2F3E2E] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all active:scale-95"
          >
            Add New Meal
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {mealTypes.map((type) => {
            const mealForType = dailyLog.meals.find(m => m.type === type);
            return (
              <div key={type} className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 h-full relative overflow-hidden">
                <div className="space-y-6 mb-8 relative z-10">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12 duration-500 ${
                    type === 'breakfast' ? 'bg-orange-50 text-orange-400' : 
                    type === 'lunch' ? 'bg-blue-50 text-blue-400' : 'bg-purple-50 text-purple-400'
                  }`}>
                    <ChefHat size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-brand font-bold capitalize text-[#2F3E2E]">{type}</h4>
                    <p className="text-gray-400 font-medium text-lg mt-2 leading-tight">
                      {mealForType ? `${mealForType.name}` : 'Ready for a healthy start?'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-8 border-t border-gray-50 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Energy</p>
                    <span className="font-brand font-bold text-xl text-[#2F3E2E]">
                      {mealForType ? `${mealForType.calories} kcal` : '---'}
                    </span>
                  </div>
                  {!mealForType ? (
                    <button onClick={onAddMealClick} className="p-4 bg-[#F8FAF5] rounded-2xl text-gray-400 hover:text-[#A0C55F] transition-all hover:bg-[#DFF2C2]/30 active:scale-90">
                      <Plus size={28} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#EBF7DA] text-[#A0C55F] px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-tighter">
                      <Plus size={14} /> Logged
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-20 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
