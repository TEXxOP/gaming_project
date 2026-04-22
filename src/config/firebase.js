import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";

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

// Set persistence immediately
setPersistence(auth, browserLocalPersistence).catch(console.error);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Track if we're currently in a login attempt to prevent double-clicks
let isLoggingIn = false;

export const logInWithGoogle = async () => {
    // Prevent multiple simultaneous login attempts
    if (isLoggingIn) {
        console.log("⏳ Login already in progress...");
        return null;
    }

    isLoggingIn = true;

    try {
        console.log("🔐 Starting login with popup...");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("✅ Popup login successful:", result.user.email);
        isLoggingIn = false;
        return result.user;
    } catch (error) {
        console.error("❌ Login error:", error.code, error.message);
        
        // Popup blocked - use redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
            console.warn("🔄 Popup blocked, redirecting...");
            try {
                await signInWithRedirect(auth, googleProvider);
                // Don't reset isLoggingIn here - redirect will reload the page
                return null;
            } catch (redirectError) {
                console.error("❌ Redirect failed:", redirectError);
                isLoggingIn = false;
                throw redirectError;
            }
        } 
        // User closed popup
        else if (error.code === 'auth/popup-closed-by-user') {
            console.log("👋 User closed popup");
            isLoggingIn = false;
            return null;
        }
        // Account exists with different credential
        else if (error.code === 'auth/account-exists-with-different-credential') {
            console.error("⚠️ Account exists with different credential");
            isLoggingIn = false;
            alert("This email is already associated with a different sign-in method. Please use the original sign-in method.");
            return null;
        }
        // Other errors
        else {
            isLoggingIn = false;
            throw error;
        }
    }
};

export const logOut = async () => {
    try {
        console.log("🚪 Logging out...");
        await signOut(auth);
        console.log("✅ Logged out successfully");
    } catch (error) {
        console.error("❌ Error signing out:", error);
        throw error;
    }
};

export { auth };
