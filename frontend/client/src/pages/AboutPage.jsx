import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import './Pages.css';
import './AboutPage.css'
import '../MainPage.css';

const API_URL = 'http://localhost:8000/api';

function AboutPage() {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
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
      setAuthError('Пароли не совпадают!');
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
        glitchX: (Math.random() - 0.5) * 20,
        glitchY: (Math.random() - 0.5) * 20,
        tick: 0,
        tickMax: Math.floor(Math.random() * 15) + 5,
        speedX: (Math.random() - 0.5) * 2,
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
  }, []);

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
            console.error('Ошибка проверки авторизации:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
          }
        }
        setLoadingAuth(false);
      };
      checkAuth();
    }, []);

  const closeMenu = () => setIsOpen(false);
  return (
    
    <div className="about-page-wrapper">
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
      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link></h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
            <span className="notification-badge"></span>
            ➤
          </button>
          <Link to="/api/profile/" className="auth-btn" style={{ textDecoration: 'none', color: 'inherit' }}>Личный кабинет</Link>
        </div>
      </header>

      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/api/profile/" onClick={closeMenu}>Личный кабинет</Link></li>
          <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
          <li><Link to="/api/converter/" onClick={closeMenu}>Конвертер</Link></li>
          <li><Link to="/api/compress/" onClick={closeMenu}>Сжатие</Link></li>
          <li><Link to="/api/pastes/" onClick={closeMenu}>Заметки</Link></li>
          <li><Link to="/api/droppage/" onClick={closeMenu}>Файлообменник</Link></li>
        </ul>
      </nav>
      <div className="about-glass-card">
        

        <div className="about-page-header">
          <h1>О проекте DocBridge</h1>
          <p className="about-page-subtitle">Современная платформа для комплексной работы с файлами</p>
        </div>
        

        <div className="about-page-grid">
          
          {/* Левая колонка */}
          <div>
            <section className="about-page-section">
              <h2>Что такое DocBridge?</h2>
              <p>
                DocBridge — это единая веб-платформа, объединяющая все необходимые инструменты 
                для работы с файлами и кодом в одном месте. Мы создали сервис, который заменяет 
                несколько отдельных вкладок: Pastebin, онлайн-конвертеры, файлообменники и оптимизаторы размера.
              </p>
              <p>
                Наша цель — избавить вас от рутины. Никаких лишних переключений, рекламы и тяжелых интерфейсов. 
                Просто загружайте, обрабатывайте и делитесь результатом.
              </p>
            </section>

            <section className="about-page-section">
              <h2>Почему DocBridge?</h2>
              <div className="about-reasons">
                <div className="about-reason-line">Все инструменты доступны на единой панели</div>
                <div className="about-reason-line">Мгновенная обработка данных на стороне сервера</div>
                <div className="about-reason-line">Строгий минимализм интерфейса без отвлекающих деталей</div>
                <div className="about-reason-line">Безопасность и конфиденциальность ваших файлов</div>
              </div>
            </section>
          </div>

          {/* Правая колонка */}
          <div>
            <section className="about-page-section">
              <h2>Возможности</h2>
              <div className="about-features-list">
                
                <div className="about-feature-item">
                  <h3>Текстовые пасты</h3>
                  <p>Создание заметок и шеринг кода с подсветкой синтаксиса.</p>
                </div>

                <div className="about-feature-item">
                  <h3>Конвертация</h3>
                  <p>Быстрый экспорт между PDF, DOCX, изображениями и текстом.</p>
                </div>

                <div className="about-feature-item">
                  <h3>Сжатие</h3>
                  <p>Уменьшение веса документов и изображений без потери качества.</p>
                </div>

                <div className="about-feature-item">
                  <h3>Обмен файлами</h3>
                  <p>Генерация прямых ссылок для отправки коллегам или друзьям.</p>
                </div>

              </div>
            </section>
          </div>

        </div>

        {/* Футер */}
        <footer className="about-page-footer">
          <section className="about-page-section" style={{ marginBottom: 0 }}>
            <h2>Контакты для связи</h2>
            <div className="about-contacts-row">
              
              <div className="about-contact-card">
                <div className="about-contact-label">Email</div>
                <div className="about-contact-value">docbridge@mail.com</div>
              </div>

              <div className="about-contact-card">
                <div className="about-contact-label">Telegram</div>
                <div className="about-contact-value">@docbridge_bot</div>
              </div>

              <div className="about-contact-card">
                <div className="about-contact-label">GitHub</div>
                <div className="about-contact-value">github.com/docbridge</div>
              </div>

            </div>
          </section>
        </footer>

      </div>
    </div>
  );
}

export default AboutPage;