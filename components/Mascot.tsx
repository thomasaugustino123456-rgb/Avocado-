
import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'encouraging' | 'wave';
}

export const Mascot: React.FC<MascotProps> = ({ className = '', size = 120, mood = 'happy' }) => {
  return (
    <div className={`relative flex flex-col items-center group cursor-pointer ${className}`}>
      <div className="relative animate-float" style={{ width: size, height: size * 1.2 }}>
        {/* Avocado Body */}
        <div 
          className="absolute inset-0 bg-[#A0C55F] rounded-full border-4 border-[#2F3E2E] shadow-lg transition-transform group-hover:scale-105 duration-500"
          style={{ borderRadius: '50% 50% 45% 45%' }}
        />
        {/* Avocado Inner */}
        <div 
          className="absolute top-2 left-2 right-2 bottom-4 bg-[#DFF2C2] rounded-full overflow-hidden"
          style={{ borderRadius: '50% 50% 45% 45%' }}
        >
          {/* Eyes with blink animation */}
          <div className="absolute top-1/3 left-1/4 w-2.5 h-2.5 bg-[#2F3E2E] rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-[#2F3E2E] rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          
          {/* Mouth */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-6 h-3 border-b-4 border-[#2F3E2E] rounded-full" />
          
          {/* Pit */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#8B4513] rounded-full border-2 border-[#2F3E2E] shadow-inner transform transition-transform group-hover:rotate-12 duration-700" />
          
          {/* Shine effect */}
          <div className="absolute top-2 left-4 w-4 h-8 bg-white/20 rounded-full blur-sm rotate-12" />
        </div>
      </div>
      {/* Arms that wiggle */}
      <div className="flex gap-14 -mt-16 relative z-10 transition-transform group-hover:translate-y-1">
        <div className="w-5 h-2.5 bg-[#A0C55F] rounded-full border border-[#2F3E2E] -rotate-45 animate-pulse" />
        <div className="w-5 h-2.5 bg-[#A0C55F] rounded-full border border-[#2F3E2E] rotate-45 animate-pulse" />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
