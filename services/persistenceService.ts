
import { User, DailyLog, LibraryItem, Meal, ChatMessage, FoodAnalysis } from '../types';
import { auth, db } from './firebase';
import { deleteUser } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

const convertTimestamps = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  const newData = Array.isArray(data) ? [...data] : { ...data };
  for (const key in newData) {
    const val = newData[key];
    if (val instanceof Timestamp) {
      newData[key] = val.toDate();
    } else if (typeof val === 'object') {
      newData[key] = convertTimestamps(val);
    }
  }
  return newData;
};

export const persistenceService = {
  getUser: async (): Promise<User | null> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        return userDoc.exists() ? (convertTimestamps(userDoc.data()) as User) : null;
      } catch (err) {
        console.warn("Persistence: Using cached/offline user data", err);
        return null; 
      }
    }
    return null;
  },

  saveUser: async (userData: User) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { 
          ...userData, 
          userId: currentUser.uid 
        }, { merge: true });
      } catch (err) {
        console.error("Persistence: Failed to save user", err);
      }
    }
  },

  saveMeal: async (meal: Meal) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const mealToSave = {
          ...meal,
          userId: currentUser.uid,
          created_at: serverTimestamp()
        };
        await setDoc(doc(db, 'meal_history', meal.id), mealToSave);
      } catch (err) {
        console.error("Persistence: Failed to save meal", err);
      }
    }
  },

  saveDailyLog: async (log: DailyLog) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docId = `${currentUser.uid}_${log.date}`;
        await setDoc(doc(db, 'daily_logs', docId), { 
          ...log, 
          userId: currentUser.uid 
        }, { merge: true });
      } catch (err) {
        console.error("Persistence: Failed to save daily log", err);
      }
    }
  },

  getDailyLog: async (date: string): Promise<DailyLog> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docId = `${currentUser.uid}_${date}`;
        const logDoc = await getDoc(doc(db, 'daily_logs', docId));
        if (logDoc.exists()) {
          return convertTimestamps(logDoc.data()) as DailyLog;
        }
      } catch (err) {
        console.warn("Persistence: Falling back to local log state", err);
      }
    }
    return { date, steps: 0, waterGlasses: 0, meals: [] };
  },

  saveToLibrary: async (item: Omit<LibraryItem, 'id' | 'created_at'>): Promise<LibraryItem> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Must be logged in to save to library");

    const createdAt = new Date().toISOString();
    const timestamp = Date.now();
    
    let customId = '';
    if (item.item_type === 'food') {
      const foodName = (item.item_data as FoodAnalysis).foodName?.replace(/\s+/g, '_') || 'Food';
      customId = `Food_analyzed_${foodName}_${timestamp}`;
    } else {
      customId = `Charted_${timestamp}`;
    }

    const itemToSave = { 
      ...item, 
      userId: currentUser.uid, 
      created_at: createdAt 
    };
    
    try {
      await setDoc(doc(db, 'Library', customId), itemToSave);
    } catch (err) {
      console.error("Persistence: Library save failed", err);
    }
    return { id: customId, ...itemToSave };
  },

  getLibrary: async (): Promise<LibraryItem[]> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const q = query(
          collection(db, 'Library'), 
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...convertTimestamps(doc.data()) 
        } as LibraryItem));
        
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (err) {
        console.warn("Persistence: Library load failed", err);
        return [];
      }
    }
    return [];
  },

  deleteFromLibrary: async (id: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'Library', id));
      } catch (err) {
        console.error("Persistence: Library delete failed", err);
      }
    }
  },

  saveChatMessage: async (msg: ChatMessage) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const id = `chat_${currentUser.uid}_${Date.now()}`;
        await setDoc(doc(db, 'chat_history', id), { 
          ...msg, 
          userId: currentUser.uid,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        });
      } catch (err) {
        console.error("Persistence: Chat save failed", err);
      }
    }
  },

  saveFoodScan: async (analysis: FoodAnalysis) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const id = `scan_${currentUser.uid}_${Date.now()}`;
        await setDoc(doc(db, 'food_scans', id), { 
          ...analysis, 
          userId: currentUser.uid,
          created_at: serverTimestamp()
        });
      } catch (err) {
        console.error("Persistence: Food scan save failed", err);
      }
    }
  },

  uploadProfilePicture: async (file: File | Blob): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), { 
              profilePic: base64, 
              userId: currentUser.uid 
            }, { merge: true });
          } catch (err) {
            console.error("Persistence: Photo upload failed", err);
          }
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  },

  deleteProfilePicture: async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { 
          profilePic: "", 
          userId: currentUser.uid 
        }, { merge: true });
      } catch (err) {
        console.error("Persistence: Photo delete failed", err);
      }
    }
  },

  exportUserData: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Must be logged in to export data.");

    try {
      const exportData: any = {
        exportedAt: new Date().toISOString(),
        userId: currentUser.uid,
        userProfile: {},
        dailyLogs: [],
        library: [],
        foodScans: []
      };

      // Fetch User Profile
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          exportData.userProfile = convertTimestamps(userDoc.data());
        }
      } catch (e) { console.error("Export: User profile fetch failed", e); }

      // Fetch Daily Logs
      try {
        const logsQ = query(collection(db, 'daily_logs'), where('userId', '==', currentUser.uid));
        const logsSnap = await getDocs(logsQ);
        exportData.dailyLogs = logsSnap.docs.map(d => convertTimestamps(d.data()));
      } catch (e) { 
        console.error("Export: Daily logs fetch failed", e);
        throw new Error("Daily logs permission error"); 
      }

      // Fetch Library
      try {
        const libQ = query(collection(db, 'Library'), where('userId', '==', currentUser.uid));
        const libSnap = await getDocs(libQ);
        exportData.library = libSnap.docs.map(d => convertTimestamps(d.data()));
      } catch (e) { 
        console.error("Export: Library fetch failed", e); 
        throw new Error("Library permission error"); 
      }

      // Fetch Food Scans
      try {
        const scanQ = query(collection(db, 'food_scans'), where('userId', '==', currentUser.uid));
        const scanSnap = await getDocs(scanQ);
        exportData.foodScans = scanSnap.docs.map(d => convertTimestamps(d.data()));
      } catch (e) { 
        console.error("Export: Food scans fetch failed", e); 
        throw new Error("Food scans permission error"); 
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bito_complete_health_data_${currentUser.uid}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export process failed overall:", err);
      throw err;
    }
  },

  deleteAccount: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      // First delete user document from firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      // Then delete auth user
      await deleteUser(currentUser);
    } catch (err) {
      console.error("Delete account failed:", err);
      throw err;
    }
  },

  saveSupportMessage: async (message: { name: string; email: string; message: string }) => {
    const currentUser = auth.currentUser;
    const id = `support_${Date.now()}`;
    await setDoc(doc(db, 'supportMessages', id), {
      ...message,
      userId: currentUser?.uid || 'guest',
      timestamp: serverTimestamp(),
      status: 'sent'
    });
  },

  getSupportMessages: async (isAdmin: boolean = false): Promise<any[]> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];
    
    try {
      let q;
      if (isAdmin) {
        q = query(collection(db, 'supportMessages'), orderBy('timestamp', 'desc'), limit(50));
      } else {
        q = query(
          collection(db, 'supportMessages'), 
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) }));
    } catch (err) {
      console.error("Persistence: Failed to fetch support messages", err);
      return [];
    }
  }
};