import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logInWithGoogle, logOut, getRedirectResult } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Two gates: we don't stop loading until BOTH have resolved.
    // This prevents the login page flash after a redirect sign-in.
    let redirectDone = false;
    let authDone = false;
    let latestUser = null;

    function tryFinish() {
      if (redirectDone && authDone) {
        setUser(latestUser);
        setLoading(false);
      }
    }

    // Gate 1: Process any pending redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          latestUser = result.user;
        }
      })
      .catch((error) => {
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          console.error("Redirect auth error:", error);
        }
      })
      .finally(() => {
        redirectDone = true;
        tryFinish();
      });

    // Gate 2: Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      latestUser = currentUser;
      if (!authDone) {
        // First fire — just mark done and try to finish
        authDone = true;
        tryFinish();
      } else {
        // Subsequent fires (sign-out, etc.) — update immediately
        setUser(currentUser);
      }
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
