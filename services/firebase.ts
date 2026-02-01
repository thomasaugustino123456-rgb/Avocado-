
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBBX0byeEjiQ7HkhmPC2NETOA9Myr0HAKk",
  authDomain: "avocado2-680f4.firebaseapp.com",
  projectId: "avocado2-680f4",
  storageBucket: "avocado2-680f4.firebasestorage.app",
  messagingSenderId: "200751965321",
  appId: "1:200751965321:web:01b4e8d20626aacfb1d258",
  measurementId: "G-77N9J56DHE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Initialize Firestore with robust offline capabilities.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true,
});

if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
  } catch (e) {
    console.warn("Analytics blocked or failed to initialize");
  }
}
