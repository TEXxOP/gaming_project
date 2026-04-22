import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    // Handle redirect result first before setting up auth listener
    const handleRedirectAndSetupListener = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Successfully logged in via redirect.");
          setUser(result.user);
        }
      } catch (error) {
        // Ignore user-cancelled redirects cleanly
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          console.error("Unexpected redirect error:", error);
        }
      }

      // Set up the auth state listener after handling redirect
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
    };

    handleRedirectAndSetupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
