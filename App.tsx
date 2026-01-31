
import React, { useState, useEffect, useCallback } from 'react';
import { persistenceService } from './services/persistenceService';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
import { Home as HomeIcon, PieChart, Plus, User as UserIcon, Calendar, Camera, MessageCircle, Library as LibraryIcon, Loader2, Cloud, CloudOff } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [streak, setStreak] = useState(0);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    waterGlasses: 0,
    meals: [],
  });

  const refreshData = useCallback(async () => {
    if (!auth.currentUser && !isGuest) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const [log, lib] = await Promise.all([
        persistenceService.getDailyLog(today),
        persistenceService.getLibrary()
      ]);
      if (log) setDailyLog(log);
      if (lib) setLibraryItems(lib);
    } catch (err: any) {
      console.warn("Bito couldn't fetch latest data:", err.message);
    }
  }, [isGuest]);

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
              photoFileName: ""
            };
            await persistenceService.saveUser(newProfile);
            profile = newProfile;
          }
          setUserProfile(profile);
          await refreshData();
        } catch (err) {
          console.error("Auth init error:", err);
        } finally {
          setIsLoading(false);
        }
      } else if (!isGuest) {
        // Only keep loading false if we aren't waiting for a guest login
        if (!isGuest) setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [refreshData, isGuest]);

  useEffect(() => {
    if (isGuest && !user) {
        const loadGuest = async () => {
            setIsLoading(true);
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
            });
            await refreshData();
            setIsLoading(false);
        };
        loadGuest();
    }
  }, [isGuest, user, refreshData]);

  const handleOnboardingComplete = async (newUser: User) => {
    await persistenceService.saveUser(newUser);
    setUserProfile(newUser);
    setCurrentScreen('home');
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setShowLanding(false);
  };

  const handleUpdateWater = async (amount: number) => {
    const newVal = Math.max(0, dailyLog.waterGlasses + amount);
    const updatedLog = { ...dailyLog, waterGlasses: newVal };
    setDailyLog(updatedLog);
    await persistenceService.saveDailyLog(updatedLog);
    await refreshData();
  };

  const handleUpdateSteps = async (amount: number) => {
    const newVal = Math.max(0, dailyLog.steps + amount);
    const updatedLog = { ...dailyLog, steps: newVal };
    setDailyLog(updatedLog);
    await persistenceService.saveDailyLog(updatedLog);
    await refreshData();
  };

  const handleAddMeal = async (meal: Meal) => {
    const updatedLog = { 
      ...dailyLog, 
      meals: [...dailyLog.meals, meal]
    };
    setDailyLog(updatedLog);
    await persistenceService.saveMeal(meal);
    await persistenceService.saveDailyLog(updatedLog);
    await refreshData();
    setCurrentScreen('home');
  };

  const handleSaveToLibrary = async (food: FoodAnalysis) => {
    try {
      await persistenceService.saveToLibrary({ 
        item_type: 'food', 
        item_data: food 
      });
      await refreshData();
    } catch (err) {
      console.error("Library save error:", err);
      alert("Oops! Bito couldn't save that to your cloud library. Are you logged in?");
      throw err;
    }
  };

  const handleSaveChartToLibrary = async (chartData: any) => {
    try {
      await persistenceService.saveToLibrary({
        item_type: 'chart',
        item_data: chartData
      });
      await refreshData();
    } catch (err) {
      console.error("Chart save error:", err);
      alert("Bito couldn't archive this snapshot. Try logging in first!");
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAF5] gap-6">
        <div className="w-20 h-20 border-8 border-[#DFF2C2] border-t-[#A0C55F] rounded-full animate-spin" />
        <p className="font-brand font-bold text-[#2F3E2E] animate-pulse">Waking up Bito...</p>
      </div>
    );
  }

  if (showLanding && !user && !isGuest) {
    return <Landing onGetStarted={() => setShowLanding(false)} />;
  }
  
  if (!user && !isGuest) {
    return <Auth onGuestLogin={handleGuestLogin} onBack={() => setShowLanding(true)} />;
  }

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home user={userProfile} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} />;
      case 'stats':
        return <Stats history={[]} onSaveChart={handleSaveChartToLibrary} />;
      case 'calendar':
        return <CalendarView />;
      case 'add_meal':
        return <MealEntry onAdd={handleAddMeal} onCancel={() => setCurrentScreen('home')} />;
      case 'library':
        return <Library items={libraryItems} onDelete={async (id) => { await persistenceService.deleteFromLibrary(id); refreshData(); }} onAddToDaily={handleAddMeal} />;
      case 'profile':
        return <Profile user={userProfile} isGuest={isGuest} setUser={async (u) => { await persistenceService.saveUser(u); setUserProfile(u); }} onNavigate={(s) => setCurrentScreen(s)} onExitGuest={() => setIsGuest(false)} />;
      case 'chat':
        return <ChatScreen onBack={() => setCurrentScreen('home')} />;
      case 'scan_food':
        return <FoodScanner onCancel={() => setCurrentScreen('home')} onAddMeal={handleAddMeal} onSaveToLibrary={handleSaveToLibrary} />;
      default:
        return <Home user={userProfile} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} />;
    }
  };

  const isStandaloneScreen = ['add_meal', 'scan_food'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex flex-col lg:flex-row overflow-hidden">
      {!isStandaloneScreen && (
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 p-8 z-50 shadow-sm">
          <div className="flex items-center gap-4 mb-12 px-2">
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
              <button 
                key={s}
                onClick={() => setCurrentScreen(s as Screen)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full group ${
                  currentScreen === s 
                  ? 'bg-[#A0C55F] text-white shadow-lg shadow-[#A0C55F]/20' 
                  : 'text-gray-400 hover:bg-[#F8FAF5] hover:text-[#2F3E2E]'
                }`}
              >
                <Icon size={24} className={currentScreen === s ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-lg">{l}</span>
              </button>
            ))}
          </nav>

          <div className={`mt-auto p-4 rounded-2xl flex items-center gap-3 border ${isGuest ? 'bg-orange-50 border-orange-100 text-orange-400' : 'bg-blue-50 border-blue-100 text-blue-400'}`}>
             {isGuest ? <CloudOff size={18} /> : <Cloud size={18} />}
             <span className="text-[10px] font-bold uppercase tracking-widest">{isGuest ? 'Guest Mode' : 'Cloud Sync On'}</span>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl relative min-h-full">
           <div key={currentScreen} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards">
             {renderScreen()}
           </div>
        </div>
      </main>

      {!isStandaloneScreen && (
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl p-3 flex justify-between items-center rounded-[32px] shadow-2xl z-50 border border-white/50">
          {[
            { s: 'home', i: HomeIcon, l: 'Home' },
            { s: 'stats', i: PieChart, l: 'Stats' },
            { s: 'scan_food', i: Camera, l: 'Scan' },
            { s: 'chat', i: MessageCircle, l: 'Chat' },
            { s: 'profile', i: UserIcon, l: 'You' },
          ].map(({ s, i: Icon, l }) => (
            <button 
              key={s} 
              onClick={() => setCurrentScreen(s as Screen)} 
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all w-full active:scale-90 ${
                currentScreen === s ? 'text-[#A0C55F]' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${currentScreen === s ? 'bg-[#A0C55F] text-white shadow-lg shadow-[#A0C55F]/20 -translate-y-2' : ''}`}>
                <Icon size={24} />
              </div>
              <span className={`text-[10px] font-black tracking-wide transition-all ${currentScreen === s ? 'text-[#2F3E2E] opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{l}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
