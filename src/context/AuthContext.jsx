import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 AuthProvider initializing...");

    let authUnsubscribe = null;

    // Initialize auth
    const initAuth = async () => {
      try {
        // Check for redirect result first
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          console.log("✅ Redirect login successful:", redirectResult.user.email);
        }
      } catch (error) {
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          console.error("❌ Redirect error:", error.code);
        }
      }

      // Set up auth state listener
      authUnsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          console.log("🔄 Auth state changed:", currentUser ? currentUser.email : "No user");
          setUser(currentUser);
          setLoading(false);
        },
        (error) => {
          console.error("❌ Auth state error:", error);
          setLoading(false);
        }
      );
    };

    initAuth();

    // Cleanup
    return () => {
      console.log("🛑 AuthProvider unmounting");
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const value = {
    user,
    loading,
    logInWithGoogle,
    logOut,
  };

  console.log("📊 AuthProvider render - Loading:", loading, "User:", user?.email || "none");

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
