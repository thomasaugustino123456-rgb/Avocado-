
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, Check, 
  Trash2, Download, Send, AlertCircle, Info, Lock, Globe, 
  Zap, Droplets, Clock, Flame, Loader2, Smile, BellRing, Settings2, RefreshCcw,
  MessageSquare, History, UserCheck, Smartphone, CheckCircle2, Copy, Terminal,
  AlertTriangle, PlayCircle, X, ExternalLink, ShieldCheck, FileJson, Mail, LifeBuoy
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
  
  // Notification State
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Help State
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [feedback, setFeedback] = useState({ name: user.name, email: user.email || '', message: '' });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const settings = user.settings || {
    notifications: { mealReminders: true, streakUpdates: true, tipsEncouragement: true, reminderTime: '08:00' },
    privacy: { libraryPublic: false }
  };

  const VAPID_KEY = 'BO0Rz9AB9uKWj7qtWWqcJUG3B0X8QRVe5WR40zS6NFVlNkVm5xu8G95ktzkVU9bkAiZ58K_2M7zS_LOjrDYCkEg';

  useEffect(() => {
    if (type === 'help') {
      loadSupportMessages();
    }
  }, [type]);

  const loadSupportMessages = async () => {
    const msgs = await persistenceService.getSupportMessages();
    setSupportMessages(msgs);
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.message.trim()) return;
    setIsSendingFeedback(true);
    try {
      await persistenceService.saveSupportMessage(feedback);
      setSuccess("Message sent to Bito HQ! 🥑✨");
      setFeedback({ ...feedback, message: '' });
      audioService.playGold();
      loadSupportMessages();
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      await persistenceService.exportUserData();
      setSuccess("Your health vault has been downloaded! 📂");
      audioService.playIce();
    } catch (err) {
      setError("Export failed. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("CRITICAL: This will permanently delete your Bito profile and all health data. This cannot be undone. Proceed?")) return;
    setLoading(true);
    try {
      await persistenceService.deleteAccount();
      window.location.reload();
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError("For security, please sign out and sign back in before deleting your account.");
      } else {
        setError("Deletion failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    const newSettings = {
      ...settings,
      privacy: { libraryPublic: !settings.privacy.libraryPublic }
    };
    const updatedUser = { ...user, settings: newSettings };
    onUpdateUser(updatedUser);
    await persistenceService.saveUser(updatedUser);
    setSuccess(newSettings.privacy.libraryPublic ? "Library is now Public 🌍" : "Library is now Private 🔒");
    audioService.playIce();
  };

  // Notification methods (Requesting Permission, Syncing Token, etc.)
  const requestPermission = async () => {
    if (notifPermission === 'denied') {
       setError("Permission blocked. Please allow notifications in browser settings.");
       return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') await syncCloudToken();
  };

  const syncCloudToken = async () => {
    if (!messaging) return;
    setLoading(true);
    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        setFcmToken(token);
        await persistenceService.saveMessagingToken(token);
        setSuccess("Connected to Bito Cloud! 🥑");
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // RENDER SECTIONS
  const renderNotifications = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`p-10 rounded-[56px] border-2 flex flex-col md:flex-row items-center gap-8 group transition-all duration-500 shadow-sm ${notifPermission === 'granted' ? 'bg-[#A0C55F]/5 border-[#A0C55F]/20' : 'bg-white border-gray-100'}`}>
         <div className="p-6 rounded-[40px] shadow-sm bg-white shrink-0">
            {notifPermission === 'granted' ? <BellRing size={64} className="text-[#A0C55F] animate-bounce" /> : <Bell size={64} className="text-gray-300" />}
         </div>
         <div className="space-y-4 text-center md:text-left flex-1">
            <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Cloud Nudge Network</h3>
            <p className="text-gray-500 font-medium">Get health reminders even when Bito is closed.</p>
            <button 
                onClick={requestPermission} 
                disabled={loading || notifPermission === 'granted'}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${notifPermission === 'granted' ? 'bg-white text-[#A0C55F] border border-[#A0C55F]/20' : 'bg-[#A0C55F] text-white shadow-xl hover:scale-105 active:scale-95'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (notifPermission === 'granted' ? <Check size={18} /> : <Zap size={18} />)}
                {notifPermission === 'granted' ? 'Connected' : 'Enable Cloud Nudges'}
            </button>
         </div>
      </div>
      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-2xl font-brand font-bold text-[#2F3E2E] mb-4">Preference Map</h3>
        {[{ id: 'mealReminders', title: 'Meal Reminders', color: 'text-orange-400' }, { id: 'streakUpdates', title: 'Streak Power-ups', color: 'text-yellow-600' }].map(item => (
            <div key={item.id} className="flex justify-between items-center p-6 bg-gray-50/50 rounded-[32px] border border-gray-100/50">
               <span className="font-bold text-[#2F3E2E]">{item.title}</span>
               <button 
                 onClick={async () => {
                    const nextSet = { ...settings.notifications, [item.id]: !settings.notifications[item.id as keyof UserSettings['notifications']] };
                    const updatedUser = { ...user, settings: { ...settings, notifications: nextSet } };
                    onUpdateUser(updatedUser);
                    await persistenceService.saveUser(updatedUser);
                 }}
                 className={`w-14 h-8 rounded-full relative transition-colors ${settings.notifications[item.id as keyof UserSettings['notifications']] ? 'bg-[#A0C55F]' : 'bg-gray-200'}`}
               >
                 <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${settings.notifications[item.id as keyof UserSettings['notifications']] ? 'left-7' : 'left-1'}`} />
               </button>
            </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
           <div className="p-5 bg-blue-50 text-blue-500 rounded-3xl"><ShieldCheck size={40} /></div>
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Privacy Guard</h3>
              <p className="text-gray-400 font-medium">Bito encrypts your health logs locally and in the cloud.</p>
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-8 bg-[#F8FAF5] rounded-[40px] border border-[#A0C55F]/10">
            <div className="flex items-center gap-4">
               {settings.privacy.libraryPublic ? <Globe className="text-[#A0C55F]" /> : <Lock className="text-gray-400" />}
               <div>
                  <p className="font-bold text-[#2F3E2E]">Public Library Profile</p>
                  <p className="text-xs text-gray-400">Allow others to see your shared food insights.</p>
               </div>
            </div>
            <button onClick={handleTogglePrivacy} className={`w-14 h-8 rounded-full relative transition-colors ${settings.privacy.libraryPublic ? 'bg-[#A0C55F]' : 'bg-gray-300'}`}>
               <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${settings.privacy.libraryPublic ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button onClick={handleExportData} className="p-8 bg-white border border-gray-100 rounded-[40px] hover:shadow-xl transition-all flex flex-col gap-4 text-left group">
                <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#A0C55F]/10 group-hover:text-[#A0C55F] transition-colors self-start"><FileJson size={24} /></div>
                <div className="space-y-1">
                   <p className="font-bold text-[#2F3E2E]">Download Data</p>
                   <p className="text-xs text-gray-400">Export your logs as a JSON file.</p>
                </div>
             </button>
             <button onClick={handleDeleteAccount} className="p-8 bg-red-50/30 border border-red-50 rounded-[40px] hover:shadow-xl transition-all flex flex-col gap-4 text-left group">
                <div className="p-4 bg-white text-red-400 rounded-2xl shadow-sm group-hover:bg-red-500 group-hover:text-white transition-colors self-start"><Trash2 size={24} /></div>
                <div className="space-y-1">
                   <p className="font-bold text-red-500">Delete Account</p>
                   <p className="text-xs text-red-400">Permanently erase your existence from Bito.</p>
                </div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 md:p-14 rounded-[56px] shadow-sm border border-gray-100 space-y-10">
         <div className="flex flex-col md:flex-row items-center gap-10">
            <Mascot size={150} mood="happy" />
            <div className="space-y-4 text-center md:text-left">
               <h3 className="text-4xl font-brand font-bold text-[#2F3E2E]">Bito Help Desk</h3>
               <p className="text-xl text-gray-400 font-medium">Need a hand? Our Avocado sages are here to guide you back to the light. 🥑✨</p>
            </div>
         </div>

         <form onSubmit={handleSendFeedback} className="space-y-6 pt-6 border-t border-gray-50">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Send a Message</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="relative">
                  <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input value={feedback.name} onChange={e => setFeedback({...feedback, name: e.target.value})} placeholder="Your Name" className="w-full pl-14 pr-6 py-5 bg-[#F8FAF5] rounded-3xl font-bold border-2 border-transparent focus:border-[#A0C55F]/20 focus:bg-white outline-none transition-all" />
               </div>
               <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input value={feedback.email} onChange={e => setFeedback({...feedback, email: e.target.value})} placeholder="Email Address" className="w-full pl-14 pr-6 py-5 bg-[#F8FAF5] rounded-3xl font-bold border-2 border-transparent focus:border-[#A0C55F]/20 focus:bg-white outline-none transition-all" />
               </div>
            </div>
            <textarea 
               value={feedback.message} 
               onChange={e => setFeedback({...feedback, message: e.target.value})} 
               placeholder="How can Bito help you today?" 
               rows={4}
               className="w-full p-8 bg-[#F8FAF5] rounded-[40px] font-bold border-2 border-transparent focus:border-[#A0C55F]/20 focus:bg-white outline-none transition-all resize-none"
            />
            <button 
              type="submit" 
              disabled={isSendingFeedback || !feedback.message}
              className="w-full py-6 bg-[#2F3E2E] text-white rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#3d4f3b] transition-all active:scale-95 disabled:opacity-50"
            >
               {isSendingFeedback ? <Loader2 className="animate-spin" /> : <Send size={18} />}
               {isSendingFeedback ? 'Sending...' : 'Dispatch Message'}
            </button>
         </form>
      </div>

      {supportMessages.length > 0 && (
         <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] px-4">Message History</h4>
            <div className="space-y-4">
               {supportMessages.map((msg, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-50 flex justify-between items-center group hover:shadow-lg transition-all">
                     <div className="flex items-center gap-5">
                        <div className="p-4 bg-[#F8FAF5] text-[#A0C55F] rounded-2xl"><MessageSquare size={20} /></div>
                        <div>
                           <p className="font-bold text-[#2F3E2E] line-clamp-1">{msg.message}</p>
                           <p className="text-[10px] font-black text-gray-300 uppercase mt-1">Sent on {new Date(msg.timestamp).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="px-4 py-2 bg-[#EBF7DA] text-[#A0C55F] rounded-full text-[9px] font-black uppercase tracking-widest">Received</div>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 pb-32 space-y-8 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto min-h-screen">
      <header className="flex items-center gap-6 sticky top-0 bg-[#F8FAF5]/90 backdrop-blur-md py-4 z-[110]">
        <button onClick={onBack} className="bg-white p-4 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors active:scale-90"><ArrowLeft size={24} /></button>
        <div className="flex flex-col">
          <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">
            {type === 'notifications' ? 'Alert Matrix' : type === 'privacy' ? 'Privacy Shield' : 'Bito Concierge'}
          </h2>
          <span className="text-[9px] font-black text-[#A0C55F] uppercase tracking-[0.3em]">System Settings</span>
        </div>
      </header>

      {success && (
         <div className="bg-[#EBF7DA] border border-[#A0C55F]/30 p-6 rounded-[32px] flex items-center justify-between text-[#2F3E2E] font-bold animate-in zoom-in-95 shadow-md">
            <div className="flex items-center gap-4"><CheckCircle2 className="text-[#A0C55F]" /> {success}</div>
            <button onClick={() => setSuccess(null)}><X size={18} /></button>
         </div>
      )}

      {error && (
         <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] flex items-center justify-between text-red-600 font-bold animate-in shake">
            <div className="flex items-center gap-4"><AlertCircle className="text-red-400" /> {error}</div>
            <button onClick={() => setError(null)}><X size={18} /></button>
         </div>
      )}

      <div className="pb-20">
        {type === 'notifications' && renderNotifications()}
        {type === 'privacy' && renderPrivacy()}
        {type === 'help' && renderHelp()}
      </div>

      <style>{`
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
