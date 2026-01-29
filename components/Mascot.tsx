
import React from 'react';

export type MascotMood = 'idle' | 'happy' | 'little-happy' | 'typing' | 'error' | 'success' | 'petting' | 'annoyed' | 'angry' | 'very-angry';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: MascotMood;
}

export const Mascot: React.FC<MascotProps> = ({ className = '', size = 120, mood = 'idle' }) => {
  const isVeryAngry = mood === 'very-angry';
  const isAngry = mood === 'angry' || isVeryAngry;
  const isSad = mood === 'error';
  const isHappy = mood === 'happy' || mood === 'success' || mood === 'petting' || mood === 'typing' || mood === 'little-happy';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <div 
        className={`relative transition-all duration-300 ${
          mood === 'typing' || mood === 'happy' ? 'animate-puppy-jump' : 
          mood === 'very-angry' ? 'animate-rage-shake' : 
          mood === 'petting' ? 'animate-float' :
          'animate-float'
        }`} 
        style={{ width: size, height: size * 1.2 }}
      >
        {/* Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/10 rounded-full blur-md" />

        {/* Body */}
        <div 
          className={`absolute inset-0 border-[3px] border-[#2F3E2E] shadow-xl transition-all duration-500 ${
            isVeryAngry ? 'bg-red-600 scale-110' : 
            mood === 'angry' ? 'bg-orange-500' :
            mood === 'error' ? 'bg-blue-400' :
            mood === 'petting' ? 'bg-[#A0C55F] scale-105' :
            'bg-[#A0C55F]'
          }`}
          style={{ borderRadius: '50% 50% 45% 45%' }}
        />

        {/* Inner Face/Pit Area */}
        <div 
          className="absolute top-1.5 left-1.5 right-1.5 bottom-3.5 bg-[#DFF2C2] overflow-hidden transition-colors duration-500"
          style={{ borderRadius: '50% 50% 45% 45%' }}
        >
          {/* Eyes container */}
          <div className="absolute top-[30%] left-0 right-0 flex justify-around px-4">
            {/* Left Eye */}
            <div className="relative">
              {isSad && (
                <div className="absolute top-0 left-0 w-2 h-6 bg-blue-200/80 rounded-full animate-tear" />
              )}
              <div className={`w-2.5 h-2.5 bg-[#2F3E2E] rounded-full transition-all duration-300 ${
                mood === 'petting' ? 'h-1 w-4 scale-x-150 rotate-[-10deg]' : 
                isAngry ? 'h-1.5 w-4 -rotate-12 translate-y-1' : 
                isSad ? 'h-4 w-1.5 rounded-t-full translate-y-1' : ''
              }`} />
            </div>
            {/* Right Eye */}
            <div className="relative">
              {isSad && (
                <div className="absolute top-0 right-0 w-2 h-6 bg-blue-200/80 rounded-full animate-tear delay-300" />
              )}
              <div className={`w-2.5 h-2.5 bg-[#2F3E2E] rounded-full transition-all duration-300 ${
                mood === 'petting' ? 'h-1 w-4 scale-x-150 rotate-[10deg]' : 
                isAngry ? 'h-1.5 w-4 rotate-12 translate-y-1' : 
                isSad ? 'h-4 w-1.5 rounded-t-full translate-y-1' : ''
              }`} />
            </div>
          </div>
          
          {/* Mouth */}
          <div className={`absolute top-[48%] left-1/2 -translate-x-1/2 transition-all duration-300 ${
            mood === 'petting' ? 'w-4 h-2 bg-red-400 rounded-full' :
            isHappy ? 'w-6 h-3 border-b-[3px] border-[#2F3E2E] rounded-full' : 
            isAngry ? 'w-4 h-1.5 bg-[#2F3E2E] rounded-full' : 
            isSad ? 'w-4 h-3 border-t-[3px] border-[#2F3E2E] rounded-full' : 
            'w-5 h-2 border-b-2 border-[#2F3E2E] rounded-full'
          }`} />
          
          {/* The Pit (Nose) */}
          <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#8B4513] rounded-full border-2 border-[#2F3E2E] shadow-inner transition-transform duration-700 ${
            mood === 'typing' || mood === 'happy' ? 'animate-bounce' : ''
          }`} />

          {/* Petting Hearts Overlay */}
          {mood === 'petting' && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-red-400 animate-heart-pop text-xl absolute top-4 left-4">♥</div>
                <div className="text-red-300 animate-heart-pop text-lg absolute top-2 right-6 delay-150">♥</div>
                <div className="text-red-500 animate-heart-pop text-sm absolute bottom-8 left-6 delay-300">♥</div>
             </div>
          )}
        </div>
      </div>

      {/* Arms/Paws */}
      <div className="flex gap-12 -mt-14 relative z-10">
        <div className={`w-6 h-2.5 bg-[#A0C55F] rounded-full border-2 border-[#2F3E2E] transition-all duration-300 ${
          mood === 'typing' ? '-rotate-90 -translate-y-4 translate-x-2' : 
          mood === 'very-angry' ? 'rotate-180 -translate-y-1' : '-rotate-45'
        }`} />
        <div className={`w-6 h-2.5 bg-[#A0C55F] rounded-full border-2 border-[#2F3E2E] transition-all duration-300 ${
          mood === 'typing' ? 'rotate-90 -translate-y-4 -translate-x-2' : 
          mood === 'very-angry' ? 'rotate-180 -translate-y-1' : 'rotate-45'
        }`} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes puppy-jump {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-20px) scaleY(1.1) rotate(5deg); }
        }
        @keyframes rage-shake {
          0%, 100% { transform: translate(0,0); }
          20% { transform: translate(2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }
        @keyframes heart-pop {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          50% { transform: scale(1.5) translateY(-10px); opacity: 1; }
          100% { transform: scale(2) translateY(-25px); opacity: 0; }
        }
        @keyframes tear {
          0% { height: 0; opacity: 1; transform: translateY(0); }
          100% { height: 18px; opacity: 0; transform: translateY(12px); }
        }
        .animate-puppy-jump { animation: puppy-jump 0.35s infinite ease-in-out; }
        .animate-rage-shake { animation: rage-shake 0.1s infinite linear; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-heart-pop { animation: heart-pop 0.8s ease-out forwards; }
        .animate-tear { animation: tear 1.2s infinite linear; }
      `}</style>
    </div>
  );
};
