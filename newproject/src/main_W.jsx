import { useState, useEffect, useRef } from 'react';
import './main_W.css';

const API_URL = 'http://localhost:3001';

function App({ changePage, user, setUser, token, setToken, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Стейты авторизации
const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');

  const closeMenu = () => setIsOpen(false);

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

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register' && authPassword !== authPasswordConfirm) {
      setAuthError('Пароли не совпадают');
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
      setAuthError('Ошибка подключения к серверу');
    }
  };



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const numDigits = 70; 
    const digits = [];

    for (let i = 0; i < numDigits; i++) {
      digits.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: Math.random() > 0.5 ? '1' : '0',
        size: Math.floor(Math.random() * 6) + 12, 
        glitchX: (Math.random() - 0.5) * 20,
        glitchY: (Math.random() - 0.5) * 20,
        tick: 0,
        tickMax: Math.floor(Math.random() * 15) + 5
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.56)'; 
      digits.forEach((d, idx) => {
        ctx.font = `700 ${d.size}px monospace`; 
        if (isHovered) {
          const rows = 8; 
          const targetY = (idx % rows) * (height / rows) + (height / (rows * 2));
          d.y = targetY;
          d.tick++;
          if (d.tick > 5) {
            d.x += 15; 
            if (Math.random() > 0.85) d.char = d.char === '1' ? '0' : '1';
            d.tick = 0;
          }
          if (idx % 8 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.fillRect(0, targetY + 2, width, 1);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; 
          }
        } else {
          d.tick++;
          if (d.tick >= d.tickMax) {
            d.x += (Math.random() - 0.5) * 60;
            d.y += (Math.random() - 0.5) * 60;
            if (Math.random() > 0.5) d.char = Math.random() > 0.5 ? '1' : '0';
            d.tick = 0;
            d.tickMax = Math.floor(Math.random() * 20) + 10;
          }
        }
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;
        ctx.fillText(d.char, d.x, d.y);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  const handleMenuClick = (page) => (e) => {
    e.preventDefault();
    changePage(page);
    closeMenu();
  };

  return (
    <div className="app-container">
      <canvas ref={canvasRef} className="glitch-bg-canvas" />
      
      {isOpen && <div className="background-overlay" onClick={closeMenu}></div>}

      <button className={`burger-btn ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span></span><span></span><span></span>
      </button>

      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        <ul>
          <li><a href="#" onClick={handleMenuClick('profile')}>Личный кабинет</a></li>
          <li><a href="#" onClick={handleMenuClick('about')}>О нас</a></li>
          <li><a href="#" onClick={handleMenuClick('docbridge')}>Хранилище</a></li>
        </ul>
      </nav>

      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo">DocBridge</h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
            <span className="notification-badge"></span>
            ➤
          </button>
          {user ? (
            <span style={{ fontSize: '12px', color: '#000000', marginRight: '10px' }}>
              {user.username} <button className="auth-btn" onClick={logout} style={{ marginLeft: '5px' }}>Выйти</button>
            </span>
          ) : (
            <button className="auth-btn" onClick={() => setShowAuthModal(true)}>Войти</button>
          )}
        </div>
      </header>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <input 
                  type="text" 
                  value={authUsername} 
                  onChange={(e) => setAuthUsername(e.target.value)} 
                  placeholder="Имя пользователя" 
                  required 
                />
              </div>
              {authMode === 'register' && (
                <div className="form-group">
                  <input 
                    type="email" 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)} 
                    placeholder="Email" 
                    required 
                  />
                </div>
              )}
              <div className="form-group">
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="Пароль" 
                  required 
                />
              </div>
              {authMode === 'register' && (
                <div className="form-group">
                  <input 
                    type="password" 
                    value={authPasswordConfirm} 
                    onChange={(e) => setAuthPasswordConfirm(e.target.value)} 
                    placeholder="Повторите пароль" 
                    required 
                  />
                </div>
              )}
              {authError && <div className="message error" style={{ color: 'red', marginBottom: '10px' }}>{authError}</div>}
              <button type="submit" className="submit-btn">
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            <div className="auth-switch">
              <span onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
                {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Вход'}
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="buttons-grid">
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('converter')}
          >
            <span data-text="Конвертер">Конвертер</span>
          </button>
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('compress')}
          >
            <span data-text="Сжатие">Сжатие</span>
          </button>
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('docbridge')}
          >
            <span data-text="Заметки">Заметки</span>
          </button>
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('droppage')}
          >
            <span data-text="Файлообменник">Файлообменник</span>
          </button>
        </div>
      </main>

      <footer className="bottom-footer">
        <div className="footer-buttons">
          <button className="footer-btn">1</button>
          <button className="footer-btn">2</button>
          <button className="footer-btn">3</button>
        </div>
      </footer>
    </div>
  );
}

export default App;