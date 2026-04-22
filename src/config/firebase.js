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

console.log("🔧 Initializing Firebase with config:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const logInWithGoogle = async () => {
    try {
        console.log("🔐 Attempting popup login...");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("✅ Popup login successful!");
        console.log("   User:", result.user.email);
        console.log("   UID:", result.user.uid);
        console.log("   Display Name:", result.user.displayName);
        
        // Force a small delay to ensure Firebase processes the auth state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return result.user;
    } catch (error) {
        console.error("❌ Login error:", error.code);
        console.error("   Message:", error.message);
        
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
