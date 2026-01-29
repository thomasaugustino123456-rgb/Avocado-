
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Upload, Loader2, CheckCircle2, AlertCircle, ChevronRight, Plus, RefreshCw, Bookmark, Check } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodAnalysis, MealType, Meal } from '../types';
import { Mascot } from '../components/Mascot';

interface FoodScannerProps {
  onCancel: () => void;
  onAddMeal: (meal: Meal) => void;
  onSaveToLibrary?: (analysis: FoodAnalysis) => void;
}

export const FoodScanner: React.FC<FoodScannerProps> = ({ onCancel, onAddMeal, onSaveToLibrary }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastFile, setLastFile] = useState<{base64: string, type: string} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImage(reader.result as string);
      setLastFile({ base64, type: file.type });
      startAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64: string, type: string) => {
    setError(null);
    setAnalysis(null);
    setIsSaved(false);
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeFoodImage(base64, type);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Oops! I couldn't scan that. Can you try another photo?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (onSaveToLibrary && analysis) {
      onSaveToLibrary(analysis);
      setIsSaved(true);
    }
  };

  const retryAnalysis = () => {
    if (lastFile) {
      startAnalysis(lastFile.base64, lastFile.type);
    }
  };

  const handleAddToMeal = () => {
    if (!analysis) return;
    onAddMeal({
      id: Date.now().toString(),
      name: analysis.foodName,
      calories: analysis.calories,
      type: 'lunch',
      timestamp: new Date(),
    });
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in slide-in-from-right duration-300">
      <header className="flex items-center gap-4">
        <button onClick={onCancel} className="bg-white p-3 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-brand font-bold text-[#2F3E2E]">Avocado Food Scanner</h2>
      </header>

      {!image && (
        <div className="flex flex-col items-center justify-center gap-8 py-12 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-200">
          <div className="bg-[#DFF2C2] p-8 rounded-full">
            <Mascot size={120} />
          </div>
          <div className="space-y-4 px-6">
            <h3 className="text-2xl font-bold text-[#2F3E2E]">Snap & Log</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Show me what you're eating and I'll help you see how it fits into your day!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full px-8">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-[#FFE66D] py-5 rounded-3xl flex items-center justify-center gap-3 font-bold text-[#2F3E2E] shadow-lg hover:bg-[#ffed8d] transition-all"
            >
              <Camera size={24} />
              Take Photo
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white border border-gray-100 py-5 rounded-3xl flex items-center justify-center gap-3 font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              <Upload size={24} />
              Upload Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
              capture="environment"
            />
          </div>
        </div>
      )}

      {image && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-xl border-4 border-white">
              <img src={image} alt="Food" className="w-full h-full object-cover" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="font-bold text-xl">Analyzing with AI...</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => { setImage(null); setAnalysis(null); setError(null); setLastFile(null); }}
              className="w-full bg-white text-gray-400 font-bold py-4 rounded-2xl border border-gray-50 hover:bg-gray-50"
            >
              Scan New Photo
            </button>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-4">
                  <AlertCircle className="text-orange-400 shrink-0" size={24} />
                  <p className="text-orange-800 font-medium">{error}</p>
                </div>
                <button 
                  onClick={retryAnalysis}
                  className="w-full bg-white text-orange-400 font-bold py-3 rounded-2xl border border-orange-100 flex items-center justify-center gap-2 hover:bg-orange-50"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
              </div>
            )}

            {analysis && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-brand font-bold text-[#2F3E2E]">{analysis.foodName}</h3>
                      <p className="text-[#A0C55F] font-bold text-lg uppercase tracking-wider">{analysis.calories} kcal</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={handleSave}
                        className={`p-3 rounded-2xl shadow-sm transition-all ${
                          isSaved ? 'bg-[#A0C55F] text-white' : 'bg-[#F8FAF5] text-[#A0C55F] hover:bg-[#DFF2C2]'
                        }`}
                      >
                        {isSaved ? <Check size={20} /> : <Bookmark size={20} />}
                      </button>
                      {analysis.isHealthy ? (
                        <div className="bg-[#EBF7DA] text-[#A0C55F] px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs">
                          <CheckCircle2 size={16} />
                          Healthy
                        </div>
                      ) : (
                        <div className="bg-orange-50 text-orange-400 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs">
                          <AlertCircle size={16} />
                          Balance
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed">{analysis.description}</p>
                  
                  <div className="bg-[#F8FAF5] p-6 rounded-3xl space-y-2">
                    <h4 className="font-bold text-sm uppercase text-gray-400">Nutritional Highlight</h4>
                    <p className="text-[#2F3E2E] font-medium">{analysis.nutritionSummary}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToMeal}
                  className="w-full bg-[#A0C55F] text-white py-6 rounded-[32px] font-bold text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  <Plus size={32} />
                  Add to My Meals
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
