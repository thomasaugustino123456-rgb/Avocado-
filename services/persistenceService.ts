
import { User, DailyLog, LibraryItem, Meal } from '../types';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

const STORAGE_KEYS = {
  USER: 'bito_user_profile',
  DAILY_LOGS: 'bito_daily_logs_v2',
  LIBRARY: 'bito_library_items'
};

const compressImage = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const tryFirestore = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.error("Firestore Permission Error: Your Security Rules are blocking this request. Ensure you pasted the rules in Firebase Console!", error);
    } else {
      console.warn("Firestore Sync Issue:", error?.message || error);
    }
    return fallback;
  }
};

export const persistenceService = {
  getUser: async (): Promise<User | null> => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    const localUser = saved ? JSON.parse(saved) : null;

    const currentUser = auth.currentUser;
    if (currentUser) {
      const remoteUser = await tryFirestore(async () => {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as User) : null;
      }, null);

      if (remoteUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(remoteUser));
        return remoteUser;
      }
    }
    return localUser;
  },

  saveUser: async (user: User) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userData = {
      ...user,
      email: currentUser.email || user.email || '',
      userId: currentUser.uid,
      photoFileName: user.photoFileName || 'internal_db_storage'
    };
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    await tryFirestore(() => setDoc(doc(db, "users", currentUser.uid), userData, { merge: true }), null);
  },

  uploadProfilePicture: async (file: File | Blob): Promise<string> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User must be logged in to upload a photo.");

    const compressedBase64 = await compressImage(file);

    await setDoc(doc(db, "users", currentUser.uid), {
      profilePic: compressedBase64,
      photoFileName: 'internal_db_storage',
      userId: currentUser.uid
    }, { merge: true });

    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    const localUser = saved ? JSON.parse(saved) : {};
    localUser.profilePic = compressedBase64;
    localUser.photoFileName = 'internal_db_storage';
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUser));

    return compressedBase64;
  },

  deleteProfilePicture: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await setDoc(doc(db, "users", currentUser.uid), {
      profilePic: '',
      photoFileName: '',
      userId: currentUser.uid
    }, { merge: true });

    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    const localUser = saved ? JSON.parse(saved) : {};
    localUser.profilePic = '';
    localUser.photoFileName = '';
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUser));
  },

  saveMeal: async (meal: Meal) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const mealData = { 
        ...meal, 
        userId: currentUser.uid, 
        timestamp: meal.timestamp instanceof Date ? meal.timestamp.toISOString() : meal.timestamp 
      };
      await tryFirestore(() => setDoc(doc(db, "daily_meal", meal.id), mealData, { merge: true }), null);
    }
  },

  getDailyLog: async (date: string): Promise<DailyLog> => {
    const localLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_LOGS) || '{}');
    const localLog = localLogs[date];

    const currentUser = auth.currentUser;
    if (currentUser) {
      const remoteLog = await tryFirestore(async () => {
        const docId = `${currentUser.uid}_${date}`;
        const docRef = doc(db, "daily_progress_and_trophies", docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as DailyLog) : null;
      }, null);

      if (remoteLog) {
        localLogs[date] = remoteLog;
        localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(localLogs));
        return remoteLog;
      }
    }

    return localLog || { date, steps: 0, waterGlasses: 0, meals: [] };
  },

  saveDailyLog: async (log: DailyLog) => {
    const localLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_LOGS) || '{}');
    localLogs[log.date] = log;
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(localLogs));

    const currentUser = auth.currentUser;
    if (currentUser) {
      const docId = `${currentUser.uid}_${log.date}`;
      const logData = { ...log, userId: currentUser.uid };
      await tryFirestore(() => setDoc(doc(db, "daily_progress_and_trophies", docId), logData, { merge: true }), null);
      
      for (const meal of log.meals) {
        await persistenceService.saveMeal(meal);
      }
    }
  },

  getLibrary: async (): Promise<LibraryItem[]> => {
    const localLib = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIBRARY) || '[]');
    
    const currentUser = auth.currentUser;
    if (currentUser) {
      const remoteLib = await tryFirestore(async () => {
        const q = query(collection(db, "library"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryItem));
      }, []);

      if (remoteLib && remoteLib.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(remoteLib));
        return remoteLib;
      }
    }
    return localLib;
  },

  saveToLibrary: async (item: Omit<LibraryItem, 'id' | 'created_at'>): Promise<LibraryItem> => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem = { ...item, id, created_at: new Date().toISOString() } as LibraryItem;

    const localLib = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIBRARY) || '[]');
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify([newItem, ...localLib]));

    const currentUser = auth.currentUser;
    if (currentUser) {
      const libData = { ...newItem, userId: currentUser.uid };
      await tryFirestore(() => setDoc(doc(db, "library", id), libData, { merge: true }), null);
    }
    return newItem;
  },

  deleteFromLibrary: async (id: string) => {
    const localLib = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIBRARY) || '[]');
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(localLib.filter((i: any) => i.id !== id)));

    const currentUser = auth.currentUser;
    if (currentUser) {
      await tryFirestore(() => deleteDoc(doc(db, "library", id)), null);
    }
  }
};
