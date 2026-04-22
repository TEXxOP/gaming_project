import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import googleLogo from '../assets/google-logo.svg';
import './Landing.css';

const Landing = () => {
  const { logInWithGoogle } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await logInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="landing-auth-split">
      <div className="auth-hero-image">
        <div className="auth-hero-overlay">
          <h2>Welcome to AetherPlay</h2>
          <p>Your gateway to high-quality interactive experiences.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="login-box">
          <svg className="factory-icon-large" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M2,22 L2,10 L8,6 L8,12 L14,8 L14,14 L20,10 L20,22 Z M4,20 L6,20 L6,8 L4,10 Z M10,20 L12,20 L12,10 L10,12 Z M16,20 L18,20 L18,12 L16,14 Z"></path>
          </svg>
          <h1 className="login-title">AETHERPLAY</h1>
          <p className="login-sub">Please sign in to access the portal.</p>
          
          <button className="btn-solid-login" onClick={handleLogin} disabled={isAuthenticating}>
            {isAuthenticating ? (
              "Authenticating..."
            ) : (
              <>
                <img src={googleLogo} alt="Google" className="google-icon" />
                Authenticate with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
