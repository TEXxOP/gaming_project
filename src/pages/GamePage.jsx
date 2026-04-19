import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { games } from '../data/games';
import './GamePage.css';

const GamePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const topBarRef = useRef(null);
  const hideTimerRef = useRef(null);
  const touchStartY = useRef(null);

  const handleFullscreen = () => {
    try {
      const target = document.documentElement;
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
      }
    } catch (e) {
      // iOS Safari throws synchronously — silently ignore
      console.warn('Fullscreen not supported:', e.message);
    }
  };

  const game = games.find(g => g.slug === slug);

  // Listen for actual iframe load event
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => setLoading(false);
    iframe.addEventListener('load', handleLoad);

    // Fallback timeout in case load event doesn't fire
    const fallback = setTimeout(() => setLoading(false), 6000);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(fallback);
    };
  }, [slug]);

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Auto-hide top bar in landscape on mobile
  const resetHideTimer = useCallback(() => {
    if (!topBarRef.current || !isMobile) return;
    topBarRef.current.classList.remove('auto-hidden');
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (topBarRef.current && window.innerWidth > window.innerHeight) {
        topBarRef.current.classList.add('auto-hidden');
      }
    }, 3000);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    const handleOrientationChange = () => {
      if (window.innerWidth > window.innerHeight) {
        resetHideTimer();
        // Auto-attempt fullscreen on landscape (safely)
        try {
          if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            const el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
          }
        } catch (e) {
          // iOS doesn't support fullscreen — ignore
        }
      } else if (topBarRef.current) {
        topBarRef.current.classList.remove('auto-hidden');
        clearTimeout(hideTimerRef.current);
      }
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Touch on topbar resets timer
    const handleTopBarTouch = () => resetHideTimer();
    if (topBarRef.current) {
      topBarRef.current.addEventListener('touchstart', handleTopBarTouch, { passive: true });
    }

    // Swipe down from top edge to reveal bar
    const handleSwipeStart = (e) => {
      const touch = e.touches[0];
      if (touch.clientY < 30) {
        touchStartY.current = touch.clientY;
      }
    };
    const handleSwipeEnd = (e) => {
      if (touchStartY.current !== null) {
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy > 40 && topBarRef.current) {
          topBarRef.current.classList.remove('auto-hidden');
          resetHideTimer();
        }
        touchStartY.current = null;
      }
    };

    document.addEventListener('touchstart', handleSwipeStart, { passive: true });
    document.addEventListener('touchend', handleSwipeEnd, { passive: true });

    // Initial check
    handleOrientationChange();

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchstart', handleSwipeStart);
      document.removeEventListener('touchend', handleSwipeEnd);
      clearTimeout(hideTimerRef.current);
    };
  }, [isMobile, resetHideTimer]);

  if (!game) {
    return <div className="game-error">Game not found. <button onClick={() => navigate('/games')}>Go back</button></div>;
  }

  return (
    <div className="game-page-container fade-in-up">
      <div className="game-top-bar" ref={topBarRef} onTouchStart={resetHideTimer}>
        <button className="btn-secondary back-btn" onClick={() => navigate('/games')}>
          ← Back
        </button>
        <h2 className="live-title">{game.title} <span className="live-dot"></span></h2>
        <button className="btn-secondary maximize-btn" onClick={handleFullscreen}>⛶ Fullscreen</button>
      </div>

      <div className="iframe-container glass-panel">
        {loading && (
          <div className="loading-overlay">
            <div className="loader-spinner"></div>
            <p className="loader-text">Initializing WebGL Engine...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={`/games/${encodeURIComponent(game.gamePath || game.slug)}/index.html`}
          title={game.title}
          className={`game-iframe ${loading ? 'hidden' : 'visible'}`}
          frameBorder="0"
          allow="autoplay; fullscreen; pointer-lock; display-capture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default GamePage;
