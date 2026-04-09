import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { games } from '../data/games';
import './GamePage.css';

const GamePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  
  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      } else if (iframeRef.current.msRequestFullscreen) {
        iframeRef.current.msRequestFullscreen();
      }
    }
  };
  
  const game = games.find(g => g.slug === slug);

  // Simulate iframe loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!game) {
    return <div className="game-error">Game not found. <button onClick={() => navigate('/games')}>Go back</button></div>;
  }

  return (
    <div className="game-page-container fade-in-up">
      <div className="game-top-bar">
        <button className="btn-secondary back-btn" onClick={() => navigate('/games')}>
          ← Return to Portal
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
        />
      </div>
    </div>
  );
};

export default GamePage;
