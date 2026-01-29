
import React, { useState } from 'react';
import { LibraryItem, FoodAnalysis, Meal } from '../types';
import { 
  Trash2, Plus, ChefHat, BarChart3, Clock, CheckCircle2, 
  X, ChevronRight, Info, Flame, Target, Activity, Sparkles
} from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { BarChart as RechartsBarChart, Bar as RechartsBar, XAxis as RechartsXAxis, ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip, Cell as RechartsCell, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid } from 'recharts';

interface LibraryProps {
  items: LibraryItem[];
  onDelete: (id: string) => void;
  onAddToDaily: (meal: Meal) => void;
}

export const Library: React.FC<LibraryProps> = ({ items, onDelete, onAddToDaily }) => {
  const [filter, setFilter] = useState<'all' | 'food' | 'chart'>('all');
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);

  const filteredItems = items.filter(item => filter === 'all' || item.item_type === filter);

  const handleClose = () => setViewingItem(null);

  const renderFullView = () => {
    if (!viewingItem) return null;

    const isFood = viewingItem.item_type === 'food';
    const data = viewingItem.item_data;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-[#2F3E2E]/40 backdrop-blur-md" onClick={handleClose} />
        
        <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[48px] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-gray-50 z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isFood ? 'bg-[#F8FAF5] text-[#A0C55F]' : 'bg-blue-50 text-blue-400'}`}>
                {isFood ? <ChefHat size={20} /> : <BarChart3 size={20} />}
              </div>
              <h3 className="text-xl font-brand font-bold text-[#2F3E2E]">
                {isFood ? 'Food Analysis' : 'Chart Snapshot'}
              </h3>
            </div>
            <button onClick={handleClose} className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {isFood ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-[#F8FAF5] p-8 rounded-[40px] flex-shrink-0 mx-auto md:mx-0">
                    <Mascot size={120} />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="space-y-1">
                      <h4 className="text-3xl font-brand font-bold text-[#2F3E2E]">{data.foodName}</h4>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="text-[#A0C55F] font-bold text-lg">{data.calories} kcal</span>
                        <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs ${
                          data.isHealthy ? 'bg-[#EBF7DA] text-[#A0C55F]' : 'bg-orange-50 text-orange-400'
                        }`}>
                          {data.isHealthy ? <CheckCircle2 size={14} /> : <Info size={14} />}
                          {data.isHealthy ? 'Healthy Choice' : 'Balanced Choice'}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-lg leading-relaxed">{data.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] space-y-3">
                    <div className="flex items-center gap-2 text-[#A0C55F]">
                      <Target size={18} />
                      <span className="font-bold text-sm uppercase tracking-widest">Nutrition Insight</span>
                    </div>
                    <p className="text-[#2F3E2E] font-medium leading-relaxed">{data.nutritionSummary}</p>
                  </div>
                  
                  {data.recommendation && (
                    <div className="bg-[#FFE66D]/10 p-6 rounded-[32px] space-y-3">
                      <div className="flex items-center gap-2 text-yellow-600">
                        {/* Fix: Added Sparkles icon from lucide-react */}
                        <Sparkles size={18} />
                        <span className="font-bold text-sm uppercase tracking-widest">Avocado's Tip</span>
                      </div>
                      <p className="text-[#2F3E2E] font-medium leading-relaxed">{data.recommendation}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    onAddToDaily({
                      id: Date.now().toString(),
                      name: data.foodName,
                      calories: data.calories,
                      type: 'lunch',
                      timestamp: new Date()
                    });
                    handleClose();
                  }}
                  className="w-full bg-[#A0C55F] text-white py-6 rounded-[32px] font-bold text-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  <Plus size={32} />
                  Add to Today's Log
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-8 md:p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-brand font-bold text-2xl text-[#2F3E2E]">Snapshot: Activity Distribution</h3>
                      <p className="text-sm font-medium text-gray-400">Archived on {new Date(viewingItem.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="h-80 w-full overflow-hidden relative">
                    <RechartsResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <RechartsBarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="libBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A0C55F" stopOpacity={1} />
                            <stop offset="100%" stopColor="#DFF2C2" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <RechartsCartesianGrid vertical={false} strokeDasharray="8 8" stroke="#F1F5F9" />
                        <RechartsXAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 13, fill: '#94A3B8', fontWeight: 700 }} 
                          dy={15} 
                        />
                        <RechartsYAxis hide domain={[0, 'auto']} />
                        <RechartsTooltip 
                          cursor={{ fill: '#F8FAF5', radius: 16 }} 
                          contentStyle={{ 
                            borderRadius: '24px', 
                            border: 'none', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
                            padding: '20px'
                          }}
                        />
                        <RechartsBar 
                          dataKey="steps" 
                          radius={[16, 16, 16, 16]} 
                          barSize={45}
                          fill="url(#libBarGradient)"
                        />
                      </RechartsBarChart>
                    </RechartsResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-[#EBF7DA] p-8 rounded-[40px] text-center space-y-2">
                  <Activity size={32} className="mx-auto text-[#A0C55F] mb-2" />
                  <h4 className="font-bold text-[#2F3E2E]">Performance Insight</h4>
                  <p className="text-sm text-[#2F3E2E]/60 max-w-md mx-auto">This snapshot shows your daily step distribution. Use these peaks to identify when you're most active and try to replicate those patterns!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in fade-in duration-500">
      {renderFullView()}
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E]">My Library</h2>
          <p className="text-gray-400 font-medium text-lg">Your collection of saved food and insights 🥑</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-50">
          {(['all', 'food', 'chart'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${
                filter === f ? 'bg-[#A0C55F] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-[48px] p-20 flex flex-col items-center text-center gap-6 border-2 border-dashed border-gray-100">
          <Mascot size={160} />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#2F3E2E]">Your library is empty!</h3>
            <p className="text-gray-400 max-w-sm">Save your food scans or performance charts to see them here for later reference.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-xl transition-all h-full relative overflow-hidden">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${item.item_type === 'food' ? 'bg-[#F8FAF5] text-[#A0C55F]' : 'bg-blue-50 text-blue-400'}`}>
                    {item.item_type === 'food' ? <ChefHat size={24} /> : <BarChart3 size={24} />}
                  </div>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2.5 text-gray-300 hover:text-orange-400 hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {item.item_type === 'food' ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-2xl font-brand font-bold text-[#2F3E2E] leading-tight">{(item.item_data as FoodAnalysis).foodName}</h4>
                      <p className="text-[#A0C55F] font-bold">{(item.item_data as FoodAnalysis).calories} kcal</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-2xl">
                      <Clock size={16} />
                      Saved {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-2xl font-brand font-bold text-[#2F3E2E]">Chart Insight</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Weekly performance snapshot saved to track your long-term consistency.</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-2xl w-fit">
                      <Clock size={16} />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                {item.item_type === 'food' && (
                  <button 
                    onClick={() => onAddToDaily({
                      id: Date.now().toString(),
                      name: (item.item_data as FoodAnalysis).foodName,
                      calories: (item.item_data as FoodAnalysis).calories,
                      type: 'lunch',
                      timestamp: new Date()
                    })}
                    className="flex-1 bg-[#A0C55F] text-white py-3 rounded-2xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                )}
                <button 
                  onClick={() => setViewingItem(item)}
                  className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  View Full
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
