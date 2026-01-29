
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Mascot } from '../components/Mascot';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      let friendlyError = "Something went wrong. Check your details!";
      if (err.code === 'auth/user-not-found') friendlyError = "No account found with this email.";
      if (err.code === 'auth/wrong-password') friendlyError = "Oops! That's the wrong password.";
      if (err.code === 'auth/email-already-in-use') friendlyError = "This email is already registered!";
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#DFF2C2] to-[#F8FAF5]">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[48px] shadow-xl border border-gray-50 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center gap-4">
          <Mascot size={100} />
          <div className="text-center">
            <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">
              {isSignUp ? 'Join the Club' : 'Welcome Back'}
            </h2>
            <p className="text-[#A0C55F] font-black text-[10px] tracking-[0.2em] uppercase mt-2 flex items-center justify-center gap-2">
              <Sparkles size={12} /> Bito Health Companion
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-600 text-sm font-bold animate-in shake-1">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A0C55F] transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-[#F8FAF5] rounded-[24px] border-none focus:ring-4 focus:ring-[#A0C55F]/20 text-lg font-medium"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A0C55F] transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-14 py-5 bg-[#F8FAF5] rounded-[24px] border-none focus:ring-4 focus:ring-[#A0C55F]/20 text-lg font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#A0C55F] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A0C55F] py-6 rounded-[28px] text-white text-xl font-bold shadow-xl shadow-[#A0C55F]/20 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-[#8eb052] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? 'Create My Account' : 'Sign In Now'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-400 font-bold text-sm hover:text-[#A0C55F] transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "New here? Create an account!"}
          </button>
        </div>
      </div>
    </div>
  );
};
