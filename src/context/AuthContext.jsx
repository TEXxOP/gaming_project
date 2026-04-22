import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    console.log("🚀 AuthProvider mounting...");

    // Handle redirect result first
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("✅ Redirect result found:", result.user.email);
        } else {
          console.log("ℹ️ No redirect result");
        }
      })
      .catch((error) => {
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          console.error("❌ Redirect error:", error.code);
        }
      })
      .finally(() => {
        setInitialCheckDone(true);
      });

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(
      auth, 
      (currentUser) => {
        console.log("🔄 onAuthStateChanged fired");
        console.log("   User:", currentUser ? currentUser.email : "null");
        console.log("   Timestamp:", new Date().toISOString());
        
        setUser(currentUser);
        
        if (initialCheckDone) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("❌ onAuthStateChanged error:", error);
        setLoading(false);
      }
    );

    // Fallback: if redirect check takes too long, stop loading anyway
    const timeout = setTimeout(() => {
      console.log("⏰ Initial auth check timeout, stopping loading");
      setLoading(false);
    }, 3000);

    return () => {
      console.log("🛑 AuthProvider unmounting");
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [initialCheckDone]);

  const value = {
    user,
    loading,
    logInWithGoogle,
    logOut,
  };

  if (loading) {
    console.log("⏳ AuthProvider: Still loading...");
  } else {
    console.log("✅ AuthProvider: Ready, user =", user?.email || "null");
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
