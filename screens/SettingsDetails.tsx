
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, Check, 
  Trash2, Download, Send, AlertCircle, Info, Lock, Globe, 
  Zap, Droplets, Clock, Flame, Loader2, Smile, BellRing, Settings2, RefreshCcw,
  MessageSquare, History, UserCheck
} from 'lucide-react';
import { User, Screen, UserSettings } from '../types';
import { persistenceService } from '../services/persistenceService';
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
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const isAdmin = user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase().includes('bito.team');

  const settings = user.settings || {
    notifications: { mealReminders: true, streakUpdates: true, tipsEncouragement: true, reminderTime: '08:00' },
    privacy: { libraryPublic: false }
  };

  useEffect(() => {
    if (type === 'help') {
      loadSupportHistory();
    }
  }, [type]);

  const loadSupportHistory = async () => {
    const messages = await persistenceService.getSupportMessages(isAdmin);
    setSupportHistory(messages);
  };

  // Poll for permission changes (since there is no 'onchange' event for notification permissions in all browsers)
  useEffect(() => {
    const checkPermission = () => {
      if (typeof Notification !== 'undefined') {
        const current = Notification.permission;
        if (current !== notifPermission) {
          setNotifPermission(current);
          if (current === 'granted') {
             setSuccess("Bito now has permission to nudge you! 🥑✨");
             setError(null);
             setTimeout(() => setSuccess(null), 3000);
          }
        }
      }
    };
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, [notifPermission]);

  const handleToggleNotification = async (key: keyof UserSettings['notifications']) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key as any]
      }
    };
    const updatedUser = { ...user, settings: newSettings };
    onUpdateUser(updatedUser);
    await persistenceService.saveUser(updatedUser);
  };

  const requestNotificationPermission = async () => {
    setError(null);
    if (!("Notification" in window)) {
      setError("Bito: This browser doesn't support system nudges! 🥑");
      return;
    }

    if (Notification.permission === 'denied') {
      setError("Permissions are BLOCKED. You must click the LOCK icon in your address bar to fix this! 🔒");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        setSuccess("Bito now has permission to nudge you! 🥑✨");
        setTimeout(() => setSuccess(null), 3000);
      } else if (permission === 'denied') {
        setError("You clicked 'Block'. Please use the Lock icon in the address bar to unblock Bito.");
      }
    } catch (err) {
      setError("Something went wrong. Browsers often block notifications in previews or iframes.");
    }
  };

  const sendTestNotification = () => {
    setError(null);
    if (notifPermission === 'denied') {
      setError("Cannot send nudge: Permissions are blocked. Click the Lock icon next to the URL above. 🔒");
      return;
    }

    if (notifPermission !== 'granted') {
      requestNotificationPermission();
      return;
    }

    try {
      new Notification("Bito Says Hi! 🥑", {
        body: "You're doing amazing! Don't forget to stay hydrated today. ✨",
        icon: "https://img.icons8.com/emoji/96/000000/avocado-emoji.png",
      });
      setSuccess("Test nudge sent! Check your system alerts. 🔔");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError("Browser blocked the nudge. Try refreshing the app.");
    }
  };

  const handleManualRefreshPermission = () => {
    if (typeof Notification !== 'undefined') {
      const current = Notification.permission;
      setNotifPermission(current);
      if (current === 'granted') {
        setSuccess("Great news! Permissions are unblocked. 🥑✨");
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
      } else if (current === 'denied') {
        setError("Still blocked! Please make sure you set Notifications to 'Allow' in the address bar lock icon.");
      } else {
        setError(null);
      }
    }
  };

  const handleTogglePrivacy = async () => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        libraryPublic: !settings.privacy.libraryPublic
      }
    };
    const updatedUser = { ...user, settings: newSettings };
    onUpdateUser(updatedUser);
    await persistenceService.saveUser(updatedUser);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await persistenceService.exportUserData();
      setSuccess("Your health data export has started! 🥑📦");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError("Bito couldn't pack your bags. " + (err.message || "Try again later."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("CRITICAL: This will permanently delete your Bito account and all your health logs. This cannot be undone. Are you absolutely sure?")) return;
    
    setLoading(true);
    try {
      await persistenceService.deleteAccount();
      window.location.href = '/'; 
    } catch (err: any) {
      setError("Deletion failed. You might need to sign out and back in to verify your identity first.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await persistenceService.saveSupportMessage(supportForm);
      setSuccess("Bito caught your message! We'll be in touch soon. 🥑💌");
      setSupportForm({ ...supportForm, message: '' });
      loadSupportHistory();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError("Bito's mailbox is full! Try again in a bit.");
    } finally {
      setLoading(false);
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className={`p-10 rounded-[56px] border flex flex-col md:flex-row items-center gap-8 group transition-all duration-500 shadow-sm ${
        notifPermission === 'denied' 
        ? 'bg-orange-50/50 border-orange-200' 
        : notifPermission === 'granted' 
        ? 'bg-[#A0C55F]/5 border-[#A0C55F]/20'
        : 'bg-white border-gray-100'
      }`}>
         <div className={`p-6 rounded-[40px] shadow-sm group-hover:scale-105 transition-transform bg-white`}>
            {notifPermission === 'denied' ? (
              <AlertCircle size={64} className="text-orange-500 animate-pulse" />
            ) : notifPermission === 'granted' ? (
              <BellRing size={64} className="text-[#A0C55F]" />
            ) : (
              <Bell size={64} className="text-gray-300" />
            )}
         </div>
         <div className="space-y-4 text-center md:text-left flex-1">
            <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">
              {notifPermission === 'denied' ? 'Nudges are Blocked' : 'System Nudges'}
            </h3>
            <p className="text-gray-500 font-medium">
              {notifPermission === 'denied' 
                ? "Your browser is stopping Bito from sending alerts. To fix this, click the Lock icon in your address bar and set 'Notifications' to 'Allow'." 
                : "Allow Bito to send alerts directly to your desktop or phone even when the app is closed."}
            </p>
            
            {notifPermission === 'denied' ? (
              <div className="flex flex-col gap-4">
                <div className="bg-white/60 p-4 rounded-2xl text-xs flex items-start gap-3 border border-orange-100 text-orange-800">
                  <Lock size={16} className="shrink-0 mt-0.5" />
                  <p><b>Fix:</b> Click the <b>Lock Icon</b> next to the URL at the top of your browser. Change <b>Notifications</b> to <b>"Allow"</b>, then click the button below.</p>
                </div>
                <button 
                  onClick={handleManualRefreshPermission}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-600 border border-orange-200 rounded-2xl font-bold text-sm hover:shadow-md transition-all active:scale-95"
                >
                  <RefreshCcw size={16} /> I've unblocked it, Check now!
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                 <button 
                    onClick={requestNotificationPermission}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all ${notifPermission === 'granted' ? 'bg-white text-[#A0C55F]' : 'bg-[#A0C55F] text-white hover:bg-[#8eb052]'}`}
                 >
                    {notifPermission === 'granted' ? 'Permissions Enabled ✓' : 'Enable System Notifications'}
                 </button>
                 <button 
                    onClick={sendTestNotification}
                    className="px-6 py-3 bg-white text-[#2F3E2E] border border-[#A0C55F]/20 rounded-2xl font-bold text-sm hover:shadow-md transition-all active:scale-95"
                 >
                    Send Test Nudge
                 </button>
              </div>
            )}
         </div>
      </div>

      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A0C55F]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="space-y-2">
          <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">App Alerts</h3>
          <p className="text-gray-400 font-medium text-sm">Fine-tune which activities trigger a Bito reminder.</p>
        </div>

        <div className="space-y-4">
          {[
            { id: 'mealReminders', icon: Flame, title: 'Meal Reminders', desc: 'Nudge to log breakfast, lunch, and dinner.', color: 'text-orange-400', bg: 'bg-orange-50' },
            { id: 'streakUpdates', icon: Zap, title: 'Streak Updates', desc: 'Celebrate when you hit daily milestones.', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { id: 'tipsEncouragement', icon: Smile, title: 'Daily Encouragement', desc: 'Soft reminders and cute avocado puns.', color: 'text-[#A0C55F]', bg: 'bg-[#F8FAF5]' },
          ].map((item) => (
            <div key={item.id} className="flex justify-between items-center p-6 bg-gray-50/50 rounded-[32px] border border-gray-100/50 group hover:bg-white transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${item.bg} ${item.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-[#2F3E2E]">{item.title}</p>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
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

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="space-y-2">
          <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Cloud Privacy</h3>
          <p className="text-gray-400 font-medium text-sm">Your health data is private by default.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-6 bg-gray-50/50 rounded-[32px] border border-gray-100/50 group hover:bg-white transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Globe size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-[#2F3E2E]">Public Insight Sharing</p>
                <p className="text-xs text-gray-400 font-medium">Anonymous usage for community wellness trends.</p>
              </div>
            </div>
            <button 
              onClick={handleTogglePrivacy}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${settings.privacy.libraryPublic ? 'bg-[#A0C55F]' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${settings.privacy.libraryPublic ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <button 
            onClick={handleExport}
            disabled={loading}
            className="w-full flex justify-between items-center p-6 bg-white rounded-[32px] border border-gray-100 hover:border-[#A0C55F] hover:shadow-xl transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#F8FAF5] text-[#A0C55F] rounded-2xl group-hover:bg-[#A0C55F] group-hover:text-white transition-all">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              </div>
              <div className="text-left space-y-0.5">
                <p className="font-bold text-[#2F3E2E]">Full Data Export (JSON)</p>
                <p className="text-xs text-gray-400 font-medium">Download everything Bito knows about you.</p>
              </div>
            </div>
            <ChevronRight className="text-gray-200 group-hover:text-[#A0C55F]" size={20} />
          </button>
        </div>
      </div>

      <div className="bg-orange-50/50 p-10 rounded-[56px] border border-orange-100 space-y-6">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-white text-orange-400 rounded-2xl shadow-sm">
               <AlertCircle size={20} />
            </div>
            <div className="space-y-0.5">
               <p className="font-bold text-orange-600">Danger Zone</p>
               <p className="text-xs text-orange-400 font-medium">These actions are permanent.</p>
            </div>
         </div>
         <button 
            onClick={handleDeleteAccount}
            disabled={loading}
            className="w-full bg-white text-orange-500 py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-sm border border-orange-100"
         >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            Delete My Account & Data
         </button>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-8">
      {isAdmin && (
        <div className="bg-[#EBF7DA] p-6 rounded-[32px] border border-[#A0C55F]/30 flex items-center gap-4 text-[#2F3E2E] animate-in zoom-in-95 shadow-sm">
          <div className="p-2 bg-white rounded-xl shadow-sm"><UserCheck className="text-[#A0C55F]" /></div>
          <p className="font-bold text-sm uppercase tracking-widest">Admin Mode Active: You see all community tickets.</p>
        </div>
      )}

      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFE66D]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="bg-[#F8FAF5] p-6 rounded-[40px] shadow-inner">
              <Mascot size={100} mood="little-happy" />
           </div>
           <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-brand font-bold text-[#2F3E2E]">Bito Help Center</h3>
              <p className="text-gray-400 font-medium">Got a question? Bito is here with avocado wisdom.</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-6">Common Questions</h4>
         {[
            { q: "How does the AI food scanner work?", a: "Bito uses advanced Gemini Vision AI to look at your photo, identify ingredients, and estimate nutrition. It's like having a nutritionist in your pocket!" },
            { q: "Can I use Bito without an account?", a: "Yes! Guest Mode saves data on your device. However, to sync across phones and backup your logs, we recommend joining the Cloud community." },
            { q: "What do the different trophies mean?", a: "Golden means you're on fire! Ice means you've slowed down slightly, and broken means it's time for a fresh start. Bito loves you in all forms!" }
         ].map((faq, i) => (
            <div key={i} className="bg-white rounded-[32px] border border-gray-50 overflow-hidden transition-all duration-300">
               <button 
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
               >
                  <span className="font-bold text-[#2F3E2E]">{faq.q}</span>
                  <div className={`p-1.5 rounded-lg transition-transform duration-300 ${expandedFaq === i ? 'rotate-90 bg-[#A0C55F] text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <ChevronRight size={16} />
                  </div>
               </button>
               {expandedFaq === i && (
                  <div className="p-6 pt-0 text-gray-500 font-medium text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                     {faq.a}
                  </div>
               )}
            </div>
         ))}
      </div>

      <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-50 space-y-8">
         <div className="space-y-2">
            <h4 className="text-2xl font-brand font-bold text-[#2F3E2E]">Contact Support</h4>
            <p className="text-gray-400 text-sm font-medium">Message our team and we'll reply to your email soon.</p>
         </div>
         <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({...supportForm, name: e.target.value})}
                  className="bg-gray-50 border-none rounded-2xl p-4 font-medium focus:ring-2 focus:ring-[#A0C55F]/30" 
                  required
               />
               <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({...supportForm, email: e.target.value})}
                  className="bg-gray-50 border-none rounded-2xl p-4 font-medium focus:ring-2 focus:ring-[#A0C55F]/30" 
                  required
               />
            </div>
            <textarea 
               placeholder="Tell us what's on your mind..." 
               value={supportForm.message}
               onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
               className="w-full bg-gray-50 border-none rounded-[28px] p-6 font-medium h-32 focus:ring-2 focus:ring-[#A0C55F]/30 resize-none"
               required
            />
            <button 
               type="submit"
               disabled={loading}
               className="w-full bg-[#A0C55F] text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-[#8eb052] transition-all shadow-lg active:scale-95"
            >
               {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
               Send Message
            </button>
         </form>
      </div>

      {supportHistory.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-6">
            <History size={18} className="text-gray-400" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Recent Support Tickets</h4>
          </div>
          <div className="space-y-4">
            {supportHistory.map((ticket, i) => (
              <div key={ticket.id} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#A0C55F] uppercase tracking-widest">{ticket.status || 'Received'}</span>
                    <span className="text-[10px] text-gray-300 font-bold">• {new Date(ticket.timestamp).toLocaleDateString()}</span>
                  </div>
                  {isAdmin && <span className="text-[10px] bg-blue-50 text-blue-400 px-2 py-0.5 rounded-full font-bold">{ticket.email}</span>}
                </div>
                <p className="text-[#2F3E2E] font-medium text-sm line-clamp-2 italic">"{ticket.message}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 pb-32 space-y-8 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto relative min-h-screen">
      <header className="flex items-center gap-6 sticky top-0 bg-[#F8FAF5]/90 backdrop-blur-md py-4 z-20">
        <button onClick={onBack} className="bg-white p-4 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors group active:scale-90">
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-3xl font-brand font-bold text-[#2F3E2E]">
            {type === 'notifications' ? 'Notifications' : type === 'privacy' ? 'Privacy & Data' : 'Help & FAQ'}
          </h2>
          <div className="flex items-center gap-2 text-[#A0C55F] text-[10px] font-black uppercase tracking-widest">
             <Smile size={12} /> Bito Assistant
          </div>
        </div>
      </header>

      {success && (
         <div className="bg-[#EBF7DA] border border-[#A0C55F]/30 p-6 rounded-[32px] flex items-center gap-4 text-[#2F3E2E] font-bold animate-in zoom-in-95 shadow-sm">
            <div className="p-2 bg-white rounded-xl shadow-sm"><Check className="text-[#A0C55F]" /></div>
            {success}
         </div>
      )}

      {error && (
         <div className="bg-orange-50 border border-orange-200 p-6 rounded-[32px] flex flex-col gap-4 text-orange-800 font-bold animate-in zoom-in-95 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm"><AlertCircle className="text-orange-500" /></div>
              <div className="flex-1">{error}</div>
            </div>
            {notifPermission === 'denied' && (
              <div className="bg-white/50 p-4 rounded-2xl text-xs flex items-start gap-2">
                <Settings2 size={16} className="shrink-0" />
                <span>To fix: Go to browser settings -> Privacy & Security -> Site Settings -> Bito Health -> Notifications -> Set to <b>Allow</b>.</span>
              </div>
            )}
         </div>
      )}

      <div className="relative z-10">
        {type === 'notifications' && renderNotifications()}
        {type === 'privacy' && renderPrivacy()}
        {type === 'help' && renderHelp()}
      </div>

      <div className="pt-20 text-center opacity-30 pointer-events-none">
         <p className="text-xs font-black uppercase tracking-[0.4em] mb-2">Bito Wellness Platform</p>
         <p className="text-[10px] font-bold">Version 2.4.0 • Built with Love 🥑</p>
      </div>
    </div>
  );
};