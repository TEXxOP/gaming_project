import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, check for redirect result (mobile login)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('✅ Redirect login successful:', result.user.email);
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error('❌ Redirect error:', error);
      });

    // Then listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔄 Auth state:', currentUser ? currentUser.email : 'No user');
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  console.log('AuthProvider - User:', user?.email || 'none', 'Loading:', loading);

  return (
    <AuthContext.Provider value={{ user, loading, logInWithGoogle, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
