
import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Mascot, MascotMood } from '../components/Mascot';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Sparkles, ChevronLeft, UserCircle } from 'lucide-react';

interface AuthProps {
  onBack?: () => void;
  onGuestLogin?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onBack, onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (loading) setMood('success'); 
    else if (error) setMood('error');
    else if (isTyping) setMood('typing');
    else setMood('idle');
  }, [loading, error, isTyping]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsTyping(false);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth Error details:", err);
      let friendlyError = "Bito is crying... check your details!";
      
      // Handle Firebase specific error codes with friendlier messages
      if (err.code === 'auth/invalid-credential') {
        friendlyError = "Check your email and password, or create a new account if you're new! 🥑";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = "You already have an account! Try signing in instead.";
      } else if (err.code === 'auth/weak-password') {
        friendlyError = "That password is a bit too soft. Use at least 6 characters!";
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = "That email looks a bit odd. Is there a typo? 🧐";
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = "Email/Password sign-in isn't enabled on Bito's server yet.";
      } else {
        friendlyError = err.message || "Something went wrong. Try again in a bit!";
      }
      
      setError(friendlyError);
      setMood('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F0F4E8] relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-10 left-10 p-4 bg-white/60 hover:bg-white rounded-3xl transition-all flex items-center gap-2 font-bold shadow-sm"
        >
          <ChevronLeft /> Back
        </button>
      )}

      <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-2xl p-10 rounded-[64px] shadow-2xl border border-white/50 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#A0C55F]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FFE66D]/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="hover:scale-105 transition-transform duration-500 cursor-pointer">
             <Mascot size={140} mood={mood} />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-brand font-bold text-[#2F3E2E]">
              {isSignUp ? "New Best Friend!" : "Welcome Home"}
            </h2>
            <p className="text-[#A0C55F] font-black text-xs tracking-[0.2em] uppercase mt-2 flex items-center justify-center gap-2">
              <Sparkles size={14} className="animate-pulse" /> Bito Health Companion
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          {error && (
            <div className="p-5 bg-red-50 rounded-[28px] border border-red-100 text-red-600 text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A0C55F] transition-colors" size={20} />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-16 pr-7 py-5 bg-[#F8FAF5]/60 rounded-[32px] border-2 border-transparent focus:border-[#A0C55F]/40 focus:bg-white outline-none text-lg font-medium transition-all shadow-inner"
                required
              />
            </div>
            <div className="relative group">
              <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A0C55F] transition-colors z-20">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Secret Password"
                value={password}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-16 pr-16 py-5 bg-[#F8FAF5]/60 rounded-[32px] border-2 border-transparent focus:border-[#A0C55F]/40 focus:bg-white outline-none text-lg font-medium transition-all shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#A0C55F] transition-colors z-20"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A0C55F] py-6 rounded-[36px] text-white text-xl font-bold shadow-2xl shadow-[#A0C55F]/30 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-[#8eb052] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? 'Bark! Let\'s Start' : 'Enter Bito World'}
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>
        
        {onGuestLogin && (
            <div className="relative z-10 text-center space-y-4">
                <div className="flex items-center gap-4 opacity-50">
                    <div className="h-px bg-gray-300 flex-1"/>
                    <span className="text-xs font-bold text-gray-400 uppercase">Or</span>
                    <div className="h-px bg-gray-300 flex-1"/>
                </div>
                <button
                    onClick={onGuestLogin}
                    className="w-full bg-white border border-gray-100 py-4 rounded-[36px] text-gray-500 font-bold hover:bg-gray-50 hover:text-[#2F3E2E] transition-all flex items-center justify-center gap-2"
                >
                    <UserCircle size={20} />
                    Continue as Guest
                </button>
            </div>
        )}

        <div className="text-center pt-2 relative z-10">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-gray-400 font-bold text-sm hover:text-[#A0C55F] transition-colors p-2"
          >
            {isSignUp ? 'Wait, I have an account' : "I'm new, create my Bito!"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};
