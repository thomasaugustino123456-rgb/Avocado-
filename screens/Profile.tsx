
import React, { useState, useRef } from 'react';
import { User, Screen } from '../types';
import { persistenceService } from '../services/persistenceService';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { 
  LogOut, User as UserIcon, Edit2, Check, X, ChevronRight, 
  Bell, Shield, HelpCircle, Camera, Trash2, 
  Target, Footprints, Droplets, Flame, Loader2, Sparkles
} from 'lucide-react';
import { SettingsDetails } from './SettingsDetails';

interface ProfileProps {
  user: User;
  isGuest: boolean;
  setUser: (u: User) => void;
  onNavigate: (screen: Screen) => void;
  onExitGuest: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, isGuest, setUser, onExitGuest }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSettings, setActiveSettings] = useState<'notifications' | 'privacy' | 'help' | null>(null);
  const [editForm, setEditForm] = useState<User>({ ...user });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await persistenceService.saveUser(editForm);
    setUser(editForm);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    if (isGuest) {
        if (!confirm("Exiting Guest Mode will return you to the login screen. Your guest data is saved locally.")) return;
        onExitGuest();
    } else {
        if (!confirm("Are you sure you want to sign out?")) return;
        try {
          await signOut(auth);
        } catch (e) {
          console.error("Sign out error", e);
        }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const downloadURL = await persistenceService.uploadProfilePicture(file);
      const updatedUser = { ...user, profilePic: downloadURL };
      setUser(updatedUser);
      setEditForm(prev => ({ ...prev, profilePic: downloadURL }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload photo. If in Guest Mode, storage is limited.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to delete your profile picture?")) return;
    setIsUploading(true);
    try {
      await persistenceService.deleteProfilePicture();
      const updatedUser = { ...user, profilePic: '' };
      setUser(updatedUser);
      setEditForm(prev => ({ ...prev, profilePic: '' }));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (activeSettings) {
    return (
      <SettingsDetails 
        type={activeSettings} 
        onBack={() => setActiveSettings(null)} 
        user={user} 
        onUpdateUser={setUser}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A0C55F]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2 relative z-10">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-brand font-bold text-[#2F3E2E]">My Account</h2>
          <p className="text-gray-400 font-medium">Manage your Bito profile & preferences 🥑</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => { setIsEditing(true); setEditForm({ ...user }); }} 
            className="px-8 py-4 bg-[#A0C55F] text-white rounded-3xl shadow-xl shadow-[#A0C55F]/20 font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-[#8eb052] transition-all active:scale-95"
          >
            <Edit2 size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(false)} 
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
            >
              <X size={20}/>
            </button>
            <button 
              onClick={handleSave} 
              className="px-8 py-4 bg-[#A0C55F] text-white rounded-3xl shadow-xl shadow-[#A0C55F]/20 font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-[#8eb052] transition-all active:scale-95"
            >
              <Check size={18}/> Save Changes
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[64px] shadow-sm border border-gray-50 flex flex-col items-center text-center gap-8 relative group overflow-hidden hover:shadow-2xl transition-all duration-700">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FFE66D]" />
            <div className="relative">
              <div className="w-44 h-44 bg-[#F8FAF5] rounded-full overflow-hidden flex items-center justify-center border-8 border-white shadow-2xl transition-transform group-hover:scale-105 duration-700">
                {isUploading ? (
                  <Loader2 className="animate-spin text-[#A0C55F]" size={48} />
                ) : user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={72} className="text-[#DFF2C2]" />
                )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-[#FFE66D] text-[#2F3E2E] rounded-[24px] shadow-lg hover:scale-110 transition-all active:scale-90"
                  title="Upload/Take Photo"
                >
                  <Camera size={20} />
                </button>
                {user.profilePic && (
                  <button 
                    onClick={handleDeletePhoto}
                    className="p-4 bg-white text-orange-400 rounded-[24px] shadow-lg border border-orange-50 hover:bg-orange-50 transition-all active:scale-90"
                    title="Delete Photo"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
              capture="environment"
            />

            <div className="space-y-2">
              {isEditing ? (
                <input 
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="text-3xl font-brand font-bold text-center bg-[#F8FAF5] rounded-2xl px-6 py-4 w-full border-2 border-transparent focus:border-[#A0C55F]/30 focus:bg-white transition-all outline-none"
                  placeholder="Your Name"
                />
              ) : (
                <h3 className="text-3xl font-brand font-bold text-[#2F3E2E] py-2">{user.name}</h3>
              )}
              <p className="text-gray-400 font-medium text-base tracking-wide">{user.email || (isGuest ? 'Bito Guest Account' : 'Cloud Member')}</p>
            </div>

            <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm ${isGuest ? 'bg-orange-50 text-orange-400' : 'bg-[#EBF7DA] text-[#A0C55F]'}`}>
              {isGuest ? 'Offline Mode' : 'Cloud Synced'}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: Bell, label: 'Notifications', s: 'notifications', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Shield, label: 'Privacy & Data', s: 'privacy', color: 'text-[#A0C55F]', bg: 'bg-[#F8FAF5]' },
              { icon: HelpCircle, label: 'Help Center', s: 'help', color: 'text-purple-400', bg: 'bg-purple-50' }
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSettings(item.s as any)}
                className="w-full bg-white p-6 rounded-[40px] flex justify-between items-center border border-gray-50 group hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className={`p-4 ${item.bg} ${item.color} rounded-[24px] group-hover:scale-110 transition-transform`}>
                    <item.icon size={22} />
                  </div>
                  <span className="font-bold text-lg text-[#2F3E2E]">{item.label}</span>
                </div>
                <ChevronRight className="text-gray-200 group-hover:text-[#A0C55F] transition-colors" size={24} />
              </button>
            ))}
            
            <button 
              onClick={handleSignOut} 
              className="w-full bg-orange-50/30 p-6 rounded-[40px] flex justify-between items-center text-orange-400 border border-orange-50 mt-6 group hover:bg-orange-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white rounded-[24px] shadow-sm text-orange-500 group-hover:rotate-12 transition-transform"><LogOut size={22} /></div>
                <span className="font-black text-xs uppercase tracking-widest">{isGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-10 md:p-14 rounded-[72px] shadow-sm border border-gray-50 space-y-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Sparkles size={80} className="text-[#FFE66D]" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl md:text-4xl font-brand font-bold text-[#2F3E2E]">Body Vitality</h3>
              <p className="text-gray-400 text-base font-medium">Keep your health profile up to date for better AI coaching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] px-1">Physical Metrics</label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Weight ({user.weightUnit})</p>
                    <input 
                      disabled={!isEditing}
                      type="number"
                      value={isEditing ? editForm.weight : user.weight}
                      onChange={e => setEditForm({...editForm, weight: parseFloat(e.target.value)})}
                      className="w-full px-6 py-6 bg-[#F8FAF5] rounded-3xl font-bold border-2 border-transparent focus:border-[#A0C55F]/30 focus:bg-white disabled:bg-transparent disabled:text-[#2F3E2E] transition-all outline-none text-xl min-h-[72px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Height (cm)</p>
                    <input 
                      disabled={!isEditing}
                      type="number"
                      value={isEditing ? editForm.height : user.height}
                      onChange={e => setEditForm({...editForm, height: parseInt(e.target.value)})}
                      className="w-full px-6 py-6 bg-[#F8FAF5] rounded-3xl font-bold border-2 border-transparent focus:border-[#A0C55F]/30 focus:bg-white disabled:bg-transparent disabled:text-[#2F3E2E] transition-all outline-none text-xl min-h-[72px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] px-1">Your Primary Motivation</label>
                <div className="relative">
                  <select 
                    disabled={!isEditing}
                    value={isEditing ? editForm.goal : user.goal}
                    onChange={e => setEditForm({...editForm, goal: e.target.value})}
                    className="w-full px-6 py-6 bg-[#F8FAF5] rounded-3xl font-bold border-2 border-transparent focus:border-[#A0C55F]/30 focus:bg-white disabled:bg-transparent disabled:text-[#2F3E2E] appearance-none transition-all outline-none text-lg shadow-sm min-h-[72px]"
                  >
                    <option value="Be more active 🥑">Be more active 🥑</option>
                    <option value="Eat balanced meals 🥗">Eat balanced meals 🥗</option>
                    <option value="Stay hydrated 💧">Stay hydrated 💧</option>
                    <option value="Just curious! ✨">Just curious! ✨</option>
                  </select>
                  {isEditing && <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none rotate-90" size={20} />}
                </div>
              </div>
            </div>

            <div className="space-y-10 pt-10 border-t border-gray-50">
              <div className="flex items-center justify-between">
                 <h4 className="text-2xl md:text-3xl font-brand font-bold text-[#2F3E2E] flex items-center gap-3">
                    <Target size={28} className="text-[#A0C55F]" />
                    Daily Performance Targets
                 </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="bg-[#EBF7DA] p-10 rounded-[48px] space-y-6 group hover:shadow-xl transition-all border-b-4 border-transparent hover:border-[#A0C55F]">
                  <div className="flex justify-between items-center">
                    <div className="p-4 bg-white rounded-2xl text-[#A0C55F] shadow-sm group-hover:scale-110 transition-transform">
                      <Footprints size={28} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#A0C55F] uppercase tracking-[0.3em]">Step Count</p>
                    <div className="flex items-center gap-3 py-1">
                      <input 
                        disabled={!isEditing}
                        type="number"
                        value={isEditing ? editForm.dailyStepGoal : user.dailyStepGoal}
                        onChange={e => setEditForm({...editForm, dailyStepGoal: parseInt(e.target.value)})}
                        className="w-0 flex-1 bg-transparent text-4xl font-brand font-bold text-[#2F3E2E] border-none p-0 focus:ring-0 outline-none leading-none min-h-[44px]"
                      />
                      <span className="text-xs font-black text-gray-400 shrink-0">PTS</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E9F3FC] p-10 rounded-[48px] space-y-6 group hover:shadow-xl transition-all border-b-4 border-transparent hover:border-blue-400">
                  <div className="flex justify-between items-center">
                    <div className="p-4 bg-white rounded-2xl text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                      <Droplets size={28} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Water Intake</p>
                    <div className="flex items-center gap-3 py-1">
                      <input 
                        disabled={!isEditing}
                        type="number"
                        value={isEditing ? editForm.dailyWaterGoal : user.dailyWaterGoal}
                        onChange={e => setEditForm({...editForm, dailyWaterGoal: parseInt(e.target.value)})}
                        className="w-0 flex-1 bg-transparent text-4xl font-brand font-bold text-[#2F3E2E] border-none p-0 focus:ring-0 outline-none leading-none min-h-[44px]"
                      />
                      <span className="text-xs font-black text-gray-400 shrink-0">GLS</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-10 rounded-[48px] space-y-6 group hover:shadow-xl transition-all border-b-4 border-transparent hover:border-orange-400">
                  <div className="flex justify-between items-center">
                    <div className="p-4 bg-white rounded-2xl text-orange-400 shadow-sm group-hover:scale-110 transition-transform">
                      <Flame size={28} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]">Active KCAL</p>
                    <div className="flex items-center gap-3 py-1">
                      <input 
                        disabled={!isEditing}
                        type="number"
                        value={isEditing ? editForm.dailyCalorieGoal : user.dailyCalorieGoal}
                        onChange={e => setEditForm({...editForm, dailyCalorieGoal: parseInt(e.target.value)})}
                        className="w-0 flex-1 bg-transparent text-4xl font-brand font-bold text-[#2F3E2E] border-none p-0 focus:ring-0 outline-none leading-none min-h-[44px]"
                      />
                      <span className="text-xs font-black text-gray-400 shrink-0">CAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center pb-12 opacity-30">
             <p className="text-xs font-black uppercase tracking-[0.6em] mb-2">Bito Health Companion</p>
             <p className="text-[10px] font-bold">V 2.4.0 • Built for a better you 🥑</p>
          </div>
        </div>
      </div>
    </div>
  );
};
