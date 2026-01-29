
import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { persistenceService } from './services/persistenceService';
import { Onboarding } from './screens/Onboarding';
import { Auth } from './screens/Auth';
import { Home } from './screens/Home';
import { Stats } from './screens/Stats';
import { Profile } from './screens/Profile';
import { MealEntry } from './screens/MealEntry';
import { FoodScanner } from './screens/FoodScanner';
import { CalendarView } from './screens/CalendarView';
import { ChatScreen } from './screens/Chat';
import { Library } from './screens/Library';
import { Screen, User, DailyLog, Meal, LibraryItem } from './types';
import { Home as HomeIcon, PieChart, Plus, User as UserIcon, Calendar, Camera, MessageCircle, Library as LibraryIcon, Loader2, CloudOff } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        // 1. Try to load user profile
        let profile = await persistenceService.getUser();
        
        // 2. If user is logged in but has no profile in Firestore, create a default one
        if (!profile) {
          const defaultProfile: User = {
            name: user.displayName || 'Friend',
            email: user.email || '',
            age: 25,
            weight: 70,
            weightUnit: 'kg',
            height: 170,
            goal: 'Stay Healthy 🥑',
            dailyCalorieGoal: 2000,
            dailyStepGoal: 8000,
            dailyWaterGoal: 8,
          };
          await persistenceService.saveUser(defaultProfile);
          profile = defaultProfile;
        }
        
        setUserProfile(profile);
        refreshData();
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [log, lib] = await Promise.all([
      persistenceService.getDailyLog(today),
      persistenceService.getLibrary()
    ]);
    setDailyLog(log);
    setLibraryItems(lib);
  };

  const handleOnboardingComplete = async (newUser: User) => {
    setUserProfile(newUser);
    await persistenceService.saveUser(newUser);
    setCurrentScreen('home');
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
    await persistenceService.saveDailyLog(updatedLog);
    setCurrentScreen('home');
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAF5] gap-6">
        <div className="w-20 h-20 border-8 border-[#DFF2C2] border-t-[#A0C55F] rounded-full animate-spin" />
        <p className="font-brand font-bold text-[#2F3E2E] animate-pulse">Bito is getting ready...</p>
      </div>
    );
  }

  if (!firebaseUser) return <Auth />;
  if (!userProfile) return <Onboarding onComplete={handleOnboardingComplete} />;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home user={userProfile} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} />;
      case 'library':
        return <Library items={libraryItems} onDelete={async (id) => { await persistenceService.deleteFromLibrary(id); refreshData(); }} onAddToDaily={handleAddMeal} />;
      case 'profile':
        return <Profile user={userProfile} setUser={async (u) => { await persistenceService.saveUser(u); setUserProfile(u); }} onNavigate={(s) => setCurrentScreen(s)} />;
      case 'chat':
        return <ChatScreen onBack={() => setCurrentScreen('home')} />;
      case 'scan_food':
        return <FoodScanner onCancel={() => setCurrentScreen('home')} onAddMeal={handleAddMeal} onSaveToLibrary={async (food) => { await persistenceService.saveToLibrary({ item_type: 'food', item_data: food }); refreshData(); }} />;
      default:
        return <Home user={userProfile} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} />;
    }
  };

  const isStandaloneScreen = ['add_meal', 'scan_food'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex flex-col lg:flex-row overflow-hidden">
      {!isStandaloneScreen && (
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 p-8 z-50">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-[#A0C55F] rounded-2xl flex items-center justify-center font-brand font-black text-white text-2xl shadow-lg">B</div>
            <h1 className="text-2xl font-brand font-black text-[#2F3E2E]">Bito</h1>
          </div>
          <nav className="flex-1 space-y-2">
            {[
              { s: 'home', i: HomeIcon, l: 'Dashboard' },
              { s: 'chat', i: MessageCircle, l: 'AI Coach' },
              { s: 'scan_food', i: Camera, l: 'Scan Food' },
              { s: 'library', i: LibraryIcon, l: 'Library' },
              { s: 'profile', i: UserIcon, l: 'Profile' },
            ].map(({ s, i: Icon, l }) => (
              <button 
                key={s}
                onClick={() => setCurrentScreen(s as Screen)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full ${currentScreen === s ? 'bg-[#A0C55F] text-white shadow-lg' : 'text-gray-400 hover:bg-[#F8FAF5]'}`}
              >
                <Icon size={24} />
                <span className="font-bold text-lg">{l}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-orange-50 rounded-2xl flex items-center gap-3 text-orange-400">
             <CloudOff size={18} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Local-First Mode</span>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl">
          {renderScreen()}
        </div>
      </main>

      {!isStandaloneScreen && (
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl p-4 flex justify-between items-center rounded-[32px] shadow-2xl z-50">
          {[
            { s: 'home', i: HomeIcon },
            { s: 'scan_food', i: Camera },
            { s: 'chat', i: MessageCircle },
            { s: 'library', i: LibraryIcon },
            { s: 'profile', i: UserIcon },
          ].map(({ s, i: Icon }) => (
            <button key={s} onClick={() => setCurrentScreen(s as Screen)} className={`p-3 rounded-2xl ${currentScreen === s ? 'bg-[#A0C55F] text-white' : 'text-gray-400'}`}>
              <Icon size={24} />
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
