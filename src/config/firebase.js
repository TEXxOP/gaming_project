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
    console.log('🪟 Using popup for authentication...');
    // Always use popup. Redirect causes infinite loops on mobile due to 
    // cross-site cookie blocking (Safari ITP / Chrome). Popups work on mobile
    // when triggered by a direct user click.
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Popup login successful:', result.user.email);
    return result.user;
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

