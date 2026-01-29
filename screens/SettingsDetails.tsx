
import React from 'react';
import { ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, ToggleLeft as ToggleIcon } from 'lucide-react';
import { Screen } from '../types';

interface SettingsDetailsProps {
  type: 'notifications' | 'privacy' | 'help';
  onBack: () => void;
}

export const SettingsDetails: React.FC<SettingsDetailsProps> = ({ type, onBack }) => {
  const titles = {
    notifications: 'Notifications',
    privacy: 'Privacy & Security',
    help: 'Help Center'
  };

  const icons = {
    notifications: Bell,
    privacy: Shield,
    help: HelpCircle
  };

  const Icon = icons[type];

  const renderNotifications = () => (
    <div className="space-y-4">
      {[
        { title: 'Daily Reminders', desc: 'Get nudged to log your meals.' },
        { title: 'Goal Achievements', desc: 'Celebrate when you hit your targets!' },
        { title: 'Water Tracking', desc: 'Hydration alerts throughout the day.' },
        { title: 'Streak Alerts', desc: 'Keep your trophy golden!' },
      ].map((item, i) => (
        <div key={i} className="bg-white p-6 rounded-[32px] flex justify-between items-center border border-gray-50">
          <div className="space-y-1">
            <p className="font-bold text-[#2F3E2E]">{item.title}</p>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
          <div className="w-12 h-6 bg-[#A0C55F] rounded-full relative p-1 cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-4">
      {[
        { title: 'Face ID / Touch ID', desc: 'Secure your health data.' },
        { title: 'Personalized AI', desc: 'Help Avocado learn your preferences.' },
        { title: 'Clear History', desc: 'Reset your logs and start fresh.' },
        { title: 'Delete Account', desc: 'Permanently remove your profile.', danger: true },
      ].map((item, i) => (
        <div key={i} className={`bg-white p-6 rounded-[32px] flex justify-between items-center border border-gray-50 ${item.danger ? 'border-orange-100 hover:bg-orange-50 cursor-pointer transition-all' : ''}`}>
          <div className="space-y-1">
            <p className={`font-bold ${item.danger ? 'text-orange-500' : 'text-[#2F3E2E]'}`}>{item.title}</p>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
          {!item.danger ? (
            <div className="w-12 h-6 bg-gray-200 rounded-full relative p-1 cursor-pointer">
               <div className="w-4 h-4 bg-white rounded-full absolute left-1 shadow-sm" />
            </div>
          ) : <ChevronRight size={20} className="text-orange-300" />}
        </div>
      ))}
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-4">
      <div className="bg-[#EBF7DA] p-8 rounded-[40px] text-center space-y-4">
        <HelpCircle size={48} className="mx-auto text-[#A0C55F]" />
        <h3 className="text-xl font-bold text-[#2F3E2E]">How can we help?</h3>
        <p className="text-gray-600 text-sm">Avocado is here to support your journey. Check our FAQs or talk to us!</p>
      </div>
      
      {[
        'How does AI scan my food?',
        'Can I customize my goals?',
        'What do the trophy states mean?',
        'Syncing with Apple Health',
        'Contact Support'
      ].map((item, i) => (
        <button key={i} className="w-full bg-white p-6 rounded-[32px] border border-gray-50 flex justify-between items-center group">
          <p className="font-bold text-[#2F3E2E] group-hover:text-[#A0C55F] transition-all">{item}</p>
          <ChevronRight size={20} className="text-gray-200 group-hover:text-[#A0C55F] transition-all" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 pb-32 space-y-8 animate-in slide-in-from-right duration-300 max-w-2xl mx-auto">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="bg-white p-3 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-brand font-bold text-[#2F3E2E]">{titles[type]}</h2>
      </header>

      {type === 'notifications' && renderNotifications()}
      {type === 'privacy' && renderPrivacy()}
      {type === 'help' && renderHelp()}
    </div>
  );
};
