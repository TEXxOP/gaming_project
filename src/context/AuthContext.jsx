import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to LOCAL to ensure auth state survives page refreshes
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting persistence:", error);
    });

    // Handle any pending redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("✅ Redirect login successful:", result.user.email);
        }
      })
      .catch((error) => {
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          console.error("❌ Redirect error:", error.code, error.message);
        }
      });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("🔄 Auth state changed:", currentUser ? `✅ ${currentUser.email}` : "❌ No user");
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("❌ Auth state error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    logInWithGoogle,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
