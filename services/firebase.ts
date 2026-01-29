
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGOhHOZ4euer37WLnHK-BCBY8cGQcbgtk",
  authDomain: "avocado-e0cd8.firebaseapp.com",
  projectId: "avocado-e0cd8",
  storageBucket: "avocado-e0cd8.firebasestorage.app",
  messagingSenderId: "558315108468",
  appId: "1:558315108468:web:8a84ea6fa8acf36597b921",
  measurementId: "G-2644ZZQM6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Storage removed to avoid billing issues
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
