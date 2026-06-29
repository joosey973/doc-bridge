import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './MainPage.css';

const API_URL = 'http://localhost:8000/api';

function MainPage({ changePage }) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Используем реф для ховера, чтобы анимация видела актуальное значение без перезапуска эффекта
  const isHoveredRef = useRef(isHovered);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ 
    login: '',
    password: '',
    passwordConfirm: '',
    username: '',
    email: ''
  });
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Проверка авторизации при монтировании
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await fetch(`${API_URL}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user);
            localStorage.setItem('userData', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
          }
        } catch (error) {
          console.error('❌ Ошибка проверки авторизации:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      }
      setLoadingAuth(false);
    };
    checkAuth();
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
    window.location.reload();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const isEmail = authForm.login.includes('@');
      const loginData = { password: authForm.password };
      if (isEmail) loginData.email = authForm.login;
      else loginData.username = authForm.login;
      
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        window.location.reload();
      } else {
        const error = await response.json();
        setAuthError(error.message || 'Неверный логин или пароль');
      }
    } catch (error) {
      setAuthError('Ошибка при входе');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (authForm.password !== authForm.passwordConfirm) {
      setAuthError('❌ Пароли не совпадают!');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
          password_confirm: authForm.passwordConfirm
        })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        window.location.reload();
      } else {
        const error = await response.json();
        const errorMessages = Object.values(error.errors).flat().join(', ');
        setAuthError(errorMessages || 'Ошибка регистрации');
      }
    } catch (error) {
      setAuthError('Ошибка при регистрации');
    }
  };

  // Оптимизированный Canvas фон (срабатывает ОДИН раз при монтировании)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const numDigits = 100;
    const digits = [];

    for (let i = 0; i < numDigits; i++) {
      digits.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: Math.random() > 0.5 ? '1' : '0',
        size: Math.floor(Math.random() * 6) + 12,
        tick: 0,
        tickMax: Math.floor(Math.random() * 15) + 5,
        speedX: (Math.random() - 0.5) * 2, // Базовая скорость для хаотичного движения
        speedY: (Math.random() - 0.5) * 2
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
      
      const hovered = isHoveredRef.current;

      digits.forEach((d, idx) => {
        ctx.font = `700 ${d.size}px monospace`; 
        
        if (hovered) {
          const rows = 8; 
          const targetY = (idx % rows) * (height / rows) + (height / (rows * 2));
          
          // Плавное притягивание к линиям сетки вместо резкого прыжка
          d.y += (targetY - d.y) * 0.1;
          
          d.tick++;
          if (d.tick > 5) {
            d.x += 12; // Движение вбок в режиме ховера
            if (Math.random() > 0.85) d.char = d.char === '1' ? '0' : '1';
            d.tick = 0;
          }

          if (idx % rows === 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.fillRect(0, targetY + 2, width, 1);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; 
          }
        } else {
          // Стандартное хаотичное движение (без телепортаций)
          d.x += d.speedX;
          d.y += d.speedY;

          d.tick++;
          if (d.tick >= d.tickMax) {
            // Слегка меняем вектор движения время от времени
            d.speedX = (Math.random() - 0.5) * 2;
            d.speedY = (Math.random() - 0.5) * 2;
            if (Math.random() > 0.5) d.char = Math.random() > 0.5 ? '1' : '0';
            d.tick = 0;
            d.tickMax = Math.floor(Math.random() * 40) + 20;
          }
        }

        // Границы экрана
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
  }, []); // Пустой массив зависимостей гарантирует стабильный FPS

  if (loadingAuth) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <canvas ref={canvasRef} className="glitch-bg-canvas" />
      
      {isOpen && <div className="background-overlay" onClick={closeMenu}></div>}

      <button 
        className={`burger-btn ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/api/profile/" onClick={closeMenu}>Личный кабинет</Link></li>
          <li><Link to="/api/converter/" onClick={closeMenu}>Конвертер</Link></li>
          <li><Link to="/api/compress/" onClick={closeMenu}>Сжатие</Link></li>
          <li><Link to="/api/pastes/" onClick={closeMenu}>Заметки</Link></li>
          <li><Link to="/api/droppage/" onClick={closeMenu}>Файлообменник</Link></li>
          <li><Link to="/api/about/" onClick={closeMenu}>О нас</Link></li>
        </ul>
      </nav>

      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link></h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
            <span className="notification-badge"></span>
            ➤
          </button>
          <button className="auth-btn" onClick={isAuthenticated ? handleLogout : () => setShowAuthModal(true)}>
            {isAuthenticated ? 'Выйти' : 'Войти'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="buttons-grid">
          {/* Исправлено: Ссылки теперь сами выступают в роли интерактивных кнопок */}
          <Link 
            to="/api/converter/" 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span data-text="Конвертер">Конвертер</span>
          </Link>
          
          <Link 
            to="/api/compress/" 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span data-text="Сжатие">Сжатие</span>
          </Link>
          
          <Link 
            to="/api/pastes/" 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span data-text="Заметки">Заметки</span>
          </Link>
          
          <Link 
            to="/api/droppage/" 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span data-text="Файлообменник">Файлообменник</span>
          </Link>
        </div>
      </main>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isLoginMode ? 'Вход в систему' : 'Регистрация'}</h2>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            </div>
            
            <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
              {isLoginMode ? (
                <div className="form-group">
                  <label>Email или имя пользователя</label>
                  <input
                    type="text"
                    placeholder="Введите email или username"
                    value={authForm.login}
                    onChange={(e) => setAuthForm({...authForm, login: e.target.value})}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Можно использовать email или имя пользователя
                  </small>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Имя пользователя</label>
                    <input
                      type="text"
                      placeholder="Придумайте имя пользователя"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                      required
                      minLength={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  placeholder="Введите пароль"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  required
                />
              </div>

              {!isLoginMode && (
                <div className="form-group">
                  <label>Подтверждение пароля</label>
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={authForm.passwordConfirm}
                    onChange={(e) => setAuthForm({...authForm, passwordConfirm: e.target.value})}
                    required
                  />
                </div>
              )}

              {authError && <div className="message error" style={{ marginTop: '12px' }}>{authError}</div>}
              
              <button type="submit" className="submit-btn" style={{ marginTop: '12px' }}>
                {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            
            <div className="auth-switch">
              {isLoginMode ? (
                <span>
                  Нет аккаунта? <span onClick={() => {
                    setIsLoginMode(false);
                    setAuthError('');
                    setAuthForm({...authForm, login: ''});
                  }}>Зарегистрироваться</span>
                </span>
              ) : (
                <span>
                  Уже есть аккаунт? <span onClick={() => {
                    setIsLoginMode(true);
                    setAuthError('');
                    setAuthForm({...authForm, username: '', email: '', passwordConfirm: ''});
                  }}>Войти</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;