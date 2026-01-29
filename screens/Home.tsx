
import React, { useState, useEffect } from 'react';
import { User, DailyLog, MealType } from '../types';
import { Mascot } from '../components/Mascot';
import { Footprints, Droplets, Plus, ChefHat } from 'lucide-react';
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
  const [encouragement, setEncouragement] = useState("Loading a friendly tip...");
  
  const totalCalories = dailyLog.meals.reduce((acc, meal) => acc + meal.calories, 0);
  const progressPercent = Math.min(100, (totalCalories / user.dailyCalorieGoal) * 100);

  useEffect(() => {
    const fetchMsg = async () => {
      const msg = await getEncouragement(user.name, dailyLog.steps, dailyLog.waterGlasses);
      setEncouragement(msg);
    };
    fetchMsg();
  }, [dailyLog.steps, dailyLog.waterGlasses]);

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 animate-in fade-in duration-500">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Header & Mascot */}
        <div className="lg:col-span-7 space-y-6 md:space-y-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-brand font-bold text-[#2F3E2E]">Hello, {user.name} 👋</h2>
              <p className="text-gray-500 font-medium text-lg">{streak} Day Consistency Streak</p>
            </div>
            <div className="lg:hidden bg-[#DFF2C2] p-3 rounded-2xl">
              <ChefHat className="text-[#2F3E2E]" size={28} />
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm flex items-center gap-6 border border-gray-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F8FAF5] rounded-full -mr-8 -mt-8 opacity-50" />
            <div className="flex-shrink-0 scale-90 md:scale-100">
              <Mascot size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-[#2F3E2E] text-lg md:text-xl font-medium leading-relaxed italic">
                "{encouragement}"
              </p>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm space-y-4 border border-gray-50">
            <div className="flex justify-between items-end">
              <h3 className="font-bold text-xl">Daily Nutrition Goal</h3>
              <span className="text-lg font-bold text-gray-400">{totalCalories} <span className="text-sm">/ {user.dailyCalorieGoal} kcal</span></span>
            </div>
            <div className="h-5 bg-[#F0F4E8] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#A0C55F] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
          <div className="bg-[#EBF7DA] p-6 md:p-8 rounded-[32px] shadow-sm space-y-4 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <Footprints className="text-[#A0C55F]" size={32} />
              <button 
                onClick={() => onUpdateSteps(500)}
                className="bg-white/80 p-2 rounded-xl hover:bg-white transition-all shadow-sm active:scale-90"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-3xl md:text-4xl">{dailyLog.steps.toLocaleString()}</h4>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Steps Today</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          </div>

          <div className="bg-[#F0F4E8] p-6 md:p-8 rounded-[32px] shadow-sm space-y-4 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <Droplets className="text-blue-400" size={32} />
              <button 
                onClick={() => onUpdateWater(1)}
                className="bg-white/80 p-2 rounded-xl hover:bg-white transition-all shadow-sm active:scale-90"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-3xl md:text-4xl">{dailyLog.waterGlasses}</h4>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Glasses of Water</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Meal Summary Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-2xl">Today's Meals</h3>
          <button onClick={onAddMealClick} className="text-[#A0C55F] font-bold hover:underline transition-all">Add New Meal</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealTypes.map((type) => {
            const mealForType = dailyLog.meals.find(m => m.type === type);
            return (
              <div key={type} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-md transition-all h-full">
                <div className="space-y-4 mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    type === 'breakfast' ? 'bg-orange-50 text-orange-400' : 
                    type === 'lunch' ? 'bg-blue-50 text-blue-400' : 'bg-purple-50 text-purple-400'
                  }`}>
                    <ChefHat size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold capitalize">{type}</h4>
                    <p className="text-gray-400 font-medium mt-1">
                      {mealForType ? `${mealForType.name}` : 'Nothing logged yet'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <span className="font-bold text-[#2F3E2E]">
                    {mealForType ? `${mealForType.calories} kcal` : '---'}
                  </span>
                  {!mealForType ? (
                    <button onClick={onAddMealClick} className="p-3 bg-[#F8FAF5] rounded-xl text-gray-400 hover:text-[#A0C55F] transition-all hover:bg-[#DFF2C2]/30">
                      <Plus size={24} />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#A0C55F] uppercase bg-[#EBF7DA] px-3 py-1 rounded-full">Logged</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
