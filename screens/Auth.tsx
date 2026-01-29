
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mascot } from '../components/Mascot';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (isSignUp) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#DFF2C2] to-[#F8FAF5]">
        <div className="w-full max-w-md space-y-8 bg-white p-12 rounded-[48px] shadow-xl border border-gray-50 text-center animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-[#EBF7DA] p-6 rounded-full">
              <CheckCircle2 size={64} className="text-[#A0C55F]" />
            </div>
            <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">Check your inbox!</h2>
            <p className="text-gray-500 font-medium">
              We've sent a magic link to <span className="font-bold text-[#2F3E2E]">{email}</span>. Please click it to confirm your account and start your journey! 🥑
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-4 text-[#A0C55F] font-bold hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#DFF2C2] to-[#F8FAF5]">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[48px] shadow-xl border border-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Mascot size={100} />
          <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">
            {isSignUp ? 'Join Avocado' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm font-medium">Your friendly health companion 🥑</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-600 text-sm font-bold animate-in shake-1">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-[#F8FAF5] rounded-3xl border-none focus:ring-2 focus:ring-[#A0C55F]/30 text-lg"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-[#F8FAF5] rounded-3xl border-none focus:ring-2 focus:ring-[#A0C55F]/30 text-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-400 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A0C55F] py-5 rounded-3xl text-white text-xl font-bold shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-[#8eb052]"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#A0C55F] font-bold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
