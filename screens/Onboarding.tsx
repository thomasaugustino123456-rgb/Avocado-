
import React from 'react';
import { Mascot } from '../components/Mascot';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#DFF2C2] to-[#F8FAF5]">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
        <div className="bg-white/40 p-12 rounded-full backdrop-blur-sm border border-white/50 shadow-inner">
          <Mascot size={160} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-brand font-bold text-[#2F3E2E] leading-tight">
            Track daily, <br /> reach your goals
          </h1>
          <p className="text-lg text-gray-600 px-4">
            A calm, friendly way to track your meals, steps, and water without any stress.
          </p>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className="w-full bg-[#FFE66D] py-5 rounded-[24px] text-xl font-bold text-[#2F3E2E] shadow-xl active:scale-95 transition-all mb-4 hover:bg-[#ffed8d]"
      >
        Get Ready!
      </button>
    </div>
  );
};
