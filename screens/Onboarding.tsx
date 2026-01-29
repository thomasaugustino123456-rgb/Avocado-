
import React, { useState } from 'react';
import { Mascot } from '../components/Mascot';
import { User } from '../types';
import { ArrowRight, ChevronLeft, Sparkles, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: User) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    weight: '70',
    height: '170',
    goal: 'Be more active 🥑'
  });

  const goals = [
    'Be more active 🥑',
    'Eat balanced meals 🥗',
    'Stay hydrated 💧',
    'Just curious! ✨'
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      const newUser: User = {
        name: formData.name || 'Friend',
        age: 25,
        weight: parseFloat(formData.weight),
        weightUnit: 'kg',
        height: parseInt(formData.height),
        goal: formData.goal,
        dailyCalorieGoal: 2000,
        dailyStepGoal: 8000,
        dailyWaterGoal: 8,
      };
      onComplete(newUser);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#DFF2C2] to-[#F8FAF5] overflow-hidden">
      {/* Progress Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-4">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="p-3 bg-white/50 rounded-2xl text-[#2F3E2E]">
            <ChevronLeft size={24} />
          </button>
        ) : <div className="w-12" />}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-[#A0C55F]' : 'w-2 bg-[#A0C55F]/20'}`} />
          ))}
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center text-center gap-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        {step === 1 && (
          <div className="space-y-10 w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-white/40 blur-3xl rounded-full" />
              <Mascot size={160} />
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-brand font-black text-[#2F3E2E] leading-tight">
                Hey! I'm Bito.<br /><span className="text-[#A0C55F]">What's your name?</span>
              </h1>
              <input 
                autoFocus
                type="text"
                placeholder="Type your name..."
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-8 py-6 rounded-[32px] bg-white border-none shadow-xl text-2xl font-brand font-bold focus:ring-4 focus:ring-[#A0C55F]/20 text-center"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 w-full animate-in slide-in-from-right duration-500">
            <div className="bg-white/50 p-6 rounded-full inline-block">
              <Target size={64} className="text-[#A0C55F]" />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-brand font-black text-[#2F3E2E]">Setting basics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Weight (kg)</label>
                  <input 
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-6 py-5 rounded-3xl bg-white border-none shadow-lg text-xl font-bold text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Height (cm)</label>
                  <input 
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-6 py-5 rounded-3xl bg-white border-none shadow-lg text-xl font-bold text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 w-full animate-in slide-in-from-right duration-500">
             <div className="bg-white/50 p-6 rounded-full inline-block">
              <Sparkles size={64} className="text-[#FFE66D]" />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-brand font-black text-[#2F3E2E]">What's our goal?</h2>
              <div className="grid grid-cols-1 gap-3">
                {goals.map(g => (
                  <button 
                    key={g}
                    onClick={() => setFormData({ ...formData, goal: g })}
                    className={`w-full py-5 rounded-3xl font-bold text-lg transition-all ${formData.goal === g ? 'bg-[#A0C55F] text-white shadow-xl scale-[1.02]' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleNext}
        disabled={step === 1 && !formData.name}
        className="w-full max-w-md bg-[#FFE66D] py-6 rounded-[32px] text-2xl font-black text-[#2F3E2E] shadow-2xl active:scale-95 transition-all mb-4 hover:shadow-[#FFE66D]/30 flex items-center justify-center gap-4 disabled:opacity-50"
      >
        {step === 3 ? "Let's Start!" : "Next Step"}
        <ArrowRight size={28} />
      </button>
    </div>
  );
};
