import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Detect mobile to choose the right auth strategy
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Standardized auth functions
export const logInWithGoogle = async () => {
    try {
        if (isMobileDevice) {
            // Mobile: Use redirect to avoid popup blockers on Safari/Chrome mobile
            await signInWithRedirect(auth, googleProvider);
            // The result will be picked up by getRedirectResult in AuthContext
            return null;
        } else {
            // Desktop: Popup works reliably
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        }
    } catch (error) {
        console.error("Error signing in with Google", error);
        // Fallback: if popup fails on desktop, try redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            try {
                await signInWithRedirect(auth, googleProvider);
                return null;
            } catch (redirectError) {
                console.error("Redirect also failed", redirectError);
                throw redirectError;
            }
        }
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export { auth, getRedirectResult };
