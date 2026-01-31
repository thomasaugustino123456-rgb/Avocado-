import { User, DailyLog, LibraryItem, Meal, ChatMessage, FoodAnalysis } from '../types';
import { auth, db } from './firebase';
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
  Timestamp
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
      // We still return the object so the UI can update locally
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
  }
};