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

console.log("🔧 Firebase Config:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// CRITICAL: Set persistence to LOCAL immediately
// This ensures auth state survives page refreshes and browser restarts
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("❌ Failed to set persistence:", error);
  });

// Configure Google provider
const googleProvider = new GoogleAuthProvider();
// Remove prompt: 'select_account' to allow persistence to work properly
googleProvider.setCustomParameters({
  // Only prompt if needed, don't force account selection every time
  prompt: 'consent'
});

export const logInWithGoogle = async () => {
    try {
        console.log("🔐 Starting Google login...");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("✅ Login successful!");
        console.log("   Email:", result.user.email);
        console.log("   UID:", result.user.uid);
        
        return result.user;
    } catch (error) {
        console.error("❌ Login error:", error.code);
        
        // Popup blocked - use redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
            console.warn("🔄 Popup blocked, using redirect...");
            await signInWithRedirect(auth, googleProvider);
            return null;
        } 
        // User closed popup
        else if (error.code === 'auth/popup-closed-by-user') {
            console.log("👋 User closed popup");
            return null;
        }
        // Account exists with different credential
        else if (error.code === 'auth/account-exists-with-different-credential') {
            console.error("⚠️ Account exists with different credential");
            alert("This email is already associated with a different sign-in method.");
            return null;
        }
        // Network errors
        else if (error.code === 'auth/network-request-failed') {
            console.error("🌐 Network error");
            alert("Network error. Please check your connection and try again.");
            return null;
        }
        // Other errors
        else {
            console.error("💥 Unexpected error:", error);
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
