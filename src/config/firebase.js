import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";

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

export const logInWithGoogle = async () => {
    try {
        // Try popup first. It is the most seamless if it works.
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        // If the browser aggressively blocks the popup, fall back to redirect.
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
            console.warn("Popup blocked by browser. Falling back to redirect logic.");
            await signInWithRedirect(auth, googleProvider);
            return null;
        } else if (error.code === 'auth/popup-closed-by-user') {
            console.log("User manually closed the popup.");
            throw error;
        } else {
            console.error("Error signing in with Google:", error);
            throw error;
        }
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

export { auth };
