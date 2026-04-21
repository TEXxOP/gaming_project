import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Silently resolve redirect results
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Successfully logged in via redirect.");
      }
    }).catch((error) => {
      // Ignore user-cancelled redirects cleanly
      if (error.code !== 'auth/redirect-cancelled-by-user') {
        console.error("Unexpected redirect error:", error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
