import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Swipe gesture: left-edge swipe to open, swipe-left to close
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = Math.abs(touch.clientY - touchStartY.current);

    // Only horizontal swipes (dx > 60px, dy < 50px)
    if (Math.abs(dx) > 60 && dy < 50) {
      if (dx > 0 && touchStartX.current < 30 && !sidebarOpen) {
        // Swipe right from left edge → open
        setSidebarOpen(true);
      } else if (dx < 0 && sidebarOpen) {
        // Swipe left → close
        setSidebarOpen(false);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [sidebarOpen]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <div className="layout-root">
      <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />
      <div className="layout-body">
        {/* Mobile overlay backdrop */}
        <div 
          className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
