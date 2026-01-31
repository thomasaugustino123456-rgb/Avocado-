
import React, { useEffect, useRef, useState } from 'react';
import { Mascot, MascotMood } from '../components/Mascot';
import { audioService } from '../services/audioService';
import { 
  Sparkles, Footprints, Droplets, Camera, ArrowRight, Shield, Heart, 
  Zap, Star, Smile, CheckCircle, ChevronRight, MessageCircle, 
  BarChart3, Brain, Coffee, Award, Search, Cloud, Target
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mascotMood, setMascotMood] = useState<MascotMood>('happy');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleMascotInteraction = () => {
    const moods: MascotMood[] = ['happy', 'little-happy', 'petting', 'success'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setMascotMood(randomMood);
    audioService.playIce();
    setTimeout(() => setMascotMood('idle'), 3000);
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#F0F4E8] text-[#2F3E2E] overflow-x-hidden selection:bg-[#A0C55F] selection:text-white">
      {/* Dynamic Background decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#A0C55F]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#FFE66D]/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden pt-20">
        <div className="relative z-10 max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex justify-center mb-4">
             <div 
              onClick={handleMascotInteraction}
              className="p-10 bg-white/60 backdrop-blur-3xl rounded-[72px] shadow-2xl border border-white/80 hover:scale-105 hover:-rotate-1 transition-all duration-700 cursor-pointer group relative active:scale-95"
             >
                <div className="absolute -top-6 -right-6 bg-[#A0C55F] text-white p-4 rounded-full shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500">
                  <Heart size={24} fill="currentColor" />
                </div>
                <Mascot size={260} mood={mascotMood} />
                <div className="mt-8 bg-[#A0C55F]/10 px-6 py-2 rounded-full text-[12px] font-black text-[#A0C55F] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.3em]">
                  Tap to interact! 🥑✨
                </div>
             </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-3 text-[#A0C55F] font-black uppercase tracking-[0.6em] text-[10px] md:text-sm animate-in fade-in duration-1000 delay-300">
              <Sparkles size={18} className="animate-pulse" /> Meet Bito, Your Habit Companion
            </div>
            <h1 className="text-7xl md:text-[10rem] font-brand font-black text-[#2F3E2E] leading-[0.85] tracking-tighter drop-shadow-sm">
              Eat. <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#A0C55F] to-[#7d9e48] animate-gradient-flow">Glow.</span> <br />
              Grow.
            </h1>
            <p className="text-xl md:text-3xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed opacity-80">
              Most health apps focus on numbers. We focus on <span className="text-[#2F3E2E] font-bold">friendship</span>. Bito is a living avocado that reacts to your choices in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <button 
              onClick={onGetStarted}
              className="group relative px-14 py-8 bg-[#A0C55F] text-white rounded-[48px] font-black text-2xl shadow-2xl shadow-[#A0C55F]/40 hover:bg-[#8eb052] hover:-translate-y-2 transition-all active:scale-95 flex items-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span>Adopt Bito Now</span>
              <ArrowRight className="group-hover:translate-x-3 transition-transform duration-500" size={32} />
            </button>
            <a href="#journey" className="px-14 py-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[48px] font-extrabold text-xl text-[#2F3E2E]/70 hover:bg-white hover:text-[#2F3E2E] transition-all shadow-sm flex items-center gap-2">
              Learn More <ChevronRight size={20} />
            </a>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Footprints className="absolute top-[15%] left-[10%] text-[#A0C55F] animate-float-slow" size={80} />
          <Droplets className="absolute top-[70%] right-[12%] text-blue-400 animate-float-slow delay-700" size={80} />
          <Star className="absolute top-[40%] right-[25%] text-yellow-400 animate-spin-slow" size={40} />
          <Sparkles className="absolute bottom-[20%] left-[15%] text-[#A0C55F] animate-pulse" size={60} />
        </div>
      </section>

      {/* Feature Section 1: Philosophy */}
      <section id="journey" className="py-40 px-6 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center reveal">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#F0F4E8] text-[#A0C55F] rounded-full text-xs font-black uppercase tracking-widest">
                <Brain size={18} /> Mindful Habits
              </div>
              <h2 className="text-6xl md:text-8xl font-brand font-black text-[#2F3E2E] leading-tight tracking-tight">
                No Stress. <br /> Just <span className="text-[#A0C55F]">Daily Bliss.</span>
              </h2>
              <div className="space-y-6">
                <p className="text-2xl text-gray-500 font-medium leading-relaxed">
                  We believe health tracking should feel like playing a game, not doing chores. Bito doesn't send "Late!" notifications—he just waits patiently with a smile.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Zero guilt tracking",
                    "Positive reinforcement",
                    "Visual mood feedback",
                    "Personalized pace"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg font-bold text-gray-700 bg-gray-50 p-4 rounded-2xl">
                      <div className="bg-[#A0C55F] p-1.5 rounded-lg text-white"><CheckCircle size={16} /></div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative">
               <div className="absolute -inset-10 bg-[#FFE66D]/10 rounded-full blur-[100px] animate-pulse" />
               <div className="bg-[#F8FAF5] p-20 rounded-[80px] border-4 border-white shadow-2xl relative z-10 hover:rotate-2 transition-transform duration-700">
                  <Mascot size={300} mood="little-happy" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-40 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-8 mb-32 reveal">
          <h2 className="text-6xl md:text-8xl font-brand font-black text-[#2F3E2E]">Everything you need.</h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto font-medium">Bito combines high-tech AI with a soft-touch interface to keep you moving forward.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              icon: Camera,
              title: "AI Vision Scanner",
              desc: "Snap a photo of your meal and watch Bito identify the food, estimate calories, and give you supportive nutritional advice instantly.",
              color: "bg-orange-50 text-orange-400"
            },
            {
              icon: MessageCircle,
              title: "Bito AI Coach",
              desc: "Feeling demotivated? Chat with Bito! He uses Gemini Intelligence to provide tailored health tips, encouragement, and a few avocado puns.",
              color: "bg-blue-50 text-blue-500"
            },
            {
              icon: Droplets,
              title: "Smart Hydration",
              desc: "Log your water with a satisfying 'pop' sound. Bito's color deepens as you reach your hydration goal, keeping you refreshed.",
              color: "bg-[#EBF7DA] text-[#A0C55F]"
            },
            {
              icon: Footprints,
              title: "Step Milestones",
              desc: "Walk your way to a golden trophy. Bito tracks your steps and rewards consistency with badges and a glowing mascot mood.",
              color: "bg-purple-50 text-purple-400"
            },
            {
              icon: BarChart3,
              title: "Deep Analytics",
              desc: "Visualize your progress with beautiful, high-contrast charts. Save snapshots of your success directly to your personal library.",
              color: "bg-yellow-50 text-yellow-600"
            },
            {
              icon: Cloud,
              title: "Cloud Sync",
              desc: "Your data is safe with us. Sync your habits across devices with high-security cloud storage, or use Guest Mode for complete privacy.",
              color: "bg-gray-50 text-gray-500"
            }
          ].map((item, i) => (
            <div key={i} className="reveal bg-white p-12 rounded-[56px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 border border-gray-50 group flex flex-col gap-8">
              <div className={`w-20 h-20 ${item.color} rounded-[32px] flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform`}>
                <item.icon size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-brand font-bold text-[#2F3E2E]">{item.title}</h3>
                <p className="text-xl text-gray-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* "How it Works" Vertical Timeline */}
      <section className="py-40 px-6 bg-[#2F3E2E] text-white overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-32">
          <div className="text-center space-y-8 reveal">
             <h2 className="text-6xl md:text-8xl font-brand font-black tracking-tight">How Bito Works.</h2>
             <p className="text-2xl text-gray-400 font-medium">Simple steps to a new you.</p>
          </div>

          <div className="space-y-40">
            {[
              {
                step: "01",
                title: "Choose Your Path",
                desc: "Tell Bito your goals—whether it's drinking more water, hitting 10k steps, or eating cleaner. Bito tailors his personality to match your pace.",
                icon: Target
              },
              {
                step: "02",
                title: "Track with Ease",
                desc: "Use the smart scanner for food or simple buttons for water and steps. Every log nourishes Bito and keeps his mood high.",
                icon: Zap
              },
              {
                step: "03",
                title: "Grow Together",
                desc: "As you stay consistent, Bito unlocks new badges and rewards. Your trophy room fills up, and your health score reaches new heights.",
                icon: Award
              }
            ].map((item, i) => (
              <div key={i} className="reveal grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                 <div className="md:col-span-2 text-9xl font-brand font-black text-white/10">{item.step}</div>
                 <div className="md:col-span-10 space-y-6">
                    <div className="flex items-center gap-4 text-[#A0C55F] font-black uppercase tracking-[0.3em] text-sm">
                       <item.icon size={24} /> Step {item.step}
                    </div>
                    <h3 className="text-5xl md:text-7xl font-brand font-bold">{item.title}</h3>
                    <p className="text-2xl text-gray-400 leading-relaxed max-w-2xl">{item.desc}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section 2: Why Avocados? */}
      <section className="py-40 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         <div className="reveal order-2 lg:order-1 flex justify-center">
            <div className="relative p-10 bg-white rounded-[72px] shadow-2xl border border-gray-100 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#A0C55F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <Mascot size={320} mood="success" />
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#A0C55F] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest scale-0 group-hover:scale-100 transition-transform">
                 Feeling Amazing! 🥑
               </div>
            </div>
         </div>
         <div className="reveal order-1 lg:order-2 space-y-12">
            <h2 className="text-6xl md:text-8xl font-brand font-black text-[#2F3E2E] leading-tight">
              Small habits. <br />
              <span className="text-[#A0C55F]">Big hearts.</span>
            </h2>
            <div className="space-y-8 text-2xl text-gray-500 font-medium leading-relaxed">
              <p>
                We chose Bito as an avocado because health is like a fruit—it needs time to ripen, the right environment to grow, and a little love every day.
              </p>
              <p>
                Bito is reactive. If you log a healthy meal, he glows. If you hit your steps, he does a little jump. This loop creates a <span className="text-[#2F3E2E] font-bold">dopamine-rich connection</span> to healthy habits that lasts a lifetime.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="p-4 bg-white shadow-sm border border-gray-50 rounded-3xl flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-[#A0C55F]" />
                 <span className="font-bold">Kind AI</span>
              </div>
              <div className="p-4 bg-white shadow-sm border border-gray-50 rounded-3xl flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-[#FFE66D]" />
                 <span className="font-bold">Real Rewards</span>
              </div>
            </div>
         </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-white py-48 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto space-y-16 reveal">
          <div className="space-y-8">
            <h2 className="text-7xl md:text-[10rem] font-brand font-black text-[#2F3E2E] leading-[0.85] tracking-tighter">
              Ready to <br /> <span className="text-[#A0C55F]">blossom?</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed">
              Bito is looking for his next best friend. Your journey to wellness starts with a single tap.
            </p>
          </div>
          <div className="pt-8 flex flex-col items-center gap-8">
            <button 
              onClick={onGetStarted}
              className="group relative px-20 py-10 bg-[#A0C55F] text-white rounded-[64px] font-black text-4xl shadow-2xl shadow-[#A0C55F]/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-6 overflow-hidden"
            >
              Start My Journey
              <ArrowRight size={48} className="group-hover:translate-x-4 transition-transform duration-500" />
            </button>
            <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-sm">
              Free to use • Ad-free • Habit-first
            </p>
          </div>

          <div className="pt-32 flex flex-col md:flex-row items-center justify-between gap-10 border-t border-gray-100">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#A0C55F] rounded-2xl flex items-center justify-center font-brand font-black text-white text-2xl shadow-lg">B</div>
                <span className="text-xl font-brand font-bold text-[#2F3E2E]">Bito Health</span>
             </div>
             <div className="flex gap-8 text-gray-400 font-bold text-sm">
                <a href="#" className="hover:text-[#A0C55F] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[#A0C55F] transition-colors">Terms</a>
                <a href="#" className="hover:text-[#A0C55F] transition-colors">Support</a>
             </div>
             <div className="flex gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-[#A0C55F] cursor-pointer"><Smile size={20} /></div>
                <div className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-[#A0C55F] cursor-pointer"><Heart size={20} /></div>
             </div>
          </div>
        </div>
      </footer>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(100px);
          transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(5deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes gradient-flow {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
          100% { filter: hue-rotate(0deg); }
        }
        .animate-gradient-flow {
          animation: gradient-flow 6s infinite linear;
        }
      `}</style>
    </div>
  );
};
