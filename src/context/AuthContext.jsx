import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result (for mobile)
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect error:', error);
    });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logInWithGoogle, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
