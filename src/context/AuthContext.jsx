import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const redirectHandled = useRef(false);

  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      // Handle redirect result only once
      if (!redirectHandled.current) {
        redirectHandled.current = true;
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            console.log("Successfully logged in via redirect:", result.user.email);
          }
        } catch (error) {
          if (error.code !== 'auth/redirect-cancelled-by-user') {
            console.error("Redirect error:", error);
          }
        }
      }

      // Set up auth state listener
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth state changed:", currentUser?.email || "No user");
        setUser(currentUser);
        setLoading(false);
      });
    };

    initAuth();

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
