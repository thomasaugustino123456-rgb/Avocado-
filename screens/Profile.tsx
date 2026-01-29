
import React, { useState, useRef } from 'react';
import { User, Screen } from '../types';
import { supabase } from '../services/supabase';
import { Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Camera, Edit2, Check, X, User as UserIcon, Loader2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  setUser: (u: User) => void;
  onNavigate: (screen: Screen) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, setUser, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<User>({ ...user });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { error } = await supabase.from('users').update({
        name: editForm.name,
        age: editForm.age,
        weight_kg: editForm.weight,
        height_cm: editForm.height,
        goal: editForm.goal,
        profile_pic: editForm.profilePic
      }).eq('id', session.user.id);

      if (!error) {
        setUser(editForm);
        setIsEditing(false);
      } else {
        alert("Error saving profile: " + error.message);
      }
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { icon: Bell, label: 'Notifications', value: 'Daily reminders', screen: 'notifications' as Screen },
    { icon: Shield, label: 'Privacy & Security', value: 'Protected', screen: 'privacy' as Screen },
    { icon: HelpCircle, label: 'Help Center', value: '24/7 Support', screen: 'help' as Screen },
  ];

  return (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">
          {isEditing ? 'Edit Your Profile' : 'Your Profile'}
        </h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 bg-white rounded-2xl shadow-sm text-[#A0C55F] hover:bg-[#F8FAF5] transition-all flex items-center gap-2 font-bold"
          >
            <Edit2 size={20} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleCancel}
              className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:bg-gray-50 transition-all"
            >
              <X size={20} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="p-3 bg-[#A0C55F] rounded-2xl shadow-sm text-white hover:bg-[#8eb052] transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            </button>
          </div>
        )}
      </header>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-50 flex flex-col items-center gap-6 relative overflow-hidden group">
        <div className="relative group/photo">
          <div className="w-32 h-32 bg-[#DFF2C2] rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
            {editForm.profilePic ? (
              <img src={editForm.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} className="text-[#A0C55F]" />
            )}
          </div>
          {isEditing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#FFE66D] p-3 rounded-2xl shadow-lg text-[#2F3E2E] hover:scale-110 active:scale-95 transition-all border-2 border-white"
            >
              <Camera size={20} />
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="user" onChange={handleImageChange} />
        </div>

        {isEditing ? (
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Display Name</label>
              <input 
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-6 py-4 bg-[#F8FAF5] rounded-3xl border-none focus:ring-2 focus:ring-[#A0C55F]/30 text-lg font-bold"
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Health Goal</label>
              <input 
                value={editForm.goal}
                onChange={e => setEditForm({ ...editForm, goal: e.target.value })}
                className="w-full px-6 py-4 bg-[#F8FAF5] rounded-3xl border-none focus:ring-2 focus:ring-[#A0C55F]/30 text-lg font-bold"
                placeholder="e.g. Feel Energized"
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-brand font-bold text-[#2F3E2E]">{user.name}</h3>
            <p className="text-[#A0C55F] font-black text-xs tracking-[0.2em] uppercase bg-[#EBF7DA] px-4 py-1.5 rounded-full inline-block">
              Goal: {user.goal}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-3 w-full border-t border-gray-100 mt-4 pt-8 gap-4">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight</p>
            {isEditing ? (
              <div className="relative">
                <input type="number" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: parseFloat(e.target.value) || 0 })} className="w-full bg-[#F8FAF5] py-2 rounded-xl text-center font-bold text-sm" />
                <span className="text-[8px] absolute right-1 bottom-1 text-gray-400 uppercase">kg</span>
              </div>
            ) : (
              <p className="text-xl font-bold text-[#2F3E2E]">{user.weight}<span className="text-sm ml-0.5 opacity-40 font-medium">kg</span></p>
            )}
          </div>
          <div className="text-center space-y-2 border-x border-gray-100 px-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height</p>
            {isEditing ? (
              <div className="relative">
                <input type="number" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: parseInt(e.target.value) || 0 })} className="w-full bg-[#F8FAF5] py-2 rounded-xl text-center font-bold text-sm" />
                <span className="text-[8px] absolute right-1 bottom-1 text-gray-400 uppercase">cm</span>
              </div>
            ) : (
              <p className="text-xl font-bold text-[#2F3E2E]">{user.height}<span className="text-sm ml-0.5 opacity-40 font-medium">cm</span></p>
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age</p>
            {isEditing ? (
              <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })} className="w-full bg-[#F8FAF5] py-2 rounded-xl text-center font-bold text-sm" />
            ) : (
              <p className="text-xl font-bold text-[#2F3E2E]">{user.age || 28}</p>
            )}
          </div>
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] ml-4">Account Settings</h4>
            <div className="space-y-3">
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => onNavigate(item.screen)} className="w-full bg-white p-6 rounded-[32px] border border-gray-50 flex justify-between items-center group active:scale-[0.98] transition-all hover:shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-[#F8FAF5] rounded-[24px] group-hover:bg-[#DFF2C2] transition-all">
                      <item.icon size={22} className="text-gray-400 group-hover:text-[#2F3E2E]" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#2F3E2E] text-lg">{item.label}</p>
                      {item.value && <p className="text-sm text-gray-400 font-medium">{item.value}</p>}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-200 group-hover:text-[#A0C55F] group-hover:translate-x-1 transition-all" />
                </button>
              ))}

              <button onClick={handleSignOut} className="w-full bg-white p-6 rounded-[32px] border border-gray-50 flex justify-between items-center text-orange-400 mt-6 hover:bg-orange-50 group transition-all active:scale-[0.98]">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-orange-50 rounded-[24px] group-hover:bg-white transition-all">
                    <LogOut size={22} />
                  </div>
                  <p className="font-bold text-lg">Sign Out</p>
                </div>
              </button>
            </div>
          </div>
          <div className="pt-8 text-center space-y-2">
            <p className="text-xs text-gray-300 font-black tracking-widest uppercase">Avocado Companion v1.2.0</p>
          </div>
        </>
      )}
    </div>
  );
};
