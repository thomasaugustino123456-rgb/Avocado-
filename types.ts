
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  type: MealType;
  timestamp: Date;
  userId?: string; // Added for top-level collection association
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
  photoFileName?: string; // Added
  userId?: string; // Added
  dailyCalorieGoal: number;
  dailyStepGoal: number;
  dailyWaterGoal: number;
}

export interface DailyLog {
  date: string;
  steps: number;
  waterGlasses: number;
  meals: Meal[];
  userId?: string; // Added
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
  userId?: string; // Added
}

export type Screen = 'landing' | 'onboarding' | 'home' | 'stats' | 'profile' | 'add_meal' | 'scan_food' | 'calendar' | 'notifications' | 'privacy' | 'help' | 'chat' | 'library';

export type TrophyStatus = 'golden' | 'ice' | 'broken';
