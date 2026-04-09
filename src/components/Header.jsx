import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="header-brand">
          <svg className="factory-icon" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M2,22 L2,10 L8,6 L8,12 L14,8 L14,14 L20,10 L20,22 Z M4,20 L6,20 L6,8 L4,10 Z M10,20 L12,20 L12,10 L10,12 Z M16,20 L18,20 L18,12 L16,14 Z"></path>
          </svg>
          <h1>AETHERPLAY</h1>
        </div>
      </div>
      <div className="header-actions">
           {/* Space for future icons if needed */}
      </div>
    </header>
  );
};

export default Header;
