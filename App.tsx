
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Stats } from './screens/Stats';
import { Profile } from './screens/Profile';
import { MealEntry } from './screens/MealEntry';
import { FoodScanner } from './screens/FoodScanner';
import { CalendarView } from './screens/CalendarView';
import { SettingsDetails } from './screens/SettingsDetails';
import { ChatScreen } from './screens/Chat';
import { Library } from './screens/Library';
import { Auth } from './screens/Auth';
import { Screen, User, DailyLog, Meal, LibraryItem } from './types';
import { MOCK_USER } from './constants';
import { Home as HomeIcon, PieChart, Plus, User as UserIcon, Calendar, Camera, MessageCircle, Library as LibraryIcon, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User>(MOCK_USER);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    waterGlasses: 0,
    meals: [],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
      fetchLibraryItems();
    }
  }, [session]);

  const fetchUserData = async () => {
    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setUser({
        name: profile.name || 'User',
        age: profile.age,
        weight: profile.weight_kg,
        weightUnit: 'kg',
        height: profile.height_cm,
        goal: profile.goal || 'Stay Healthy',
        profilePic: profile.profile_pic,
        dailyCalorieGoal: profile.daily_calorie_goal || 2000,
        dailyStepGoal: profile.daily_step_goal || 8000,
        dailyWaterGoal: profile.daily_water_goal || 8,
      });
    }

    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (logs && logs.length > 0) {
      setStreak(logs.length);
      setHistory(logs.reverse());
    } else {
      setStreak(0);
      setHistory([]);
    }

    const log = logs?.find(l => l.date === today);

    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    setDailyLog({
      date: today,
      steps: log?.steps || 0,
      waterGlasses: log?.water_glasses || 0,
      meals: (meals || []).map(m => ({
        id: m.id,
        name: m.food_name,
        calories: m.calories,
        type: m.meal_type,
        timestamp: new Date(m.created_at)
      })),
    });
  };

  const fetchLibraryItems = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('library_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLibraryItems(data);
  };

  const saveToLibrary = async (type: 'food' | 'chart', data: any) => {
    if (!session?.user) return;
    const { data: newItem, error } = await supabase.from('library_items').insert({
      user_id: session.user.id,
      item_type: type,
      item_data: data
    }).select().single();

    if (newItem) {
      setLibraryItems(prev => [newItem, ...prev]);
      return true;
    }
    return false;
  };

  const removeFromLibrary = async (id: string) => {
    const { error } = await supabase.from('library_items').delete().eq('id', id);
    if (!error) {
      setLibraryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const syncDailyStats = async (steps: number, water: number) => {
    if (!session?.user) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_logs').upsert({
      user_id: session.user.id,
      date: today,
      steps,
      water_glasses: water
    }, { onConflict: 'user_id, date' });
  };

  const handleAddMeal = async (meal: Meal) => {
    if (session?.user) {
      const { data } = await supabase.from('meals').insert({
        user_id: session.user.id,
        food_name: meal.name,
        calories: meal.calories,
        meal_type: meal.type,
      }).select().single();

      if (data) {
        setDailyLog(prev => ({
          ...prev,
          meals: [...prev.meals, { ...meal, id: data.id }]
        }));
      }
    }
    setCurrentScreen('home');
  };

  const handleUpdateWater = (amount: number) => {
    const newVal = Math.max(0, dailyLog.waterGlasses + amount);
    setDailyLog(prev => ({ ...prev, waterGlasses: newVal }));
    syncDailyStats(dailyLog.steps, newVal);
  };

  const handleUpdateSteps = (amount: number) => {
    const newVal = Math.max(0, dailyLog.steps + amount);
    setDailyLog(prev => ({ ...prev, steps: newVal }));
    syncDailyStats(newVal, dailyLog.waterGlasses);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAF5]">
        <Loader2 className="animate-spin text-[#A0C55F]" size={48} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home user={user} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} />;
      case 'stats':
        return <Stats history={history} onSaveChart={(data) => saveToLibrary('chart', data)} />;
      case 'library':
        return <Library items={libraryItems} onDelete={removeFromLibrary} onAddToDaily={handleAddMeal} />;
      case 'profile':
        return <Profile user={user} setUser={setUser} onNavigate={(s) => setCurrentScreen(s)} />;
      case 'calendar':
        return <CalendarView />;
      case 'add_meal':
        return <MealEntry onAdd={handleAddMeal} onCancel={() => setCurrentScreen('home')} />;
      case 'scan_food':
        return <FoodScanner onCancel={() => setCurrentScreen('home')} onAddMeal={handleAddMeal} onSaveToLibrary={(food) => saveToLibrary('food', food)} />;
      case 'notifications':
        return <SettingsDetails type="notifications" onBack={() => setCurrentScreen('profile')} />;
      case 'privacy':
        return <SettingsDetails type="privacy" onBack={() => setCurrentScreen('profile')} />;
      case 'help':
        return <SettingsDetails type="help" onBack={() => setCurrentScreen('profile')} />;
      case 'chat':
        return <ChatScreen onBack={() => setCurrentScreen('home')} />;
      default:
        return <Home user={user} dailyLog={dailyLog} streak={streak} onUpdateWater={handleUpdateWater} onUpdateSteps={handleUpdateSteps} onAddMealClick={() => setCurrentScreen('add_meal')} />;
    }
  };

  const isStandaloneScreen = ['add_meal', 'scan_food', 'notifications', 'privacy', 'help'].includes(currentScreen);
  const isChatScreen = currentScreen === 'chat';

  const NavItem = ({ screen, icon: Icon, label }: { screen: Screen, icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentScreen(screen)}
      className={`flex lg:flex-row flex-col items-center gap-2 lg:gap-4 p-3 lg:px-6 lg:py-4 rounded-2xl transition-all w-full lg:justify-start ${
        currentScreen === screen 
        ? 'text-[#A0C55F] lg:bg-[#F8FAF5] lg:text-[#2F3E2E]' 
        : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={currentScreen === screen ? 3 : 2} />
      <span className={`text-[10px] lg:text-base font-bold ${currentScreen === screen ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex flex-col lg:flex-row overflow-hidden">
      {!isStandaloneScreen && (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-6 shadow-sm z-50">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-[#DFF2C2] rounded-xl flex items-center justify-center font-brand font-bold text-[#2F3E2E]">A</div>
            <h1 className="text-xl font-brand font-bold text-[#2F3E2E]">Avocado</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem screen="home" icon={HomeIcon} label="Home" />
            <NavItem screen="calendar" icon={Calendar} label="Log & Trophy" />
            <NavItem screen="chat" icon={MessageCircle} label="AI Chat" />
            <NavItem screen="scan_food" icon={Camera} label="Scan Food" />
            <NavItem screen="library" icon={LibraryIcon} label="My Library" />
            <NavItem screen="stats" icon={PieChart} label="Statistics" />
            <NavItem screen="profile" icon={UserIcon} label="My Profile" />
          </nav>

          <button 
            onClick={() => setCurrentScreen('add_meal')}
            className="w-full bg-[#FFE66D] p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 font-bold text-[#2F3E2E] active:scale-95 transition-all mt-auto"
          >
            <Plus size={24} />
            Manual Log
          </button>
        </aside>
      )}

      <main className={`flex-1 overflow-y-auto ${!isStandaloneScreen ? 'pb-24 lg:pb-0' : ''}`}>
        <div className={`mx-auto w-full ${!isStandaloneScreen && !isChatScreen ? 'max-w-6xl' : 'h-full'}`}>
          {renderScreen()}
        </div>
      </main>

      {!isStandaloneScreen && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex justify-between items-center rounded-t-[32px] shadow-2xl z-50">
          <button onClick={() => setCurrentScreen('home')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'home' ? 'text-[#A0C55F] scale-110' : 'text-gray-400'}`}>
            <HomeIcon size={24} /><span className="text-[10px] font-bold">Home</span>
          </button>
          <button onClick={() => setCurrentScreen('library')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'library' ? 'text-[#A0C55F] scale-110' : 'text-gray-400'}`}>
            <LibraryIcon size={24} /><span className="text-[10px] font-bold">Library</span>
          </button>
          <button onClick={() => setCurrentScreen('add_meal')} className="bg-[#FFE66D] p-3 rounded-2xl -mt-10 shadow-lg active:scale-95 transition-transform">
            <Plus size={28} className="text-[#2F3E2E]" />
          </button>
          <button onClick={() => setCurrentScreen('stats')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'stats' ? 'text-[#A0C55F] scale-110' : 'text-gray-400'}`}>
            <PieChart size={24} /><span className="text-[10px] font-bold">Stats</span>
          </button>
          <button onClick={() => setCurrentScreen('profile')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'profile' ? 'text-[#A0C55F] scale-110' : 'text-gray-400'}`}>
            <UserIcon size={24} /><span className="text-[10px] font-bold">Me</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
