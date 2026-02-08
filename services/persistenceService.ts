
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
  limit,
  arrayUnion
} from 'firebase/firestore';

const convertTimestamps = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const newData = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in newData) {
    const val = newData[key];
    
    if (val && typeof val === 'object' && typeof val.toDate === 'function') {
      newData[key] = val.toDate();
    } else if (val && typeof val === 'object') {
      newData[key] = convertTimestamps(val);
    }
  }
  return newData;
};

export const persistenceService = {
  getUser: async (): Promise<User | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      return userDoc.exists() ? (convertTimestamps(userDoc.data()) as User) : null;
    } catch (err) {
      console.warn("Persistence: Using cached/offline user data", err);
      return null; 
    }
  },

  saveUser: async (userData: User) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { 
        ...userData, 
        userId: currentUser.uid,
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Persistence: Failed to save user", err);
    }
  },

  saveMessagingToken: async (token: string) => {
    const currentUser = auth.currentUser;
    if (currentUser && token) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { 
          fcmTokens: arrayUnion(token),
          lastTokenSync: serverTimestamp(),
          pushEnabled: true
        }, { merge: true });
        console.log("Bito linked to Cloud Messaging successfully! 🥑");
      } catch (err) {
        console.error("Persistence: Failed to save messaging token", err);
      }
    }
  },

  saveMeal: async (meal: Meal) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
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
  },

  saveDailyLog: async (log: DailyLog) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      const docId = `${currentUser.uid}_${log.date}`;
      await setDoc(doc(db, 'daily_logs', docId), { 
        ...log, 
        userId: currentUser.uid 
      }, { merge: true });
    } catch (err) {
      console.error("Persistence: Failed to save daily log", err);
    }
  },

  getDailyLog: async (date: string): Promise<DailyLog> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { date, steps: 0, waterGlasses: 0, meals: [] };
    
    try {
      const docId = `${currentUser.uid}_${date}`;
      const logDoc = await getDoc(doc(db, 'daily_logs', docId));
      if (logDoc.exists()) {
        return convertTimestamps(logDoc.data()) as DailyLog;
      }
    } catch (err) {
      // Permission errors here are caught silently
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
    if (!currentUser) return [];
    
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
      return [];
    }
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

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          exportData.userProfile = convertTimestamps(userDoc.data());
        }
      } catch (e) { console.error("Export: User profile fetch failed", e); }

      try {
        const logsQ = query(collection(db, 'daily_logs'), where('userId', '==', currentUser.uid));
        const logsSnap = await getDocs(logsQ);
        exportData.dailyLogs = logsSnap.docs.map(d => convertTimestamps(d.data()));
      } catch (e) { 
        console.error("Export: Daily logs fetch failed", e);
      }

      try {
        const libQ = query(collection(db, 'Library'), where('userId', '==', currentUser.uid));
        const libSnap = await getDocs(libQ);
        exportData.library = libSnap.docs.map(d => convertTimestamps(d.data()));
      } catch (e) { 
        console.error("Export: Library fetch failed", e); 
      }

      try {
        const scanQ = query(collection(db, 'food_scans'), where('userId', '==', currentUser.uid));
        const scanSnap = await getDocs(scanQ);
        exportData.foodScans = scanSnap.docs.map(d => convertTimestamps(d.data()));
      } catch (e) { 
        console.error("Export: Food scans fetch failed", e); 
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
      await deleteDoc(doc(db, 'users', currentUser.uid));
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
        q = query(collection(db, 'supportMessages'), limit(100));
        const snap = await getDocs(q);
        const msgs = snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) }));
        return msgs.sort((a, b) => {
          const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
          const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
          return tB - tA;
        });
      } else {
        q = query(
          collection(db, 'supportMessages'), 
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const msgs = snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) }));
        
        return msgs.sort((a, b) => {
          const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
          const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
          return tB - tA;
        });
      }
    } catch (err) {
      return [];
    }
  }
};
