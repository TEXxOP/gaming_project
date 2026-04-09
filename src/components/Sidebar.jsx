import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logInWithGoogle, logOut } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🏠</span>
          HOME
        </NavLink>
        
        <div className="nav-divider"></div>
        
        <NavLink to="/games" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🎲</span>
          WEBGL GAMES
        </NavLink>
        <NavLink to="/mobile" className="nav-item">
          <span className="nav-icon">📱</span>
          WEBGL MOBILE GAMES
        </NavLink>
        <NavLink to="/android" className="nav-item">
          <span className="nav-icon">🤖</span>
          ANDROID GAMES
        </NavLink>
        <NavLink to="/ios" className="nav-item">
          <span className="nav-icon">🍏</span>
          IOS GAMES
        </NavLink>

        <div className="nav-divider"></div>
        
        {user ? (
          <div className="nav-item user-active" onClick={logOut} style={{cursor: 'pointer'}}>
             <span className="nav-icon">👤</span>
             LOGOUT ({user.displayName?.split(' ')[0]})
          </div>
        ) : (
          <>
            <div className="nav-item" onClick={logInWithGoogle} style={{cursor: 'pointer'}}>
              <span className="nav-icon">👤</span>
              LOGIN
            </div>
            <div className="nav-item" onClick={logInWithGoogle} style={{cursor: 'pointer'}}>
              <span className="nav-icon">➕</span>
              REGISTER
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
