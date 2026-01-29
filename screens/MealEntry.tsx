
import React, { useState } from 'react';
import { Meal, MealType } from '../types';
import { ArrowLeft, Search, Flame, Clock } from 'lucide-react';

interface MealEntryProps {
  onAdd: (meal: Meal) => void;
  onCancel: () => void;
}

export const MealEntry: React.FC<MealEntryProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [type, setType] = useState<MealType>('breakfast');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;
    
    onAdd({
      id: Date.now().toString(),
      name,
      calories: parseInt(calories),
      type,
      timestamp: new Date(),
    });
  };

  return (
    <div className="p-6 h-full flex flex-col gap-8 animate-in slide-in-from-right duration-300">
      <header className="flex items-center gap-4">
        <button onClick={onCancel} className="bg-white p-3 rounded-2xl shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-brand font-bold">Add a Meal</h2>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Meal Type</label>
          <div className="grid grid-cols-3 gap-3">
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-3 rounded-2xl font-bold transition-all ${
                  type === t 
                  ? 'bg-[#FFE66D] text-[#2F3E2E] shadow-lg scale-105' 
                  : 'bg-white text-gray-400 border border-gray-100'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Food Name</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What did you eat?"
                className="w-full pl-12 pr-4 py-5 bg-white rounded-3xl border border-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A0C55F]/20 text-lg font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Calories (Approx)</label>
            <div className="relative">
              <Flame className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-5 bg-white rounded-3xl border border-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A0C55F]/20 text-lg font-medium"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-300">kcal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-[24px] border border-orange-100/50">
          <div className="bg-white p-2 rounded-xl">
            <Clock className="text-orange-400" size={16} />
          </div>
          <p className="text-xs text-orange-800 font-medium">
            Don't worry about being exact! Close enough is perfect for Bito.
          </p>
        </div>

        <button 
          type="submit"
          disabled={!name || !calories}
          className="w-full bg-[#A0C55F] py-5 rounded-3xl text-white text-xl font-bold shadow-xl active:scale-95 disabled:opacity-50 transition-all"
        >
          Add to {type}
        </button>
      </form>
    </div>
  );
};
