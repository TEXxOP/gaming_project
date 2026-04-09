import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  return (
    <div className="game-card" onClick={() => navigate(`/games/${game.slug}`)}>
      <div className="card-image-box">
        <img src={game.thumbnail} alt={game.title} className="card-image" />
      </div>
      <div className="card-info">
        <div className="card-icon">
          {/* Hexagon icon like Unity */}
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="card-details">
          <h3 className="card-title">{game.title}</h3>
          <p className="card-stat">Played {Math.floor(Math.random() * 50000)} times</p>
          <p className="card-stat">Released {game.releaseDate || '2 years'} ago</p>
          <div className="card-badges">
            <span className="badge badge-webgl">WebGL</span>
            {game.tags.includes('Mobile') && <span className="badge badge-mobile">WebGL Mobile</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
