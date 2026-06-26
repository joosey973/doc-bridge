// client/src/components/Navbar.jsx
import React from 'react';

function Navbar({ currentPage, setCurrentPage, user, logout, serverStatus, setShowAuthModal }) {
  return (
    <header className="header">
      <div className="logo">
        Doc<span>Bridge</span>
      </div>
      <nav className="nav-menu">
        <button 
          className={`nav-btn ${currentPage === 'converter' ? 'active' : ''}`}
          onClick={() => setCurrentPage('converter')}
        >
          🔄 Конвертер
        </button>
        <button 
          className={`nav-btn ${currentPage === 'compress' ? 'active' : ''}`}
          onClick={() => setCurrentPage('compress')}
        >
          📦 Сжатие
        </button>
        <button 
          className={`nav-btn ${currentPage === 'drop' ? 'active' : ''}`}
          onClick={() => setCurrentPage('drop')}
        >
          📤 DropMeFiles
        </button>
      </nav>
      <div className="header-actions">
        <span className={`server-status ${serverStatus?.includes('✅') ? 'online' : 'offline'}`}>
          {serverStatus || '⏳ Проверка...'}
        </span>
        {user ? (
          <>
            <span className="username">👤 {user.username}</span>
            <button className="logout-btn" onClick={logout}>🚪 Выйти</button>
          </>
        ) : (
          <button className="login-btn" onClick={() => setShowAuthModal?.(true)}>
            🔑 Войти
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;