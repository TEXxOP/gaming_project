import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

console.log('🔥 Firebase initialized');

// Google provider
const googleProvider = new GoogleAuthProvider();

// Detect if mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
console.log('📱 Device:', isMobile ? 'Mobile' : 'Desktop');

// Login function
export const logInWithGoogle = async () => {
  try {
    if (isMobile) {
      // Mobile: use redirect (popups are blocked)
      console.log('🔄 Using redirect for mobile...');
      await signInWithRedirect(auth, googleProvider);
      return null; // Will redirect, won't return
    } else {
      // Desktop: use popup
      console.log('🪟 Using popup for desktop...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Popup login successful:', result.user.email);
      return result.user;
    }
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('👋 User closed the popup');
      return null;
    }
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Logout function
export const logOut = () => {
  console.log('🚪 Logging out...');
  return signOut(auth);
};

