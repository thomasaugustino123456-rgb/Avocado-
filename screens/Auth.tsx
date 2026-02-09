import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, sendPasswordResetEmail } from 'firebase/auth';
import { Mascot, MascotMood } from '../components/Mascot';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Sparkles, ChevronLeft, UserCircle, AlertTriangle, ExternalLink, Copy, MousePointer2, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';

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
  const [isDomainError, setIsDomainError] = useState(false);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [isTyping, setIsTyping] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (loading) setMood('success'); 
    else if (error) setMood('error');
    else if (isTyping) setMood('typing');
    else setMood('idle');
  }, [loading, error, isTyping]);

  const handleGoogleSignIn = async (useRedirect = false) => {
    setLoading(true);
    setError(null);
    setIsDomainError(false);
    setIsPopupBlocked(false);
    
    try {
      if (useRedirect) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        setError("Domain access denied! Whitelist this domain in Firebase Console. 🛑");
      } else if (err.code === 'auth/popup-blocked') {
        setIsPopupBlocked(true);
        setError("Login window was blocked! Try redirect instead. 🛑");
      } else {
        setError("Google sign-in failed. Try again? 🥑");
      }
      setMood('error');
    } finally {
      setLoading(false);
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsDomainError(false);
    setIsPopupBlocked(false);
    setIsTyping(false);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth Error details:", err);
      let friendlyError = "Bito is confused... check your details!";
      
      if (err.code === 'auth/invalid-credential') {
        // Generic modern firebase error: usually means email not found OR wrong password
        friendlyError = isSignUp 
          ? "This email might already be in use, or Bito can't create this account right now. 🥑" 
          : "Invalid email or password. If you haven't made an account yet, try 'Sign Up'! 🥑";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = "An account already exists with this email! Switch to Sign In. 🥑";
      } else if (err.code === 'auth/weak-password') {
        friendlyError = "Bito needs a stronger password! Use 6+ characters. 🥑";
      } else if (err.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        friendlyError = "Domain denied! Check Firebase authorized domains. 🛑";
      } else {
        friendlyError = "Something went wrong! " + (err.message || "Try again later.");
      }
      
      setError(friendlyError);
      setMood('error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first so Bito can send the link! 🥑");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(null);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError("Reset failed. Is the email correct?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F0F4E8] relative overflow-y-auto">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-10 left-10 p-4 bg-white/60 hover:bg-white rounded-3xl transition-all flex items-center gap-2 font-bold shadow-sm z-50"
        >
          <ChevronLeft /> Back
        </button>
      )}

      <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-2xl p-10 rounded-[64px] shadow-2xl border border-white/50 animate-in zoom-in-95 duration-500 relative overflow-hidden my-12">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#A0C55F]/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center gap-6 relative z-10 text-center">
          <Mascot size={140} mood={mood} />
          <div>
            <h2 className="text-4xl font-brand font-bold text-[#2F3E2E]">
              {isSignUp ? "New Best Friend!" : "Welcome Home"}
            </h2>
            <p className="text-[#A0C55F] font-black text-xs tracking-[0.2em] uppercase mt-2">
              Bito Health Companion
            </p>
          </div>
        </div>

        {error && (
            <div className={`p-6 rounded-[32px] border text-sm font-bold animate-shake relative z-20 ${isDomainError ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <div className="flex gap-3">
                <AlertTriangle className="shrink-0 mt-1" size={20} />
                <div className="space-y-4 w-full">
                  <p className="text-base">{error}</p>
                  
                  {/* HELPER BUTTON FOR INVALID CREDENTIAL */}
                  {error.includes("Invalid email or password") && !isSignUp && (
                    <div className="flex flex-col gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => { setIsSignUp(true); setError(null); }}
                        className="w-full bg-[#2F3E2E] text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg"
                      >
                        <RefreshCw size={14} /> Switch to Sign Up
                      </button>
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-gray-400 text-xs font-bold hover:text-[#2F3E2E]"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {isDomainError && (
                    <div className="space-y-4 pt-3 border-t border-orange-200/50">
                      <p className="text-[11px] leading-relaxed">
                        Copy this domain and add it to <b>Firebase Console > Auth > Settings > Authorized Domains</b>:
                      </p>
                      <div className="bg-white/80 p-3 rounded-xl flex items-center justify-between gap-2 border border-orange-200 shadow-inner group">
                         <code className="text-[10px] font-mono break-all font-bold text-orange-900">{window.location.hostname}</code>
                         <button type="button" onClick={() => navigator.clipboard.writeText(window.location.hostname)} className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors text-orange-700 shrink-0">
                           <Copy size={14} />
                         </button>
                      </div>
                      <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="w-full bg-orange-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-[11px] hover:bg-orange-700 transition-all shadow-md font-black uppercase tracking-widest">
                        Go to Firebase Console <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {resetSent && (
          <div className="p-6 bg-[#EBF7DA] border border-[#A0C55F]/30 rounded-[32px] flex items-center gap-4 text-[#2F3E2E] font-bold animate-in zoom-in-95">
             <CheckCircle2 className="text-[#A0C55F] shrink-0" />
             <p>Bito sent a reset link to your email! 🥑✨</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A0C55F] transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-16 pr-7 py-5 bg-[#F8FAF5]/60 rounded-[32px] border-2 border-transparent focus:border-[#A0C55F]/40 focus:bg-white outline-none text-lg font-medium transition-all shadow-inner"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A0C55F] transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-16 pr-16 py-5 bg-[#F8FAF5]/60 rounded-[32px] border-2 border-transparent focus:border-[#A0C55F]/40 focus:bg-white outline-none text-lg font-medium transition-all shadow-inner"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#A0C55F] transition-colors">
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
                {isSignUp ? "Let's Start!" : "Sign In"}
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>
        
        <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center gap-4 opacity-30">
                <div className="h-px bg-gray-300 flex-1"/>
                <span className="text-xs font-bold uppercase tracking-widest">Or social</span>
                <div className="h-px bg-gray-300 flex-1"/>
            </div>
            <button
                onClick={() => handleGoogleSignIn(false)}
                disabled={loading}
                className="w-full bg-white border border-gray-100 py-5 rounded-[36px] text-[#2F3E2E] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
            </button>
            {onGuestLogin && (
                <button onClick={onGuestLogin} className="w-full py-4 text-gray-400 font-bold hover:text-[#2F3E2E] transition-all text-sm">
                    Continue as Guest
                </button>
            )}
        </div>

        <div className="text-center pt-2 relative z-10">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-[#2F3E2E] font-bold text-sm underline underline-offset-4 decoration-[#A0C55F]"
          >
            {isSignUp ? 'Already have an account? Sign In' : "New to Bito? Sign Up"}
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