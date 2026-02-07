
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, Check, 
  Trash2, Download, Send, AlertCircle, Info, Lock, Globe, 
  Zap, Droplets, Clock, Flame, Loader2, Smile, BellRing, Settings2, RefreshCcw,
  MessageSquare, History, UserCheck, Smartphone, CheckCircle2, Copy, Terminal
} from 'lucide-react';
import { User, Screen, UserSettings } from '../types';
import { persistenceService } from '../services/persistenceService';
import { messaging } from '../services/firebase';
import { getToken } from 'firebase/messaging';
import { Mascot } from '../components/Mascot';

interface SettingsDetailsProps {
  type: 'notifications' | 'privacy' | 'help';
  onBack: () => void;
  user: User;
  onUpdateUser: (u: User) => void;
}

export const SettingsDetails: React.FC<SettingsDetailsProps> = ({ type, onBack, user, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportHistory, setSupportHistory] = useState<any[]>([]);
  const [supportForm, setSupportForm] = useState({ name: user.name, email: user.email || '', message: '' });
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const settings = user.settings || {
    notifications: { mealReminders: true, streakUpdates: true, tipsEncouragement: true, reminderTime: '08:00' },
    privacy: { libraryPublic: false }
  };

  // Sync token periodically if permission is granted
  useEffect(() => {
    if (notifPermission === 'granted') {
      syncCloudToken();
    }
  }, [notifPermission]);

  const syncCloudToken = async () => {
    if (!messaging) return;
    try {
      // Updated with User's Real VAPID Key
      const VAPID_KEY = 'BO0Rz9AB9uKWj7qtWWqcJUG3B0X8QRVe5WR40zS6NFVlNkVm5xu8G95ktzkVU9bkAiZ58K_2M7zS_LOjrDYCkEg';
      
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        setFcmToken(token);
        await persistenceService.saveMessagingToken(token);
      }
    } catch (err) {
      console.error("FCM Token Error:", err);
    }
  };

  const copyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setSuccess("Bito Address Copied! 🥑📋");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleToggleNotification = async (key: keyof UserSettings['notifications']) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key as any] }
    };
    const updatedUser = { ...user, settings: newSettings };
    onUpdateUser(updatedUser);
    await persistenceService.saveUser(updatedUser);
  };

  const handleUpdateTime = async (time: string) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, reminderTime: time }
    };
    const updatedUser = { ...user, settings: newSettings };
    onUpdateUser(updatedUser);
    await persistenceService.saveUser(updatedUser);
  };

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      await syncCloudToken();
      setSuccess("Bito is now linked to the cloud! 🥑✨");
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Cloud Sync Hero Card */}
      <div className={`p-10 rounded-[56px] border flex flex-col md:flex-row items-center gap-8 group transition-all duration-500 shadow-sm ${notifPermission === 'granted' ? 'bg-[#A0C55F]/5 border-[#A0C55F]/20' : 'bg-white border-gray-100'}`}>
         <div className="p-6 rounded-[40px] shadow-sm bg-white">
            {notifPermission === 'granted' ? <BellRing size={64} className="text-[#A0C55F] animate-bounce" /> : <Bell size={64} className="text-gray-300" />}
         </div>
         <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
               <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Cloud Nudge Network</h3>
               {notifPermission === 'granted' && <div className="bg-[#A0C55F] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Active</div>}
            </div>
            <p className="text-gray-500 font-medium">Bito uses Firebase Cloud Messaging to send Duolingo-style alerts. This keeps you motivated even when the app is closed!</p>
            <button onClick={requestPermission} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${notifPermission === 'granted' ? 'bg-white text-[#A0C55F]' : 'bg-[#A0C55F] text-white shadow-lg'}`}>
              {notifPermission === 'granted' ? 'Connected Successfully' : 'Enable Cloud Nudges'}
            </button>
         </div>
      </div>

      {/* Advanced Debug Section for Developer */}
      {notifPermission === 'granted' && fcmToken && (
        <div className="bg-[#2F3E2E] p-8 rounded-[48px] border border-white/10 space-y-6 shadow-2xl animate-in zoom-in-95">
           <div className="flex items-center gap-3 text-[#A0C55F]">
              <Terminal size={18} />
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">Developer Test Mode</h4>
           </div>
           <p className="text-gray-400 text-sm font-medium">Copy this <b>Device Address</b> and paste it into the "Test on Device" section of the Firebase Messaging Campaign tool.</p>
           <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 p-4 rounded-2xl text-white font-mono text-[10px] overflow-hidden truncate opacity-60">
                 {fcmToken}
              </div>
              <button 
                onClick={copyToken}
                className="bg-[#A0C55F] p-4 rounded-2xl text-white hover:scale-105 active:scale-90 transition-all shadow-lg"
              >
                <Copy size={20} />
              </button>
           </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-8">
        <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Scheduled Reminders</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-6 bg-gray-50/50 rounded-[32px] border border-gray-100/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white text-orange-400 rounded-2xl shadow-sm"><Clock size={20} /></div>
              <div>
                <p className="font-bold text-[#2F3E2E]">Daily Catch-up</p>
                <p className="text-xs text-gray-400">Bito will nudge you if you've been quiet.</p>
              </div>
            </div>
            <input 
              type="time" 
              value={settings.notifications.reminderTime} 
              onChange={(e) => handleUpdateTime(e.target.value)}
              className="bg-white border-none rounded-xl px-4 py-2 font-bold text-[#A0C55F] shadow-sm focus:ring-2 focus:ring-[#A0C55F]/20"
            />
          </div>
          
          {[
            { id: 'mealReminders', icon: Flame, title: 'Habit Reminders', desc: 'Alerts when you forget to log fuel.', color: 'text-orange-400' },
            { id: 'streakUpdates', icon: Zap, title: 'Streak Power-ups', desc: 'Celebrations for hitting 3, 7, 30 days.', color: 'text-yellow-600' },
          ].map((item) => (
            <div key={item.id} className="flex justify-between items-center p-6 bg-gray-50/50 rounded-[32px] border border-gray-100/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-white ${item.color} rounded-2xl shadow-sm`}><item.icon size={20} /></div>
                <div>
                  <p className="font-bold text-[#2F3E2E]">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleNotification(item.id as any)}
                className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${settings.notifications[item.id as keyof UserSettings['notifications']] ? 'bg-[#A0C55F]' : 'bg-gray-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${settings.notifications[item.id as keyof UserSettings['notifications']] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 pb-32 space-y-8 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto min-h-screen">
      <header className="flex items-center gap-6 sticky top-0 bg-[#F8FAF5]/90 backdrop-blur-md py-4 z-20">
        <button onClick={onBack} className="bg-white p-4 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors active:scale-90"><ArrowLeft size={24} /></button>
        <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">
          {type === 'notifications' ? 'Notifications' : type === 'privacy' ? 'Privacy' : 'Help'}
        </h2>
      </header>

      {success && (
         <div className="bg-[#EBF7DA] border border-[#A0C55F]/30 p-6 rounded-[32px] flex items-center gap-4 text-[#2F3E2E] font-bold animate-in zoom-in-95 shadow-md">
            <CheckCircle2 className="text-[#A0C55F]" /> {success}
         </div>
      )}

      {type === 'notifications' && renderNotifications()}
      {type === 'privacy' && <div className="bg-white p-20 rounded-[56px] text-center text-gray-400 font-bold border-2 border-dashed border-gray-100">Bito Privacy Safe is locked... </div>}
      {type === 'help' && <div className="bg-white p-20 rounded-[56px] text-center text-gray-400 font-bold border-2 border-dashed border-gray-100">Consulting Avocado Sages... </div>}
    </div>
  );
};
