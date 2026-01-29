
import React, { useState, useRef } from 'react';
import { User, Screen } from '../types';
import { auth } from '../services/firebase';
import { signOut } from "firebase/auth";
import { persistenceService } from '../services/persistenceService';
import { 
  LogOut, User as UserIcon, Edit2, Check, X, ChevronRight, 
  Bell, Shield, HelpCircle, Camera, Upload, Trash2, 
  Target, Footprints, Droplets, Flame, Loader2
} from 'lucide-react';

interface ProfileProps {
  user: User;
  setUser: (u: User) => void;
  onNavigate: (screen: Screen) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, setUser, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<User>({ ...user });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await persistenceService.saveUser(editForm);
    setUser(editForm);
    setIsEditing(false);
  };

  const handleSignOut = () => signOut(auth);

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
      alert("Failed to upload photo. Please check your storage rules!");
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

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
      <header className="flex justify-between items-center px-2">
        <h2 className="text-4xl font-brand font-bold text-[#2F3E2E]">Profile Settings</h2>
        {!isEditing ? (
          <button 
            onClick={() => { setIsEditing(true); setEditForm({ ...user }); }} 
            className="px-6 py-3 bg-[#A0C55F] text-white rounded-2xl shadow-lg shadow-[#A0C55F]/20 font-bold flex items-center gap-2 hover:bg-[#8eb052] transition-all"
          >
            <Edit2 size={20} /> Edit Details
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)} 
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:bg-gray-50 transition-all"
            >
              <X size={20}/>
            </button>
            <button 
              onClick={handleSave} 
              className="px-6 py-3 bg-[#A0C55F] text-white rounded-2xl shadow-lg shadow-[#A0C55F]/20 font-bold flex items-center gap-2 hover:bg-[#8eb052] transition-all"
            >
              <Check size={20}/> Save Changes
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Main Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 flex flex-col items-center text-center gap-6 relative group overflow-hidden">
            <div className="relative">
              <div className="w-40 h-40 bg-[#DFF2C2] rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                {isUploading ? (
                  <Loader2 className="animate-spin text-[#A0C55F]" size={48} />
                ) : user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={64} className="text-[#A0C55F]" />
                )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-[#FFE66D] text-[#2F3E2E] rounded-2xl shadow-lg hover:scale-105 transition-all"
                  title="Upload/Take Photo"
                >
                  <Camera size={20} />
                </button>
                {user.profilePic && (
                  <button 
                    onClick={handleDeletePhoto}
                    className="p-3 bg-white text-orange-400 rounded-2xl shadow-lg border border-orange-50 hover:bg-orange-50 transition-all"
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

            <div className="space-y-1">
              {isEditing ? (
                <input 
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="text-2xl font-brand font-bold text-center bg-[#F8FAF5] rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-[#A0C55F]/30"
                />
              ) : (
                <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">{user.name}</h3>
              )}
              <p className="text-gray-400 font-medium text-sm">{user.email}</p>
            </div>

            <div className="bg-[#EBF7DA] px-4 py-2 rounded-full text-[#A0C55F] text-[10px] font-black uppercase tracking-widest">
              Active Member
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: Bell, label: 'Notifications', s: 'notifications' },
              { icon: Shield, label: 'Privacy', s: 'privacy' },
              { icon: HelpCircle, label: 'Help Center', s: 'help' }
            ].map((item, i) => (
              <button key={i} className="w-full bg-white p-5 rounded-[32px] flex justify-between items-center border border-gray-50 group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#F8FAF5] rounded-2xl group-hover:bg-[#DFF2C2] transition-colors">
                    <item.icon className="text-gray-400 group-hover:text-[#2F3E2E]" size={20} />
                  </div>
                  <span className="font-bold text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="text-gray-200" size={18} />
              </button>
            ))}
            
            <button 
              onClick={handleSignOut} 
              className="w-full bg-orange-50/50 p-5 rounded-[32px] flex justify-between items-center text-orange-400 border border-orange-50 mt-4 group hover:bg-orange-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm"><LogOut size={20} /></div>
                <span className="font-bold">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Stats & Goals Editing */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">General Information</h3>
              <p className="text-gray-400 text-sm font-medium">Keep your health profile up to date for better AI coaching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vital Statistics</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-gray-400">Weight ({user.weightUnit})</p>
                    <input 
                      disabled={!isEditing}
                      type="number"
                      value={isEditing ? editForm.weight : user.weight}
                      onChange={e => setEditForm({...editForm, weight: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 bg-[#F8FAF5] rounded-2xl font-bold border-none disabled:bg-transparent disabled:text-[#2F3E2E] focus:ring-2 focus:ring-[#A0C55F]/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-gray-400">Height (cm)</p>
                    <input 
                      disabled={!isEditing}
                      type="number"
                      value={isEditing ? editForm.height : user.height}
                      onChange={e => setEditForm({...editForm, height: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-[#F8FAF5] rounded-2xl font-bold border-none disabled:bg-transparent disabled:text-[#2F3E2E] focus:ring-2 focus:ring-[#A0C55F]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Your Primary Goal</label>
                <select 
                  disabled={!isEditing}
                  value={isEditing ? editForm.goal : user.goal}
                  onChange={e => setEditForm({...editForm, goal: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8FAF5] rounded-2xl font-bold border-none disabled:bg-transparent disabled:text-[#2F3E2E] appearance-none focus:ring-2 focus:ring-[#A0C55F]/30"
                >
                  <option value="Be more active 🥑">Be more active 🥑</option>
                  <option value="Eat balanced meals 🥗">Eat balanced meals 🥗</option>
                  <option value="Stay hydrated 💧">Stay hydrated 💧</option>
                  <option value="Just curious! ✨">Just curious! ✨</option>
                </select>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-50">
              <h4 className="text-xl font-brand font-bold text-[#2F3E2E] flex items-center gap-2">
                <Target size={20} className="text-[#A0C55F]" />
                Daily Habits Goals
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#EBF7DA] p-6 rounded-[32px] space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-2 bg-white rounded-xl text-[#A0C55F] shadow-sm">
                      <Footprints size={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#A0C55F] uppercase tracking-widest">Steps Goal</p>
                    <div className="flex items-end gap-2">
                      <input 
                        disabled={!isEditing}
                        type="number"
                        value={isEditing ? editForm.dailyStepGoal : user.dailyStepGoal}
                        onChange={e => setEditForm({...editForm, dailyStepGoal: parseInt(e.target.value)})}
                        className="w-20 bg-transparent text-2xl font-brand font-bold text-[#2F3E2E] border-none p-0 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-gray-400 mb-1">pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E9F3FC] p-6 rounded-[32px] space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-2 bg-white rounded-xl text-blue-400 shadow-sm">
                      <Droplets size={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Water Goal</p>
                    <div className="flex items-end gap-2">
                      <input 
                        disabled={!isEditing}
                        type="number"
                        value={isEditing ? editForm.dailyWaterGoal : user.dailyWaterGoal}
                        onChange={e => setEditForm({...editForm, dailyWaterGoal: parseInt(e.target.value)})}
                        className="w-16 bg-transparent text-2xl font-brand font-bold text-[#2F3E2E] border-none p-0 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-gray-400 mb-1">glasses</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-[32px] space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-2 bg-white rounded-xl text-orange-400 shadow-sm">
                      <Flame size={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Calorie Goal</p>
                    <div className="flex items-end gap-2">
                      <input 
                        disabled={!isEditing}
                        type="number"
                        value={isEditing ? editForm.dailyCalorieGoal : user.dailyCalorieGoal}
                        onChange={e => setEditForm({...editForm, dailyCalorieGoal: parseInt(e.target.value)})}
                        className="w-20 bg-transparent text-2xl font-brand font-bold text-[#2F3E2E] border-none p-0 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-gray-400 mb-1">kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};