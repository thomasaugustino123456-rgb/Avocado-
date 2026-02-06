
import React, { useState } from 'react';
import { LibraryItem, FoodAnalysis, Meal } from '../types';
import { 
  Trash2, Plus, ChefHat, BarChart3, Clock, CheckCircle2, 
  X, ChevronRight, Info, Flame, Target, Activity, Sparkles, Scale,
  Droplets, Footprints, MessageSquare
} from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { BarChart as RechartsBarChart, Bar as RechartsBar, XAxis as RechartsXAxis, ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip, Cell as RechartsCell, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, AreaChart as RechartsAreaChart, Area as RechartsArea } from 'recharts';

interface LibraryProps {
  items: LibraryItem[];
  onDelete: (id: string) => void;
  onAddToDaily: (meal: Meal) => void;
}

export const Library: React.FC<LibraryProps> = ({ items, onDelete, onAddToDaily }) => {
  const [filter, setFilter] = useState<'all' | 'food' | 'chart'>('all');
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);
  const [chartTab, setChartTab] = useState<'steps' | 'calories' | 'water' | 'weight'>('steps');

  // Robust case-insensitive filtering
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    const itemType = item.item_type?.toLowerCase();
    return itemType === filter.toLowerCase();
  });

  const handleClose = () => {
    setViewingItem(null);
    setChartTab('steps');
  };

  const renderFullView = () => {
    if (!viewingItem) return null;

    const isFood = viewingItem.item_type === 'food';
    const data = viewingItem.item_data;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-[#2F3E2E]/60 backdrop-blur-xl transition-all" onClick={handleClose} />
        
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[56px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md px-10 py-8 flex justify-between items-center border-b border-gray-50 z-10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isFood ? 'bg-[#F8FAF5] text-[#A0C55F]' : 'bg-blue-50 text-blue-400'}`}>
                {isFood ? <ChefHat size={24} /> : (data.content ? <MessageSquare size={24} /> : <BarChart3 size={24} />)}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">
                  {isFood ? 'Deep Food Insight' : (data.title || 'Snapshot Archive')}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Saved on {new Date(viewingItem.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-100 transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="p-10 space-y-10">
            {isFood ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {/* Food View Content (Already exists, omitted for brevity but remains same) */}
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="bg-[#F8FAF5] p-12 rounded-[56px] flex-shrink-0 mx-auto md:mx-0 shadow-inner">
                    <Mascot size={140} />
                  </div>
                  <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="space-y-3">
                      <h4 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E] leading-tight">
                        {data.foodName}
                      </h4>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 bg-[#F8FAF5] px-5 py-2.5 rounded-2xl border border-gray-50">
                          <Flame size={20} className="text-[#A0C55F]" />
                          <span className="text-[#A0C55F] font-bold text-xl">{data.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xl leading-relaxed font-medium">{data.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onAddToDaily({ id: Date.now().toString(), name: data.foodName, calories: data.calories, type: 'lunch', timestamp: new Date() });
                    handleClose();
                  }}
                  className="w-full bg-[#A0C55F] text-white py-7 rounded-[32px] font-bold text-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
                >
                  Add to My Today
                </button>
              </div>
            ) : data.content ? (
              /* AI Chat Insight View */
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm space-y-8">
                   <div className="flex items-center gap-3">
                      <Sparkles className="text-[#A0C55F]" size={20} />
                      <span className="text-xs font-black text-[#A0C55F] uppercase tracking-widest">Bito's Wisdom</span>
                   </div>
                   <p className="text-2xl text-[#2F3E2E] font-medium leading-relaxed italic">
                      "{data.content}"
                   </p>
                </div>
                <div className="bg-[#F8FAF5] p-10 rounded-[40px] text-center">
                   <Mascot size={120} mood="happy" className="mx-auto mb-4" />
                   <p className="text-gray-400 font-bold">This insight was captured from your personal chat with Avocado AI. 🥑✨</p>
                </div>
              </div>
            ) : (
              /* Stats Chart View */
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="bg-white p-10 md:p-12 rounded-[56px] shadow-sm border border-gray-100 space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h3 className="font-brand font-bold text-3xl text-[#2F3E2E]">Historical Performance</h3>
                      <p className="text-gray-400 font-medium text-lg">Detailed analysis of your past week.</p>
                    </div>
                    <div className="flex bg-[#F8FAF5] p-2 rounded-2xl border border-gray-50 flex-wrap justify-center">
                       {[
                         { k: 'steps', i: Footprints, c: 'text-[#A0C55F]' },
                         { k: 'calories', i: Flame, c: 'text-orange-400' },
                         { k: 'water', i: Droplets, c: 'text-blue-400' },
                         { k: 'weight', i: Scale, c: 'text-gray-400' },
                       ].map(t => (
                         <button 
                           key={t.k}
                           onClick={() => setChartTab(t.k as any)}
                           className={`p-3 rounded-xl transition-all ${chartTab === t.k ? 'bg-white shadow-md ' + t.c : 'text-gray-300'}`}
                         >
                           <t.i size={20} />
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="h-96 w-full overflow-hidden relative">
                    <RechartsResponsiveContainer width="100%" height="100%">
                      {chartTab === 'steps' || chartTab === 'calories' ? (
                        <RechartsBarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="libBarGradientSteps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A0C55F" stopOpacity={1} />
                              <stop offset="100%" stopColor="#DFF2C2" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                          <RechartsCartesianGrid vertical={false} strokeDasharray="8 8" stroke="#F1F5F9" />
                          <RechartsXAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#94A3B8', fontWeight: 700 }} dy={15} />
                          <RechartsYAxis hide />
                          <RechartsTooltip cursor={{ fill: '#F8FAF5', radius: 20 }} contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '24px' }} />
                          <RechartsBar dataKey={chartTab} radius={[20, 20, 20, 20]} barSize={60} fill="url(#libBarGradientSteps)" />
                        </RechartsBarChart>
                      ) : (
                        <RechartsAreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                          <RechartsCartesianGrid vertical={false} strokeDasharray="8 8" stroke="#F1F5F9" />
                          <RechartsXAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#94A3B8', fontWeight: 700 }} dy={15} />
                          <RechartsYAxis hide />
                          <RechartsTooltip contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '24px' }} />
                          <RechartsArea type="monotone" dataKey={chartTab} stroke={chartTab === 'water' ? '#60A5FA' : '#A0C55F'} fill={chartTab === 'water' ? '#E0F2FE' : '#F0F4E8'} strokeWidth={4} />
                        </RechartsAreaChart>
                      )}
                    </RechartsResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-10 bg-gray-50/50 mt-auto flex justify-center border-t border-gray-100">
             <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Bito Intelligence Library</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-10 animate-in fade-in duration-700">
      {renderFullView()}
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-5xl md:text-6xl font-brand font-bold text-[#2F3E2E] tracking-tight">My Library</h2>
          <p className="text-gray-400 font-medium text-xl">A sanctuary for your health discoveries 🥑</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[24px] shadow-sm border border-gray-100">
          {(['all', 'food', 'chart'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all capitalize ${
                filter === f ? 'bg-[#A0C55F] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-[56px] p-24 flex flex-col items-center text-center gap-8 border-2 border-dashed border-gray-100 animate-in zoom-in-95 duration-700">
          <div className="bg-[#F8FAF5] p-12 rounded-full">
            <Mascot size={180} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-[#2F3E2E]">The shelves are quiet...</h3>
            <p className="text-gray-400 max-w-sm text-lg font-medium leading-relaxed">
              Log some delicious meals or save your weekly progress charts to begin your collection!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-[420px] relative overflow-hidden"
            >
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl shadow-inner ${item.item_type === 'food' ? 'bg-[#F8FAF5] text-[#A0C55F]' : 'bg-blue-50 text-blue-400'}`}>
                    {item.item_type === 'food' ? <ChefHat size={28} /> : (item.item_data.content ? <MessageSquare size={28} /> : <BarChart3 size={28} />)}
                  </div>
                  <button onClick={() => onDelete(item.id)} className="p-3 text-gray-200 hover:text-orange-400 hover:bg-orange-50 rounded-2xl transition-all">
                    <Trash2 size={22} />
                  </button>
                </div>

                {item.item_type === 'food' ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-3xl font-brand font-bold text-[#2F3E2E] leading-tight group-hover:text-[#A0C55F] transition-colors">
                        {(item.item_data as FoodAnalysis).foodName}
                      </h4>
                      <p className="text-[#A0C55F] font-black text-xl">{(item.item_data as FoodAnalysis).calories} kcal</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-3xl font-brand font-bold text-[#2F3E2E] group-hover:text-blue-400 transition-colors">
                        {item.item_data.title || 'Weekly Snapshot'}
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3">
                        {item.item_data.content || 'A preserved record of your habit trends and daily dedication.'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-gray-50/50 w-fit px-4 py-2 rounded-xl">
                  <Clock size={16} />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-50 flex gap-4">
                {item.item_type === 'food' && (
                  <button 
                    onClick={() => onAddToDaily({ id: Date.now().toString(), name: (item.item_data as FoodAnalysis).foodName, calories: (item.item_data as FoodAnalysis).calories, type: 'lunch', timestamp: new Date() })}
                    className="flex-1 bg-[#A0C55F] text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Log
                  </button>
                )}
                <button 
                  onClick={() => setViewingItem(item)}
                  className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  View Full
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
