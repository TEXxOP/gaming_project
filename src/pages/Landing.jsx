import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import googleLogo from '../assets/google-logo.svg';
import './Landing.css';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import googleLogo from '../assets/google-logo.svg';
import './Landing.css';

const Landing = () => {
  const { user, logInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Navigate to games when user is authenticated
  useEffect(() => {
    if (user) {
      console.log("✅ User detected, navigating to /games");
      navigate('/games', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (isAuthenticating) {
      console.log("⏳ Already authenticating, ignoring click");
      return;
    }

    setIsAuthenticating(true);
    console.log("🔘 Login button clicked");
    
    try {
      const result = await logInWithGoogle();
      if (result) {
        console.log("✅ Login completed, user:", result.email);
        // Don't reset isAuthenticating - let the useEffect handle navigation
      } else {
        console.log("⚠️ Login returned null (redirect or cancelled)");
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      setIsAuthenticating(false);
      if (error && error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/redirect-cancelled-by-user') {
        alert("Login failed: " + error.message);
      }
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
