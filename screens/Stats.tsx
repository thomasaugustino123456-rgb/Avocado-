
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell, YAxis, 
  CartesianGrid, AreaChart, Area 
} from 'recharts';
import { Trophy, TrendingUp, Zap, Calendar, Target, Activity, Bookmark, Check } from 'lucide-react';

interface StatsProps {
  history?: any[];
  onSaveChart?: (data: any) => void;
}

export const Stats: React.FC<StatsProps> = ({ history = [], onSaveChart }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSaveChart) {
      onSaveChart(displayData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const displayData = history.length > 0 ? history.map(item => ({
    day: new Date(item.date).toLocaleDateString([], { weekday: 'short' }),
    steps: item.steps || 0,
    calories: item.calories || 0,
    weight: item.weight || 70, 
  })) : [
    { day: 'Mon', steps: 0, calories: 0, weight: 70 },
    { day: 'Tue', steps: 0, calories: 0, weight: 70 },
    { day: 'Wed', steps: 0, calories: 0, weight: 70 },
    { day: 'Thu', steps: 0, calories: 0, weight: 70 },
    { day: 'Fri', steps: 0, calories: 0, weight: 70 },
    { day: 'Sat', steps: 0, calories: 0, weight: 70 },
    { day: 'Sun', steps: 0, calories: 0, weight: 70 },
  ];

  const totalSteps = history.reduce((acc, curr) => acc + (curr.steps || 0), 0);
  const avgSteps = history.length > 0 ? Math.round(totalSteps / history.length) : 0;

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#A0C55F] font-black uppercase tracking-[0.2em] text-xs">
            <Activity size={14} />
            Performance Analytics
          </div>
          <h2 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E] tracking-tight">Your Journey</h2>
          <p className="text-gray-400 font-medium text-lg">Visualizing your path to a healthier you 🥑</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            className={`flex items-center gap-3 px-6 py-4 rounded-3xl shadow-sm border transition-all ${
              isSaved ? 'bg-[#A0C55F] text-white border-[#A0C55F]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            {isSaved ? <Check size={20} /> : <Bookmark size={20} />}
            <span className="font-bold text-sm">{isSaved ? 'Saved!' : 'Save Chart'}</span>
          </button>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-[#F8FAF5] p-2 rounded-xl">
              <Calendar size={20} className="text-[#A0C55F]" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tracking Period</p>
              <span className="font-bold text-sm text-[#2F3E2E]">Last 7 Days</span>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards with Hover Animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-[#FFE66D] p-8 rounded-[40px] shadow-lg shadow-yellow-200/20 flex flex-col justify-between h-56 transition-all hover:-translate-y-2">
          <div className="flex justify-between items-start">
            <div className="bg-white/40 p-3 rounded-2xl">
              <Trophy size={32} className="text-[#2F3E2E]" />
            </div>
            <span className="text-xs font-black bg-white/40 px-3 py-1.5 rounded-full text-[#2F3E2E] uppercase">Elite</span>
          </div>
          <div>
            <h4 className="text-5xl font-brand font-bold text-[#2F3E2E]">
              {history.length > 0 ? '75%' : '0%'}
            </h4>
            <p className="text-sm font-bold text-[#2F3E2E]/60 uppercase tracking-widest mt-2">Weekly Goal Completion</p>
          </div>
        </div>

        <div className="group bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between h-56 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-[#A0C55F]/5">
          <div className="flex justify-between items-start">
            <div className="bg-[#F8FAF5] p-3 rounded-2xl group-hover:bg-[#EBF7DA] transition-colors">
              <Zap size={32} className="text-orange-400" />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-100" />)}
            </div>
          </div>
          <div>
            <h4 className="text-5xl font-brand font-bold text-[#2F3E2E]">
              {avgSteps.toLocaleString()}
            </h4>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Avg. Steps / Day</p>
          </div>
        </div>

        <div className="group bg-[#EBF7DA] p-8 rounded-[40px] shadow-sm flex flex-col justify-between h-56 transition-all hover:-translate-y-2">
          <div className="flex justify-between items-start">
            <div className="bg-white/60 p-3 rounded-2xl">
              <TrendingUp size={32} className="text-[#A0C55F]" />
            </div>
            <Target size={20} className="text-[#A0C55F] opacity-30" />
          </div>
          <div>
            <h4 className="text-5xl font-brand font-bold text-[#2F3E2E]">Stable</h4>
            <p className="text-sm font-bold text-[#2F3E2E]/60 uppercase tracking-widest mt-2">Weight Trend</p>
          </div>
        </div>
      </div>

      {/* Primary Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[48px] shadow-sm border border-gray-50 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-brand font-bold text-2xl text-[#2F3E2E]">Activity Distribution</h3>
              <p className="text-sm font-medium text-gray-400">Comparing your daily step counts</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A0C55F]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F0F4E8]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rest</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={displayData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A0C55F" stopOpacity={1} />
                    <stop offset="100%" stopColor="#DFF2C2" stopOpacity={0.8} />
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
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip 
                  cursor={{ fill: '#F8FAF5', radius: 16 }} 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
                    padding: '20px',
                    fontFamily: 'Fredoka, sans-serif'
                  }}
                  itemStyle={{ fontWeight: 'bold', color: '#2F3E2E' }}
                />
                <Bar 
                  dataKey="steps" 
                  radius={[16, 16, 16, 16]} 
                  barSize={45}
                  animationDuration={1500}
                >
                  {displayData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.steps > 0 ? 'url(#barGradient)' : '#F0F4E8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="flex-1 bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 flex flex-col justify-between overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <h3 className="font-brand font-bold text-xl text-[#2F3E2E]">Weight & Energy</h3>
              <p className="text-xs font-bold text-[#A0C55F] uppercase tracking-widest">Health Balance</p>
            </div>
            
            <div className="h-32 w-full mt-4 -mx-8 relative">
              <ResponsiveContainer width="110%" height="100%">
                <AreaChart data={displayData}>
                  <defs>
                    <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A0C55F" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#A0C55F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#A0C55F" 
                    strokeWidth={4} 
                    fill="url(#areaG)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center relative z-10">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase">Avg weight</p>
                <p className="text-lg font-bold">71.5 kg</p>
              </div>
              <div className="bg-[#EBF7DA] px-3 py-1 rounded-lg text-[#A0C55F] text-[10px] font-black uppercase tracking-tighter">
                -0.4% This Month
              </div>
            </div>
          </div>

          <div className="bg-[#FFE66D]/20 p-8 rounded-[40px] text-center flex flex-col items-center justify-center space-y-4 relative overflow-hidden group">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-200/20 rounded-full blur-3xl transition-transform group-hover:scale-150" />
            <Zap size={32} className="text-[#A0C55F] animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-xl font-brand font-bold text-[#2F3E2E]">Keep Glowing!</h3>
              <p className="text-[#2F3E2E]/60 text-sm font-medium leading-relaxed px-4">
                "Small steps today lead to big changes tomorrow."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
