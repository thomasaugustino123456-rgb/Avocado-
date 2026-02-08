import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { Mascot, MascotMood } from '../components/Mascot';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Sparkles, ChevronLeft, UserCircle, AlertTriangle, ExternalLink, Copy, MousePointer2, CheckCircle2 } from 'lucide-react';

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
        setError("Domain access denied by Firebase! 🛑");
      } else if (err.code === 'auth/popup-blocked') {
        setIsPopupBlocked(true);
        setError("Bito's login window was blocked! 🛑");
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
      let friendlyError = "Bito is crying... check your details!";
      
      if (err.code === 'auth/invalid-credential') {
        friendlyError = "Check your email and password, or create a new account if you're new! 🥑";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = "You already have an account! Try signing in instead.";
      } else if (err.code === 'auth/weak-password') {
        friendlyError = "That password is a bit too soft. Use at least 6 characters!";
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = "That email looks a bit odd. Is there a typo? 🧐";
      } else {
        friendlyError = err.message || "Something went wrong. Try again in a bit!";
      }
      
      setError(friendlyError);
      setMood('error');
    } finally {
      setLoading(false);
    }
  };

  const copyCurrentDomain = () => {
    navigator.clipboard.writeText(window.location.hostname);
    alert("Domain copied! Use this in Firebase. 🥑");
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
            <div className={`p-6 rounded-[32px] border text-sm font-bold animate-shake ${isDomainError || isPopupBlocked ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <div className="flex gap-3">
                <AlertTriangle className="shrink-0 mt-1" size={20} />
                <div className="space-y-4">
                  <p className="text-base">{error}</p>
                  
                  {isPopupBlocked && (
                    <div className="space-y-3 pt-3 border-t border-orange-200/50">
                      <p className="text-[11px] font-medium leading-relaxed opacity-80">
                        Your browser blocked the login pop-up. Try redirecting:
                      </p>
                      <button 
                        type="button" 
                        onClick={() => handleGoogleSignIn(true)}
                        className="w-full bg-[#2F3E2E] text-white py-3 rounded-2xl flex items-center justify-center gap-2 text-[11px] hover:bg-black transition-all shadow-md"
                      >
                        <MousePointer2 size={14} /> Use Full-Page Redirect
                      </button>
                    </div>
                  )}

                  {isDomainError && (
                    <div className="space-y-4 pt-3 border-t border-orange-200/50">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-orange-600 uppercase tracking-widest font-black">
                            <span className="w-4 h-4 rounded-full bg-orange-200 flex items-center justify-center text-[8px]">1</span>
                            Check Console
                         </div>
                         <p className="text-[11px] opacity-70">Go to Firebase Console &gt; Auth &gt; Settings &gt; Authorized Domains.</p>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-orange-600 uppercase tracking-widest font-black">
                            <span className="w-4 h-4 rounded-full bg-orange-200 flex items-center justify-center text-[8px]">2</span>
                            Copy This String
                         </div>
                         <div className="bg-white/80 p-3 rounded-xl flex items-center justify-between gap-2 border border-orange-200 shadow-inner">
                            <code className="text-[10px] font-mono break-all font-bold text-orange-900">{window.location.hostname}</code>
                            <button type="button" onClick={copyCurrentDomain} className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors text-orange-700">
                              <Copy size={14} />
                            </button>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] text-orange-600 uppercase tracking-widest font-black">
                            <span className="w-4 h-4 rounded-full bg-orange-200 flex items-center justify-center text-[8px]">3</span>
                            No "HTTPS"
                         </div>
                         <p className="text-[11px] opacity-70">Ensure there is no <span className="line-through">https://</span> or <span className="line-through">/</span> at the end.</p>
                      </div>

                      <a 
                        href="https://console.firebase.google.com/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-orange-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 text-[11px] hover:bg-orange-700 transition-all shadow-md"
                      >
                        Open Console <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
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
        
        <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center gap-4 opacity-50">
                <div className="h-px bg-gray-300 flex-1"/>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or social login</span>
                <div className="h-px bg-gray-300 flex-1"/>
            </div>
            
            <button
                onClick={() => handleGoogleSignIn(false)}
                disabled={loading}
                className="w-full bg-white border border-gray-100 py-5 rounded-[36px] text-[#2F3E2E] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.87 14.13c-.22-.67-.35-1.39-.35-2.13s.13-1.46.35-2.13V7.03H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.97l3.69-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.51z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </button>

            {onGuestLogin && (
                <button
                    onClick={onGuestLogin}
                    className="w-full bg-white/40 border border-gray-100/50 py-4 rounded-[36px] text-gray-500 font-bold hover:bg-white hover:text-[#2F3E2E] transition-all flex items-center justify-center gap-2 text-sm"
                >
                    <UserCircle size={18} />
                    Continue as Guest
                </button>
            )}
        </div>

        <div className="text-center pt-2 relative z-10">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setIsDomainError(false); setIsPopupBlocked(false); }}
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