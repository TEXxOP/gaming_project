import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';

const AuthDebug = () => {
  const [authState, setAuthState] = useState({
    currentUser: null,
    isInitialized: false,
    timestamp: null
  });

  useEffect(() => {
    console.log("🔍 AuthDebug mounted");
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        currentUser: user ? {
          email: user.email,
          displayName: user.displayName,
          uid: user.uid
        } : null,
        isInitialized: true,
        timestamp: new Date().toISOString()
      });
    });

    return () => unsubscribe();
  }, []);

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.9)',
      color: '#0f0',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '11px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      zIndex: 9999,
      border: '1px solid #0f0'
    }}>
      <div><strong>🔍 Auth Debug</strong></div>
      <div>Initialized: {authState.isInitialized ? '✅' : '❌'}</div>
      <div>User: {authState.currentUser ? `✅ ${authState.currentUser.email}` : '❌ None'}</div>
      <div>Updated: {authState.timestamp ? new Date(authState.timestamp).toLocaleTimeString() : 'Never'}</div>
    </div>
  );
};

export default AuthDebug;
