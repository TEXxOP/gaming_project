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
        // Environment check: if mobile device, use redirect to avoid popup blockers
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            await signInWithRedirect(auth, googleProvider);
            // Function won't return here as page redirects to Google
            return null;
        } else {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        }
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("User closed the popup.");
        } else {
            console.error("Error signing in with Google:", error.code);
            alert("Login failed: Please try again. Ensure popups are allowed.");
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

export { auth };
