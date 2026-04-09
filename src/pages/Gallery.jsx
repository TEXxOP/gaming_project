import React from 'react';
import { games } from '../data/games';
import GameCard from '../components/GameCard';
import './Gallery.css';

const Gallery = () => {
  return (
    <div className="gallery-page">
      <h2 className="section-title">WebGL Games</h2>
      <div className="games-grid">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
