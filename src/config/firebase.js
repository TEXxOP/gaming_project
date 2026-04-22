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

// Force account selection every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const logInWithGoogle = async () => {
    try {
        console.log("Attempting popup login...");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Popup login successful:", result.user.email);
        return result.user;
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        
        // If popup is blocked, use redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
            console.warn("Popup blocked, using redirect...");
            await signInWithRedirect(auth, googleProvider);
            return null;
        } 
        // User closed popup - not an error
        else if (error.code === 'auth/popup-closed-by-user') {
            console.log("User closed popup");
            return null;
        } 
        // Real errors
        else {
            throw error;
        }
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        console.log("Logged out successfully");
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export { auth };
