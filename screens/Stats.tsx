
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell, YAxis, 
  CartesianGrid, AreaChart, Area, PieChart as RechartsPie, Pie, 
} from 'recharts';
import { 
  Trophy, TrendingUp, Zap, Calendar, Target, Activity, 
  Bookmark, Check, Sparkles, Flame, Droplets, Footprints,
  Info, Award, BrainCircuit, ChevronRight, Scale, Loader2
} from 'lucide-react';
import { Mascot } from '../components/Mascot';

interface StatsProps {
  history?: any[];
  onSaveChart?: (data: any) => Promise<void>;
}

export const Stats: React.FC<StatsProps> = ({ history = [], onSaveChart }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'trends'>('activity');
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowInsight(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    if (onSaveChart && !isSaving && !isSaved) {
      setIsSaving(true);
      try {
        await onSaveChart(displayData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        console.error("Save failed", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const displayData = history && history.length > 0 ? history.map(item => ({
    day: new Date(item.date).toLocaleDateString([], { weekday: 'short' }),
    steps: item.steps || 0,
    calories: item.calories || 0,
    weight: item.weight || 70, 
    water: item.waterGlasses || 0,
  })) : [
    { day: 'Mon', steps: 6500, calories: 1850, weight: 72.4, water: 6 },
    { day: 'Tue', steps: 8200, calories: 2100, weight: 72.2, water: 8 },
    { day: 'Wed', steps: 5900, calories: 1600, weight: 72.1, water: 5 },
    { day: 'Thu', steps: 9100, calories: 2300, weight: 71.9, water: 9 },
    { day: 'Fri', steps: 7400, calories: 1950, weight: 71.8, water: 7 },
    { day: 'Sat', steps: 4200, calories: 2400, weight: 72.0, water: 4 },
    { day: 'Sun', steps: 6800, calories: 1800, weight: 71.7, water: 8 },
  ];

  const healthScore = 85;

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 relative pb-32">
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#A0C55F]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-64 h-64 bg-[#FFE66D]/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#A0C55F] font-black uppercase tracking-[0.2em] text-xs">
            <Activity size={14} className="animate-pulse" />
            Performance Analytics
          </div>
          <h2 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E] tracking-tight">Your Journey</h2>
          <p className="text-gray-400 font-medium text-lg">Visualizing your path to a healthier you 🥑</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-3 px-6 py-4 rounded-3xl shadow-sm border transition-all active:scale-95 ${
              isSaved ? 'bg-[#A0C55F] text-white border-[#A0C55F]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : (isSaved ? <Check size={20} /> : <Bookmark size={20} />)}
            <span className="font-bold text-sm">
              {isSaving ? 'Archiving...' : (isSaved ? 'Saved to Library!' : 'Save Snapshot')}
            </span>
          </button>
          <div className="hidden sm:flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-[#F8FAF5] p-2 rounded-xl">
              <Calendar size={20} className="text-[#A0C55F]" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tracking Period</p>
              <span className="font-bold text-sm text-[#2F3E2E]">Current Week</span>
            </div>
          </div>
        </div>
      </header>

      <div className={`transition-all duration-1000 transform ${showInsight ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-[#2F3E2E] rounded-[48px] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A0C55F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white/10 p-6 rounded-[40px] backdrop-blur-md">
              <Mascot size={120} mood="happy" />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <BrainCircuit size={18} className="text-[#A0C55F]" />
                <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.3em]">Bito Insights</span>
              </div>
              <h3 className="text-3xl font-brand font-bold text-white leading-tight">
                "You're smashing your hydration goals! <span className="text-[#A0C55F]">Keep glowing.</span>"
              </h3>
              <p className="text-gray-400 text-lg font-medium">
                Your consistency is up <span className="text-white font-bold">12%</span> from last week. Thursdays seem to be your high-energy day! ⚡
              </p>
            </div>
            <div className="bg-white/5 rounded-[40px] p-8 text-center border border-white/10">
              <div className="text-5xl font-brand font-bold text-[#A0C55F] mb-1">{healthScore}</div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Health Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-brand font-bold text-2xl text-[#2F3E2E]">Activity Distribution</h3>
                <p className="text-sm font-medium text-gray-400">Your step journey over the last 7 days</p>
              </div>
              <div className="flex bg-[#F8FAF5] p-1.5 rounded-2xl border border-gray-50">
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'activity' ? 'bg-white text-[#2F3E2E] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Steps
                </button>
                <button 
                  onClick={() => setActiveTab('trends')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'trends' ? 'bg-white text-[#2F3E2E] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Calories
                </button>
              </div>
            </div>
            
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={activeTab === 'activity' ? "#A0C55F" : "#FFE66D"} stopOpacity={1} />
                      <stop offset="100%" stopColor={activeTab === 'activity' ? "#DFF2C2" : "#FFF7D6"} stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 700 }} 
                    dy={15} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#CBD5E1' }} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAF5', radius: 16 }} 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
                      padding: '20px',
                      fontFamily: 'Nunito, sans-serif'
                    }}
                    itemStyle={{ fontWeight: 'bold', color: '#2F3E2E' }}
                  />
                  <Bar 
                    dataKey={activeTab === 'activity' ? "steps" : "calories"} 
                    radius={[16, 16, 16, 16]} 
                    barSize={40}
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {displayData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill="url(#barGradient)" 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-[#E9F3FC] p-4 rounded-[28px] text-blue-500">
                  <Droplets size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Weekly Avg</p>
                  <h5 className="text-xl font-bold">6.7 glasses</h5>
                </div>
              </div>
              <div className="h-32 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayData}>
                    <Area type="monotone" dataKey="water" stroke="#60A5FA" fill="#E0F2FE" strokeWidth={3} animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm font-bold text-gray-400 mt-4">Consistency: <span className="text-[#A0C55F]">Great</span></p>
            </div>

            <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-[#F8FAF5] p-4 rounded-[28px] text-[#A0C55F]">
                  <Scale size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Weight Log</p>
                  <h5 className="text-xl font-bold">71.7 kg</h5>
                </div>
              </div>
              <div className="h-32 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayData}>
                    <Area type="monotone" dataKey="weight" stroke="#A0C55F" fill="#F0F4E8" strokeWidth={3} animationDuration={2500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm font-bold text-gray-400 mt-4">Trend: <span className="text-[#A0C55F]">Steady</span></p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#FFE66D] p-10 rounded-[56px] shadow-lg shadow-yellow-200/20 space-y-6 group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-center">
              <div className="bg-white/40 p-4 rounded-[24px]">
                <Award size={32} className="text-[#2F3E2E]" />
              </div>
              <div className="bg-white/40 px-4 py-1.5 rounded-full text-[10px] font-black text-[#2F3E2E] uppercase tracking-widest">
                Milestone
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-4xl font-brand font-bold text-[#2F3E2E]">50k Steps</h4>
              <p className="text-sm font-bold text-[#2F3E2E]/60 uppercase tracking-widest">Weekly Total Reached!</p>
            </div>
            <div className="pt-4 border-t border-black/5">
               <button className="flex items-center gap-2 font-black text-xs text-[#2F3E2E] uppercase group-hover:gap-4 transition-all">
                 View All Badges <ChevronRight size={14} />
               </button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-8">
            <h4 className="text-xl font-brand font-bold text-[#2F3E2E]">Habit Heatmap</h4>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-lg transition-all hover:scale-110 ${
                    i % 4 === 0 ? 'bg-[#A0C55F]' : 
                    i % 3 === 0 ? 'bg-[#DFF2C2]' : 
                    'bg-[#F8FAF5]'
                  }`}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">
              <span>Less</span>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-[#F8FAF5] rounded-sm" />
                <div className="w-3 h-3 bg-[#DFF2C2] rounded-sm" />
                <div className="w-3 h-3 bg-[#A0C55F] rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </div>

          <div className="bg-[#EBF7DA] p-10 rounded-[56px] text-center space-y-4 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 text-[#A0C55F]/20 group-hover:text-[#A0C55F]/40 transition-colors">
              <Sparkles size={48} />
            </div>
            <Mascot size={80} mood="little-happy" className="mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-brand font-bold text-[#2F3E2E]">Stay Shiny!</h3>
              <p className="text-[#2F3E2E]/60 text-sm font-medium leading-relaxed px-4 italic">
                "Your Thursday activity was legendary. Can we beat it next week? 🥑"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
