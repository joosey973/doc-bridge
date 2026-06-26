// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CompressPage from './pages/CompressPage';
import DropPage from './pages/DropPage';
import ConverterPage from './pages/ConverterPage'; // ← ДОБАВИТЬ
import './App.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [currentPage, setCurrentPage] = useState('converter'); // ← ИЗМЕНИТЬ НА converter
  const [serverStatus, setServerStatus] = useState('⏳ Проверка...');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Проверка сервера
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/api/message`);
        if (response.ok) {
          setServerStatus('✅ Сервер работает');
        } else {
          setServerStatus('❌ Сервер недоступен');
        }
      } catch {
        setServerStatus('❌ Сервер не запущен');
      }
    };
    checkServer();
  }, []);

  // Проверка авторизации
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setToken('');
        localStorage.removeItem('token');
      }
    } catch {
      setToken('');
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  // Рендеринг страниц
  const renderPage = () => {
    switch (currentPage) {
      case 'converter': // ← НОВАЯ СТРАНИЦА
        return <ConverterPage />;
      case 'compress':
        return <CompressPage />;
      case 'drop':
        return <DropPage />;
      case 'pastes':
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            <h2>📝 Пасты</h2>
            <p>Страница в разработке</p>
          </div>
        );
      default:
        return <ConverterPage />;
    }
  };

  return (
    <div className="app">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        logout={logout}
        serverStatus={serverStatus}
        setShowAuthModal={setShowAuthModal}
      />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <p>© 2026 DocBridge — Обменник файлов и кода</p>
      </footer>
    </div>
  );
}

export default App;