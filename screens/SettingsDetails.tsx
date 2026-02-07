
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, Check, 
  Trash2, Download, Send, AlertCircle, Info, Lock, Globe, 
  Zap, Droplets, Clock, Flame, Loader2, Smile, BellRing, Settings2, RefreshCcw,
  MessageSquare, History, UserCheck, Smartphone, CheckCircle2, Copy, Terminal,
  AlertTriangle, PlayCircle, X, ExternalLink
} from 'lucide-react';
import { User, Screen, UserSettings } from '../types';
import { persistenceService } from '../services/persistenceService';
import { messaging } from '../services/firebase';
import { getToken } from 'firebase/messaging';
import { Mascot } from '../components/Mascot';
import { audioService } from '../services/audioService';

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
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const settings = user.settings || {
    notifications: { mealReminders: true, streakUpdates: true, tipsEncouragement: true, reminderTime: '08:00' },
    privacy: { libraryPublic: false }
  };

  const VAPID_KEY = 'BO0Rz9AB9uKWj7qtWWqcJUG3B0X8QRVe5WR40zS6NFVlNkVm5xu8G95ktzkVU9bkAiZ58K_2M7zS_LOjrDYCkEg';

  const syncCloudToken = async () => {
    if (!messaging) {
      setError("Firebase Messaging is not supported in this browser environment.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        setFcmToken(token);
        await persistenceService.saveMessagingToken(token);
        setSuccess("Cloud Link Established! 🥑✨");
        audioService.playGold();
      } else {
        setError("Could not generate a device token. Please try again.");
      }
    } catch (err: any) {
      console.error("FCM Token Error:", err);
      if (err.code === 'messaging/permission-blocked') {
        setError("Notifications are blocked! Please click the 'Lock' icon in your browser URL bar and set Notifications to 'Allow'.");
      } else {
        setError("Connection failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerLocalTest = () => {
    if (Notification.permission === 'granted') {
      new Notification("Bito Test Nudge! 🥑", {
        body: "Success! This is exactly how your healthy habit reminders will look.",
        icon: 'https://img.icons8.com/emoji/96/000000/avocado-emoji.png'
      });
      setSuccess("Test Sent! Check your desktop notifications. 🔔");
    } else {
      setError("Enable Cloud Nudges first to send a test!");
    }
  };

  const copyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setSuccess("FCM Token Copied! 📋");
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
    if (notifPermission === 'denied') {
       setError("Permission was previously denied. You must manually allow notifications in your browser settings to continue.");
       return;
    }

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      await syncCloudToken();
    } else {
      setError("Notification access was not granted.");
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-6 animate-in zoom-in-95 shadow-lg">
          <div className="p-4 bg-white rounded-2xl shadow-sm text-red-500">
            <AlertTriangle size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="font-bold text-red-800 text-lg">Bito encountered a hitch!</p>
            <p className="text-red-600/70 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-2 text-red-300 hover:text-red-500 transition-colors"><X /></button>
        </div>
      )}

      {/* Cloud Sync Hero Card */}
      <div className={`p-10 rounded-[56px] border-2 flex flex-col md:flex-row items-center gap-8 group transition-all duration-500 shadow-sm ${notifPermission === 'granted' ? 'bg-[#A0C55F]/5 border-[#A0C55F]/20' : 'bg-white border-gray-100'}`}>
         <div className="p-6 rounded-[40px] shadow-sm bg-white relative">
            {notifPermission === 'granted' ? (
              <>
                <BellRing size={64} className="text-[#A0C55F] animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#A0C55F] rounded-full border-4 border-white animate-pulse" />
              </>
            ) : <Bell size={64} className="text-gray-300" />}
         </div>
         <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
               <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Cloud Nudge Network</h3>
               {notifPermission === 'granted' && <div className="bg-[#A0C55F] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Linked</div>}
            </div>
            <p className="text-gray-500 font-medium">Link Bito to the Firebase cloud to receive your daily health nudges even when the app is closed.</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={requestPermission} 
                disabled={loading || notifPermission === 'granted'}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${notifPermission === 'granted' ? 'bg-white text-[#A0C55F] cursor-default border border-[#A0C55F]/20' : 'bg-[#A0C55F] text-white shadow-xl hover:scale-105 active:scale-95'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (notifPermission === 'granted' ? <Check size={18} /> : <Zap size={18} />)}
                {loading ? 'Connecting...' : (notifPermission === 'granted' ? 'Cloud Active' : 'Enable Cloud Nudges')}
              </button>

              {notifPermission === 'granted' && (
                <button 
                  onClick={triggerLocalTest}
                  className="px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <PlayCircle size={18} />
                  Test My Nudge
                </button>
              )}
            </div>
         </div>
      </div>

      {/* Advanced Debug Section for Developer */}
      {notifPermission === 'granted' && fcmToken && (
        <div className="bg-[#2F3E2E] p-8 md:p-12 rounded-[48px] border border-white/10 space-y-6 shadow-2xl animate-in zoom-in-95 border-l-8 border-l-[#A0C55F]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#A0C55F]">
                 <Terminal size={20} />
                 <h4 className="text-[12px] font-black uppercase tracking-[0.4em]">Developer Test Lab</h4>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                 <div className="w-2 h-2 bg-[#A0C55F] rounded-full animate-pulse" />
                 FCM Active
              </div>
           </div>
           
           <div className="space-y-4">
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                To test Bito from the Firebase Console, copy your <b>FCM Registration Token</b> below and paste it into the "Test on Device" popup.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                 <div className="flex-1 bg-black/40 p-5 rounded-3xl text-[#A0C55F] font-mono text-[11px] overflow-hidden truncate border border-white/5 relative group cursor-pointer hover:bg-black/60 transition-all" onClick={copyToken}>
                    <div className="absolute inset-0 bg-[#A0C55F]/5 animate-pulse" />
                    <span className="relative z-10">{fcmToken}</span>
                 </div>
                 <button 
                   onClick={copyToken}
                   className="bg-[#A0C55F] px-8 py-5 rounded-3xl text-[#2F3E2E] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 shrink-0"
                 >
                   <Copy size={20} />
                   Copy Token
                 </button>
              </div>
           </div>

           <div className="pt-4 border-t border-white/5">
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-[#A0C55F] transition-colors"
              >
                Open Firebase Console <ExternalLink size={12} />
              </a>
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
                <p className="text-xs text-gray-400">Bito will nudge you at this time.</p>
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
            { id: 'streakUpdates', icon: Zap, title: 'Streak Power-ups', desc: 'Celebrations for hitting records.', color: 'text-yellow-600' },
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
