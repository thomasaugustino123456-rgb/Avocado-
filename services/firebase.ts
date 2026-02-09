import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBBX0byeEjiQ7HkhmPC2NETOA9Myr0HAKk",
  authDomain: "avocado2-680f4.firebaseapp.com",
  projectId: "avocado2-680f4",
  storageBucket: "avocado2-680f4.firebasestorage.app",
  messagingSenderId: "200751965321",
  appId: "1:200751965321:web:01b4e8d20626aacfb1d258",
  measurementId: "G-77N9J56DHE"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Initialize Analytics safely
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (e) {
        console.debug("Analytics initialization skipped or blocked.");
      }
    }
  });
}