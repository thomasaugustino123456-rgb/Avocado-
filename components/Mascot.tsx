
import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'encouraging' | 'wave';
}

export const Mascot: React.FC<MascotProps> = ({ className = '', size = 120, mood = 'happy' }) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size * 1.2 }}>
        {/* Avocado Body */}
        <div 
          className="absolute inset-0 bg-[#A0C55F] rounded-full border-4 border-[#2F3E2E]"
          style={{ borderRadius: '50% 50% 45% 45%' }}
        />
        {/* Avocado Inner */}
        <div 
          className="absolute top-2 left-2 right-2 bottom-4 bg-[#DFF2C2] rounded-full"
          style={{ borderRadius: '50% 50% 45% 45%' }}
        >
          {/* Eyes */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#2F3E2E] rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#2F3E2E] rounded-full animate-pulse" />
          
          {/* Mouth */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-6 h-3 border-b-2 border-[#2F3E2E] rounded-full" />
          
          {/* Pit */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#8B4513] rounded-full border-2 border-[#2F3E2E]" />
        </div>
      </div>
      {/* Arms (Optional visual) */}
      <div className="flex gap-12 -mt-16 relative z-10">
        <div className="w-4 h-2 bg-[#A0C55F] rounded-full border border-[#2F3E2E] -rotate-45" />
        <div className="w-4 h-2 bg-[#A0C55F] rounded-full border border-[#2F3E2E] rotate-45" />
      </div>
    </div>
  );
};
