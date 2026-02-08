import React from 'react';

export type MascotMood = 'idle' | 'happy' | 'little-happy' | 'typing' | 'error' | 'success' | 'petting' | 'annoyed' | 'angry' | 'very-angry';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: MascotMood;
}

export const Mascot: React.FC<MascotProps> = ({ className = '', size = 120, mood = 'idle' }) => {
  const isSad = mood === 'error';
  const isHappy = mood === 'happy' || mood === 'success' || mood === 'petting' || mood === 'typing' || mood === 'little-happy';
  const isAngry = mood === 'angry' || mood === 'very-angry';

  // Dynamic values based on mood
  const mouthPath = isSad 
    ? "M 46 48 Q 50 44 54 48" // Frown
    : isHappy 
      ? "M 46 46 Q 50 50 54 46" // Smile
      : "M 47 48 L 53 48"; // Flat line for idle

  const leftEyeX = 42;
  const rightEyeX = 58;
  const eyeY = 40;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg 
        width={size} 
        height={size * 1.1} 
        viewBox="0 0 100 110" 
        className={`transition-all duration-300 ${
          mood === 'typing' || mood === 'happy' ? 'animate-puppy-jump' : 
          mood === 'very-angry' ? 'animate-rage-shake' : 
          'animate-float'
        }`}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="102" rx="35" ry="5" fill="rgba(0,0,0,0.06)" />

        {/* Sparkles (Decorative) */}
        {isHappy && (
          <g className="animate-pulse">
            <path d="M 15 35 L 17 37 L 15 39 L 13 37 Z" fill="#A0C55F" />
            <path d="M 85 25 L 88 28 L 85 31 L 82 28 Z" fill="#A0C55F" />
            <path d="M 20 65 L 22 67 L 20 69 L 18 67 Z" fill="#A0C55F" />
            <path d="M 80 75 L 82 77 L 80 79 L 78 77 Z" fill="#A0C55F" />
          </g>
        )}

        {/* Leaf on Top */}
        <g transform="translate(60, 5) rotate(15)">
           <path 
            d="M 0 10 Q 5 0, 15 5 Q 10 15, 0 10" 
            fill="#7d9e48" 
            stroke="#2F3E2E" 
            strokeWidth="2.5" 
           />
           <path d="M 0 10 L 10 7" stroke="#2F3E2E" strokeWidth="1.5" />
        </g>

        {/* Main Body (Rind) */}
        <path 
          d="M 50 10 C 25 10, 12 40, 12 70 C 12 95, 30 100, 50 100 C 70 100, 88 95, 88 70 C 88 40, 75 10, 50 10 Z" 
          fill="#A0C55F" 
          stroke="#2F3E2E" 
          strokeWidth="3.5"
          className="transition-colors duration-500"
          style={{ fill: isAngry ? '#FFB347' : isSad ? '#93C5FD' : '#A0C55F' }}
        />

        {/* Inner Meat */}
        <path 
          d="M 50 15 C 30 15, 18 42, 18 68 C 18 92, 32 95, 50 95 C 68 95, 82 92, 82 68 C 82 42, 70 15, 50 15 Z" 
          fill="#DFF2C2" 
        />

        {/* Eyes */}
        <g className="transition-all duration-300">
          <circle 
            cx={leftEyeX} 
            cy={eyeY} 
            r={isSad ? 1.5 : 2.5} 
            fill="#2F3E2E" 
          />
          <circle 
            cx={rightEyeX} 
            cy={eyeY} 
            r={isSad ? 1.5 : 2.5} 
            fill="#2F3E2E" 
          />
        </g>

        {/* Mouth */}
        <path 
          d={mouthPath} 
          fill="none" 
          stroke="#2F3E2E" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          className="transition-all duration-300"
        />

        {/* The Pit (Seed) */}
        <circle 
          cx="50" 
          cy="75" 
          r="11" 
          fill="#8B4513" 
          stroke="#2F3E2E" 
          strokeWidth="2.5" 
          className={`transition-transform duration-700 ${mood === 'typing' ? 'animate-bounce' : ''}`}
        />

        {/* Tiny Arms Holding the Pit */}
        <g>
          {/* Left Arm */}
          <path 
            d="M 38 72 Q 42 75 42 75" 
            fill="none" 
            stroke="#2F3E2E" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className={mood === 'typing' ? 'animate-typing-L' : ''}
          />
          <circle cx="38" cy="72" r="2.5" fill="#A0C55F" stroke="#2F3E2E" strokeWidth="1.5" />
          
          {/* Right Arm */}
          <path 
            d="M 62 72 Q 58 75 58 75" 
            fill="none" 
            stroke="#2F3E2E" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className={mood === 'typing' ? 'animate-typing-R' : ''}
          />
          <circle cx="62" cy="72" r="2.5" fill="#A0C55F" stroke="#2F3E2E" strokeWidth="1.5" />
        </g>

        {/* Petting Hearts Overlay */}
        {mood === 'petting' && (
           <g className="animate-heart-pop">
              <text x="20" y="30" fontSize="12" fill="#F87171">♥</text>
              <text x="75" y="25" fontSize="10" fill="#F87171">♥</text>
              <text x="45" y="15" fontSize="8" fill="#F87171">♥</text>
           </g>
        )}
      </svg>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes puppy-jump {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-18px) scaleY(1.05); }
        }
        @keyframes rage-shake {
          0%, 100% { transform: translate(0,0); }
          25% { transform: translate(3px, 3px); }
          75% { transform: translate(-3px, -3px); }
        }
        @keyframes typing-L {
          0%, 100% { transform: rotate(0) translateY(0); }
          50% { transform: rotate(-10deg) translateY(-3px); }
        }
        @keyframes typing-R {
          0%, 100% { transform: rotate(0) translateY(0); }
          50% { transform: rotate(10deg) translateY(-3px); }
        }
        .animate-puppy-jump { animation: puppy-jump 0.4s infinite ease-in-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-rage-shake { animation: rage-shake 0.1s infinite linear; }
        .animate-typing-L { animation: typing-L 0.2s infinite; }
        .animate-typing-R { animation: typing-R 0.2s infinite 0.1s; }
        .animate-heart-pop { animation: float 1s infinite alternate; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin 10s linear infinite; }
      `}</style>
    </div>
  );
};