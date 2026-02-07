
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { persistenceService } from './services/persistenceService';
import { auth, messaging } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { onMessage, getToken } from 'firebase/messaging';
import { Auth } from './screens/Auth';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Stats } from './screens/Stats';
import { Profile } from './screens/Profile';
import { MealEntry } from './screens/MealEntry';
import { FoodScanner } from './screens/FoodScanner';
import { CalendarView } from './screens/CalendarView';
import { ChatScreen } from './screens/Chat';
import { Library } from './screens/Library';
import { Landing } from './screens/Landing';
import { Screen, User, DailyLog, Meal, LibraryItem, FoodAnalysis } from './types';
import { Home as HomeIcon, PieChart, Plus, User as UserIcon, Calendar, Camera, MessageCircle, Library as LibraryIcon, Loader2, Cloud, CloudOff, Settings, Video, BellRing, X } from 'lucide-react';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    waterGlasses: 0,
    meals: [],
  });
  
  const [activeNotification, setActiveNotification] = useState<{title: string, body: string} | null>(null);

  // Register Service Worker & Handle Foreground Messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./firebase-messaging-sw.js')
        .then((reg) => console.log('Bito Messaging SW active'))
        .catch((err) => console.warn('SW failed', err));
    }

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (payload.notification) {
          setActiveNotification({
            title: payload.notification.title || 'Bito Nudge!',
            body: payload.notification.body || 'Time for a health check!'
          });
          audioService.playIce();
          setTimeout(() => setActiveNotification(null), 8000);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Sync Messaging Token whenever profile is active with the REAL VAPID KEY
  useEffect(() => {
    const syncToken = async () => {
      if (messaging && userProfile && !isGuest) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            // Updated with User's Real VAPID Key
            const VAPID_KEY = 'BO0Rz9AB9uKWj7qtWWqcJUG3B0X8QRVe5WR40zS6NFVlNkVm5xu8G95ktzkVU9bkAiZ58K_2M7zS_LOjrDYCkEg';
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) await persistenceService.saveMessagingToken(token);
          }
        } catch (err) {
          console.warn("Token sync skipped:", err);
        }
      }
    };
    syncToken();
  }, [userProfile, isGuest]);

  // Smart Nudge Engine (Duolingo style local reminders)
  useEffect(() => {
    const nudgeInterval = setInterval(() => {
      if (!userProfile?.settings?.notifications?.mealReminders) return;
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const targetTime = userProfile.settings.notifications.reminderTime || '08:00';

      // Trigger if time matches and user hasn't logged anything today
      if (currentTime === targetTime && dailyLog.meals.length === 0) {
        setActiveNotification({
          title: "Bito misses you! 🥑",
          body: "Your streak is at risk! Log your breakfast now to keep it alive. ✨"
        });
        audioService.playIce();
      }
    }, 60000);

    return () => clearInterval(nudgeInterval);
  }, [userProfile, dailyLog]);

  const refreshData = useCallback(async () => {
    if (!userProfile) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const [log, lib] = await Promise.all([
        persistenceService.getDailyLog(today),
        persistenceService.getLibrary()
      ]);
      if (log) setDailyLog(log);
      if (lib) setLibraryItems(lib);

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLog = await persistenceService.getDailyLog(dateStr);
        last7Days.push({
          date: dateStr,
          steps: dayLog.steps || 0,
          water: dayLog.waterGlasses || 0,
          calories: dayLog.meals.reduce((sum, m) => sum + m.calories, 0),
          weight: userProfile?.weight || 70
        });
      }
      setHistoryData(last7Days);
    } catch (err: any) {
      console.warn("Refresh failed:", err.message);
    }
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsGuest(false);
        setShowLanding(false);
        setIsLoading(true);
        try {
          let profile = await persistenceService.getUser();
          if (!profile) {
            const newProfile: User = {
              name: firebaseUser.displayName || 'Friend',
              email: firebaseUser.email || '',
              age: 25,
              weight: 70,
              weightUnit: 'kg',
              height: 170,
              goal: 'Stay healthy 🥑',
              dailyCalorieGoal: 2000,
              dailyStepGoal: 8000,
              dailyWaterGoal: 8,
              userId: firebaseUser.uid,
              photoFileName: "",
              settings: {
                notifications: { mealReminders: true, streakUpdates: true, tipsEncouragement: true, reminderTime: '08:00' },
                privacy: { libraryPublic: false }
              }
            };
            await persistenceService.saveUser(newProfile);
            profile = newProfile;
          }
          setUserProfile(profile);
        } catch (err) {
          console.error("Auth init error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        if (!isGuest) setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isGuest]);

  useEffect(() => {
    if (userProfile) refreshData();
  }, [userProfile, refreshData]);

  useEffect(() => {
    if (isGuest && !user) {
        const loadGuest = async () => {
            setIsLoading(true);
            try {
              const profile = await persistenceService.getUser();
              setUserProfile(profile || {
                name: 'Guest',
                age: 25,
                weight: 70,
                weightUnit: 'kg',
                height: 170,
                goal: 'Explore 🥑',
                dailyCalorieGoal: 2000,
                dailyStepGoal: 8000,
                dailyWaterGoal: 8,
                settings: {
                    notifications: { mealReminders: true, streakUpdates: true, tipsEncouragement: true, reminderTime: '08:00' },
                    privacy: { libraryPublic: false }
                }
              });
            } finally {
              setIsLoading(false);
            }
        };
        loadGuest();
    }
  }, [isGuest, user]);

  const handleOnboardingComplete = async (newUser: User) => {
    setIsLoading(true);
    await persistenceService.saveUser(newUser);
    setUserProfile(newUser);
    setCurrentScreen('home');
    setIsLoading(false);
  };

  const handleUpdateWater = async (amount: number) => {
    const newVal = Math.max(0, dailyLog.waterGlasses + amount);
    const updatedLog = { ...dailyLog, waterGlasses: newVal };
    setDailyLog(updatedLog);
    await persistenceService.saveDailyLog(updatedLog);
  };

  const handleUpdateSteps = async (amount: number) => {
    const newVal = Math.max(0, dailyLog.steps + amount);
    const updatedLog = { ...dailyLog, steps: newVal };
    setDailyLog(updatedLog);
    await persistenceService.saveDailyLog(updatedLog);
  };

  const handleAddMeal = async (meal: Meal) => {
    const updatedLog = { ...dailyLog, meals: [...dailyLog.meals, meal] };
    setDailyLog(updatedLog);
    await persistenceService.saveMeal(meal);
    await persistenceService.saveDailyLog(updatedLog);
    setCurrentScreen('home');
  };

  const handleSaveToLibrary = async (type: 'food' | 'chart', data: any) => {
    try {
      await persistenceService.saveToLibrary({ item_type: type, item_data: data });
      await refreshData();
    } catch (err: any) {
      console.error("Library save error:", err);
    }
  };

  const renderScreen = () => {
    if (!userProfile) return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#A0C55F]" size={48} />
      </div>
    );

    switch (currentScreen) {
      case 'home': return <Home user={userProfile} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} isCreatorMode={isCreatorMode} setIsCreatorMode={setIsCreatorMode} />;
      case 'stats': return <Stats history={historyData} onSaveChart={(data) => handleSaveToLibrary('chart', { title: 'Weekly Snapshot', ...data })} />;
      case 'calendar': return <CalendarView />;
      case 'add_meal': return <MealEntry onAdd={handleAddMeal} onCancel={() => setCurrentScreen('home')} />;
      case 'library': return <Library items={libraryItems} onDelete={async (id) => { await persistenceService.deleteFromLibrary(id); refreshData(); }} onAddToDaily={handleAddMeal} />;
      case 'profile': return <Profile user={userProfile} isGuest={isGuest} setUser={async (u) => { await persistenceService.saveUser(u); setUserProfile(u); }} onNavigate={(s) => setCurrentScreen(s)} onExitGuest={() => { setIsGuest(false); setUserProfile(null); setUser(null); }} />;
      case 'chat': return <ChatScreen onBack={() => setCurrentScreen('home')} onSaveInsight={(data) => handleSaveToLibrary('chart', data)} />;
      case 'scan_food': return <FoodScanner onCancel={() => setCurrentScreen('home')} onAddMeal={handleAddMeal} onSaveToLibrary={(data) => handleSaveToLibrary('food', data)} />;
      default: return <Home user={userProfile} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} isCreatorMode={isCreatorMode} setIsCreatorMode={setIsCreatorMode} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAF5] gap-6">
        <div className="w-20 h-20 border-8 border-[#DFF2C2] border-t-[#A0C55F] rounded-full animate-spin" />
        <p className="font-brand font-bold text-[#2F3E2E] animate-pulse text-xl">Waking up Bito...</p>
      </div>
    );
  }

  if (showLanding && !user && !isGuest) return <Landing onGetStarted={() => setShowLanding(false)} />;
  if (!user && !isGuest) return <Auth onGuestLogin={() => setIsGuest(true)} onBack={() => setShowLanding(true)} />;
  if (!userProfile || !userProfile.name) return <Onboarding onComplete={handleOnboardingComplete} />;

  const isStandaloneScreen = ['add_meal', 'scan_food', 'chat'].includes(currentScreen);

  return (
    <div className="h-[100dvh] bg-[#F8FAF5] flex flex-col lg:flex-row overflow-hidden relative">
      {activeNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-md bg-[#2F3E2E] text-white p-6 rounded-[32px] shadow-2xl animate-in slide-in-from-top-10 duration-500 flex items-center gap-5 border border-white/10">
          <div className="bg-[#A0C55F] p-3 rounded-2xl shadow-lg shrink-0">
             <BellRing size={24} className="text-white animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
             <h4 className="font-brand font-bold text-lg leading-none">{activeNotification.title}</h4>
             <p className="text-sm text-gray-400 font-medium">{activeNotification.body}</p>
          </div>
          <button onClick={() => setActiveNotification(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
             <X size={20} className="text-gray-500" />
          </button>
        </div>
      )}

      {!isStandaloneScreen && (
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 p-8 z-50 shadow-sm animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-4 mb-12 px-2 cursor-pointer" onClick={() => setCurrentScreen('home')}>
            <div className="w-12 h-12 bg-[#A0C55F] rounded-2xl flex items-center justify-center font-brand font-black text-white text-2xl shadow-lg">B</div>
            <h1 className="text-2xl font-brand font-black text-[#2F3E2E]">Bito</h1>
          </div>
          <nav className="flex-1 space-y-2">
            {[
              { s: 'home', i: HomeIcon, l: 'Dashboard' },
              { s: 'stats', i: PieChart, l: 'Analytics' },
              { s: 'calendar', i: Calendar, l: 'Log' },
              { s: 'chat', i: MessageCircle, l: 'AI Coach' },
              { s: 'scan_food', i: Camera, l: 'Scan Food' },
              { s: 'library', i: LibraryIcon, l: 'Library' },
              { s: 'profile', i: UserIcon, l: 'Profile' },
            ].map(({ s, i: Icon, l }) => (
              <button key={s} onClick={() => setCurrentScreen(s as Screen)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full group active:scale-95 ${currentScreen === s ? 'bg-[#A0C55F] text-white shadow-lg shadow-[#A0C55F]/20' : 'text-gray-400 hover:bg-[#F8FAF5] hover:text-[#2F3E2E]'}`}>
                <Icon size={24} />
                <span className="font-bold text-lg">{l}</span>
              </button>
            ))}
          </nav>
          <div className={`mt-auto p-4 rounded-2xl flex items-center gap-3 border ${isGuest ? 'bg-orange-50 border-orange-100 text-orange-400' : 'bg-blue-50 border-blue-100 text-blue-400'}`}>
             {isGuest ? <CloudOff size={18} /> : <Cloud size={18} />}
             <span className="text-[10px] font-bold uppercase tracking-widest">{isGuest ? 'Guest Mode' : 'Connected'}</span>
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col relative overflow-hidden ${!isStandaloneScreen ? 'pt-20 lg:pt-0' : ''}`}>
        <div key={currentScreen} className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-32 lg:pb-8">
           {renderScreen()}
        </div>
      </main>

      {!isStandaloneScreen && (
        <nav className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-2xl px-2 py-3 rounded-[36px] shadow-2xl z-[100] border border-white/50 animate-in slide-in-from-bottom duration-700">
          <div className="flex justify-around items-center">
            {[
              { s: 'home', i: HomeIcon, l: 'Home' },
              { s: 'stats', i: PieChart, l: 'Stats' },
              { s: 'calendar', i: Calendar, l: 'Log' },
              { s: 'scan_food', i: Camera, l: 'Scan' },
              { s: 'chat', i: MessageCircle, l: 'Chat' },
            ].map(({ s, i: Icon, l }) => (
              <button key={s} onClick={() => setCurrentScreen(s as Screen)} className={`flex flex-col items-center justify-center gap-1 transition-all ${currentScreen === s ? 'text-[#A0C55F]' : 'text-gray-400'}`}>
                <div className={`p-3 rounded-2xl ${currentScreen === s ? 'bg-[#A0C55F] text-white shadow-lg' : ''}`}><Icon size={22} /></div>
                <span className="text-[9px] font-black uppercase tracking-tight">{l}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
