// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CompressPage from './pages/CompressPage';
import DropPage from './pages/DropPage';
import ConverterPage from './pages/ConverterPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import PastesPage from './pages/PastesPage';
import './App.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [currentPage, setCurrentPage] = useState('converter');
  const [serverStatus, setServerStatus] = useState('⏳ Проверка...');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // ===== СОСТОЯНИЯ ДЛЯ АВТОРИЗАЦИИ =====
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');

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

  // ===== ФУНКЦИЯ АВТОРИЗАЦИИ =====
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register' && authPassword !== authPasswordConfirm) {
      setAuthError('❌ Пароли не совпадают!');
      return;
    }

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login' 
        ? { username: authUsername, password: authPassword }
        : { username: authUsername, password: authPassword, email: authEmail };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthUsername('');
        setAuthPassword('');
        setAuthPasswordConfirm('');
        setAuthEmail('');
      } else {
        setAuthError(data.error);
      }
    } catch (error) {
      setAuthError('❌ Ошибка подключения к серверу');
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
      case 'about':
        return <AboutPage />;
      case 'converter':
        return <ConverterPage />;
      case 'compress':
        return <CompressPage />;
      case 'drop':
        return <DropPage />;
      case 'pastes':
        return <PastesPage user={user} />;
      case 'profile':
        return <ProfilePage user={user} />;
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

      {/* ===== МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ===== */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{authMode === 'login' ? '🔑 Вход' : '📝 Регистрация'}</h2>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Имя пользователя</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Введите имя"
                  required
                />
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Введите email"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                />
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label>Подтверждение пароля</label>
                  <input
                    type="password"
                    value={authPasswordConfirm}
                    onChange={(e) => setAuthPasswordConfirm(e.target.value)}
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
              )}

              {authError && <div className="message error">{authError}</div>}

              <button type="submit" className="submit-btn">
                {authMode === 'login' ? '🚀 Войти' : '📝 Зарегистрироваться'}
              </button>
            </form>
            <div className="auth-switch">
              {authMode === 'login' ? (
                <p>Нет аккаунта? <span onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}>Зарегистрироваться</span></p>
              ) : (
                <p>Уже есть аккаунт? <span onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}>Войти</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2026 DocBridge — Обменник файлов и кода</p>
      </footer>
    </div>
  );
}

export default App;