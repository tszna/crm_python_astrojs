import React, { useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/auth.js';
import '../styles/style.css';
import '../styles/navbar.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    setIsVisible(true);
    setCurrentPath(window.location.pathname);

    const handleNavigation = () => {
      setIsVisible(false);
    };

    window.addEventListener('beforeunload', handleNavigation);
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href && !e.target.href.startsWith('#')) {
        handleNavigation();
      }
    }, true);

    return () => {
      window.removeEventListener('beforeunload', handleNavigation);
    };
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    setIsVisible(false);
    removeToken();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    return currentPath === path;
  };

  const navStyle = {
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'opacity 0.15s ease-out, visibility 0.15s ease-out'
  };

  return (
    <nav className={isLoggedIn ? 'logged-in' : ''}>
      <div>
        <div>
          <ul>
            <li>
              <a className={`nav-link ${isActive('/') ? 'active' : ''}`} href="/">Home</a>
            </li>
            <div style={navStyle}>
              {isLoggedIn ? (
                <>
                  <li>
                    <a className={`nav-link ${isActive('/profile') ? 'active' : ''}`} href="/profile">Time Tracker</a>
                  </li>
                  <li>
                    <a className={`nav-link ${isActive('/weekly-summary') ? 'active' : ''}`} href="/weekly-summary">Podsumowanie tygodnia</a>
                  </li>
                  <li>
                    <a className={`nav-link ${isActive('/calendar') ? 'active' : ''}`} href="/calendar">Kalendarz</a>
                  </li>
                  <li>
                    <a href="#" onClick={handleLogout}>Wyloguj</a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a className={`nav-link ${isActive('/register') ? 'active' : ''}`} href="/register">Rejestracja</a>
                  </li>
                  <li>
                    <a className={`nav-link ${isActive('/login') ? 'active' : ''}`} href="/login">Logowanie</a>
                  </li>
                </>
              )}
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
}
