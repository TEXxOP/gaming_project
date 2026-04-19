import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logInWithGoogle, logOut } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <nav className="sidebar-nav">
        <NavLink to="/games" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🎮</span>
          ALL GAMES
        </NavLink>
        
        <div className="nav-divider"></div>
        
        {user ? (
          <div className="nav-item user-active" onClick={logOut} style={{cursor: 'pointer'}}>
             <span className="nav-icon">👤</span>
             LOGOUT ({user.displayName?.split(' ')[0]})
          </div>
        ) : (
          <div className="nav-item" onClick={logInWithGoogle} style={{cursor: 'pointer'}}>
            <span className="nav-icon">👤</span>
            LOGIN
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
