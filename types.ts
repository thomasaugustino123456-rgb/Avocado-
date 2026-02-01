
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  type: MealType;
  timestamp: Date;
  userId?: string;
}

export interface UserSettings {
  notifications: {
    mealReminders: boolean;
    streakUpdates: boolean;
    tipsEncouragement: boolean;
    reminderTime: string;
  };
  privacy: {
    libraryPublic: boolean;
  };
}

export interface User {
  name: string;
  email?: string;
  age: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  height: number;
  goal: string;
  profilePic?: string;
  photoFileName?: string;
  userId?: string;
  dailyCalorieGoal: number;
  dailyStepGoal: number;
  dailyWaterGoal: number;
  settings?: UserSettings;
}

export interface DailyLog {
  date: string;
  steps: number;
  waterGlasses: number;
  meals: Meal[];
  userId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FoodAnalysis {
  foodName: string;
  calories: number;
  isHealthy: boolean;
  description: string;
  reasonUnhealthy?: string;
  recommendation?: string;
  nutritionSummary: string;
}

export interface LibraryItem {
  id: string;
  item_type: 'food' | 'chart';
  item_data: any;
  created_at: string;
  userId?: string;
}

export type Screen = 'landing' | 'onboarding' | 'home' | 'stats' | 'profile' | 'add_meal' | 'scan_food' | 'calendar' | 'notifications' | 'privacy' | 'help' | 'chat' | 'library';

export type TrophyStatus = 'golden' | 'ice' | 'broken';
