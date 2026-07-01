import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Pages.css';
import '../MainPage.css';
import { 
  MdAccessTime,
} from "react-icons/md";
import {  IoIosStarOutline } from "react-icons/io";
import { GoPencil } from "react-icons/go";
import { IoTrashOutline } from "react-icons/io5";
import { CiInboxIn, CiLock } from "react-icons/ci";
import { VscDeviceCamera } from "react-icons/vsc";
const API_URL = 'http://localhost:8000/api';

function ProfilePage({ changePage }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [userPastes, setUserPastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const openPasteView = (paste) => {
  
    navigate(`/api/pastes/view/${paste.code}/`, { 
      state: { from: 'profile' } 
    });
};
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
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
  const isAuthenticated = !!user && !!token;

  const closeMenu = () => setIsOpen(false);

  const fetchPastes = async () => {
    try {
      const response = await fetch(`${API_URL}/pastes/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setPastes(data.pastes || data);
        
        if (data.user && data.user.username) {
          setProfileData(data.user);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };
  
  const deletePaste = async (code, event) => {
    event.stopPropagation();
    
    if (!token) {
      setMessage('⚠️ Авторизуйтесь, чтобы удалять пасты');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (!confirm(`🗑️ Удалить пасту "${code}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/pastes/delete/${code}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      console.log(data)
      if (data.success) {
        setMessage('✅ Паста удалена');
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error || 'Ошибка удаления'}`);
      }
    } catch (error) {
      setMessage('❌ Ошибка удаления');
    }
  };

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
            setToken(savedToken);
            setUser(data.user);
            localStorage.setItem('userData', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setToken('');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setToken('');
          setUser(null);
        }
      } else {
        setToken('');
        setUser(null);
      }
      
      setLoadingAuth(false);
    };
    
    checkAuth();
  }, []);

  const fetchProfileData = async () => {
  try {
    const savedToken = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/profile/`, {
      headers: {
        'Authorization': `Bearer ${savedToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setProfileData(data.user);
      setStatsData(data.stats);
    } else {
    }
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    setProfileLoading(false);
  }
};

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchUserPastes();
    }
  }, [user]);

  const fetchUserPastes = async () => {
    try {
      const savedToken = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile/`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPastes(data.stats.pastes);
      }
    } catch (error) {
      console.error('Ошибка загрузки паст:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const isEmail = authForm.login.includes('@');
      const loginData = { password: authForm.password };
      
      if (isEmail) {
        loginData.email = authForm.login;
      } else {
        loginData.username = authForm.login;
      }
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ login: '', password: '', passwordConfirm: '', username: '', email: '' });
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
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ login: '', password: '', passwordConfirm: '', username: '', email: '' });
        window.location.reload();
      } else {
        const error = await response.json();
        setAuthError(error.message || 'Ошибка регистрации');
      }
    } catch (error) {
      setAuthError('Ошибка при регистрации');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setToken('');
    setUser(null);
    setMessage('👋 Вы вышли');
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
  const canvas = canvasRef.current;
  console.log(canvas);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let animationFrameId;
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const numDigits = 80; 
  const digits = [];

  for (let i = 0; i < numDigits; i++) {
    digits.push({
      x: Math.random() * width,
      y: Math.random() * height,
      char: Math.random() > 0.5 ? '1' : '0',
      size: Math.floor(Math.random() * 8) + 14,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.3,
      tick: 0,
      tickMax: Math.floor(Math.random() * 60) + 30
    });
  }

  const handleResize = () => {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const animate = () => {
    // Прозрачный фон для эффекта трейлов
    ctx.clearRect(0, 0, width, height);
    // Небольшой белый фон, чтобы цифры были видны
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    digits.forEach((d) => {
      d.x += d.speedX;
      d.y += d.speedY;

      d.tick++;
      if (d.tick >= d.tickMax) {
        d.speedX = (Math.random() - 0.5) * 1.2;
        d.speedY = (Math.random() - 0.5) * 1.2;
        d.char = Math.random() > 0.5 ? '1' : '0';
        d.tick = 0;
        d.tickMax = Math.floor(Math.random() * 60) + 30;
        d.opacity = Math.random() * 0.5 + 0.3;
      }

      // Отражение от стен
      if (d.x < 0 || d.x > width) d.speedX *= -1;
      if (d.y < 0 || d.y > height) d.speedY *= -1;

      // Рисуем цифры с черным цветом и прозрачностью
      ctx.fillStyle = `rgba(0, 0, 0, ${d.opacity})`;
      ctx.font = `700 ${d.size}px monospace`;
      ctx.fillText(d.char, d.x, d.y);
      
      // Эффект тени для читаемости
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(d.char, d.x, d.y);
      ctx.shadowBlur = 0;
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationFrameId);
  };
}, []);

  const stats = {
    pastesCount: userPastes.length,
    filesCount: 8,
    totalSize: '24.5 МБ',
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : 'Неизвестно'
  };

  const getTimeAgo = (date) => {
    if (!date) return 'недавно';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return `${Math.floor(days / 7)} нед назад`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Б';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} КБ`;
    return `${(bytes / 1048576).toFixed(2)} МБ`;
  };

  const getLanguageName = (langId) => {
    const names = {
      javascript: 'JavaScript', python: 'Python', cpp: 'C++', java: 'Java',
      html: 'HTML', css: 'CSS', php: 'PHP', ruby: 'Ruby', go: 'Go',
      rust: 'Rust', sql: 'SQL', text: 'Текст'
    };
    return names[langId] || langId;
  };

  const getLanguageIcon = (langId) => {
    const icons = {
      javascript: 'JS', python: 'PY', cpp: 'CPP', java: 'JAVA',
      html: 'HTML', css: 'CSS', php: 'PHP', ruby: 'RB', go: 'GO',
      rust: 'RS', sql: 'SQL', text: 'TXT'
    };
    return icons[langId] || 'TXT';
  };

  const getCategoryIcon = (catId) => {
    const icons = {
      work: '💼', personal: '👤', food: '🍕', study: '📚',
      travel: '✈️', health: '💪', entertainment: '🎬', other: '📌'
    };
    return icons[catId] || '';
  };

  const getCategoryName = (catId) => {
    const names = {
      work: 'Работа', personal: 'Личная жизнь', food: 'Еда', study: 'Учеба',
      travel: 'Путешествия', health: 'Здоровье', entertainment: 'Развлечения', other: 'Другое'
    };
    return names[catId] || 'Другое';
  };

  const getInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'];

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage('Размер фото не должен превышать 10 МБ');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setMessage('Поддерживаются форматы: JPG, PNG, GIF, WebP, BMP, SVG, TIFF, ICO');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const savedToken = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile/avatar/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        await fetchProfileData();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
          setAvatar(file);
        };
        reader.readAsDataURL(file);
        
        setMessage('Фото обновлено!');
        setTimeout(() => setMessage(''), 3000);
        
        if (data.avatar_url) {
          setProfileData(prev => ({
            ...prev,
            avatar_url: data.avatar_url
          }));
        }
      } else {
        const error = await response.json();
        setMessage(` Ошибка: ${error.error || 'Не удалось загрузить фото'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(' Ошибка при загрузке фото');
      setTimeout(() => setMessage(''), 3000);
    }

    setIsEditingPhoto(false);
  };

  const handleRemoveAvatar = async () => {
    try {
      const savedToken = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile/avatar/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAvatar(null);
        setAvatarPreview(null);
        setMessage(' Фото удалено');
        await fetchProfileData();
        setTimeout(() => setMessage(''), 3000);
        
        setProfileData(prev => ({
          ...prev,
          avatar_url: null
        }));
      } else {
        const error = await response.json();
        setMessage(` Ошибка: ${error.error || 'Не удалось удалить фото'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(' Ошибка при удалении фото');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loadingAuth) {
    return (
      <div className="app-container">
        <canvas ref={canvasRef} className="glitch-bg-canvas" />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
            <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
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
            <Link to="/api/profile/" className="auth-btn" style={{ textDecoration: 'none', color: 'inherit' }}>Личный кабинет</Link>
          </div>
        </header>

        <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="profile-card glass-panel" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', width: '100%' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}><CiLock></CiLock></div>
            <h2 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Войдите в аккаунт</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Чтобы просмотреть профиль, необходимо авторизоваться</p>
            <button 
              className="submit-btn"
              onClick={() => setShowAuthModal(true)}
              style={{ padding: '12px 40px' }}
            >
              Войти
            </button>
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
          <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
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
          <Link to="/api/profile/" className="auth-btn" style={{ textDecoration: 'none', color: 'inherit' }}>Личный кабинет</Link>
        </div>
      </header>

      <main className="main-content" style={{ 
        padding: '40px 20px',
        overflowY: 'auto',
        height: 'calc(100vh - 80px)'
      }}>
        <style>{`
          .profile-workspace-layout {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 1400px;
            display: flex;
            flex-direction: row;
            gap: 30px;
            align-items: flex-start;
            margin: 0 auto;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.72) !important;
            backdrop-filter: blur(16px) saturate(120%);
            -webkit-backdrop-filter: blur(16px) saturate(120%);
            border: 1px solid rgba(255, 255, 255, 0.45) !important;
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.08) !important;
            border-radius: 16px !important;
            padding: 30px !important;
            transition: all 0.3s ease;
          }
          .main-profile-area {
            flex: 3;
            width: 100%;
          }
          .side-profile-area {
            flex: 1;
            width: 100%;
            position: sticky;
            top: 40px;
          }
          .profile-avatar-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255,255,255,0.8);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .profile-avatar-default {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: 700;
            color: white;
            border: 3px solid rgba(255,255,255,0.8);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .avatar-wrapper {
            position: relative;
            flex-shrink: 0;
          }
          .avatar-edit-btn {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: white;
            border: 2px solid #e0e0e0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .avatar-edit-btn:hover {
            transform: scale(1.1);
            border-color: #667eea;
          }
          .avatar-menu {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 8px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 8px;
            min-width: 180px;
            z-index: 10;
            border: 1px solid rgba(0,0,0,0.08);
          }
          .avatar-menu-item {
            display: block;
            width: 100%;
            padding: 10px 16px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            border-radius: 8px;
            font-size: 14px;
            color: #333;
            transition: background 0.15s;
          }
          .avatar-menu-item:hover {
            background: #f5f5f5;
          }
          .avatar-menu-item.danger {
            color: #e53e3e;
          }
          .avatar-menu-item.danger:hover {
            background: #fff5f5;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-top: 12px;
          }
          .stat-card {
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            background: rgba(255,255,255,0.5);
          }
          .stat-number {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
          }
          .stat-label {
            font-size: 13px;
            color: #666;
            margin-top: 4px;
          }
          .profile-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 12px;
          }
          .profile-info-item {
            padding: 16px;
            background: rgba(255,255,255,0.4);
            border-radius: 12px;
          }
          .info-label {
            display: block;
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .info-value {
            display: block;
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
          }
          .info-hint {
            display: block;
            font-size: 11px;
            color: #aaa;
            margin-top: 4px;
          }
          .pastes-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
          }
          .paste-item {
            padding: 16px;
            border-radius: 12px;
            background: rgba(255,255,255,0.35);
            border: 1px solid rgba(255,255,255,0.5);
            transition: all 0.2s;
          }
          .paste-item:hover {
            background: rgba(255,255,255,0.5);
            transform: translateY(-1px);
          }
          .paste-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .paste-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            font-size: 13px;
            color: #666;
          }
          .paste-meta span {
            background: rgba(255,255,255,0.5);
            padding: 2px 10px;
            border-radius: 12px;
          }
          .tag-badge {
            background: rgba(102, 126, 234, 0.15) !important;
            color: #667eea !important;
            font-weight: 500;
          }
          .empty-state {
            padding: 40px 20px;
            text-align: center;
            color: #666;
          }
          .status-badge {
            background: #48bb78;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .info-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0,0,0,0.05);
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-note {
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            line-height: 1.5;
            border-top: 1px solid rgba(0,0,0,0.05);
            padding-top: 16px;
          }
          @media (max-width: 992px) {
            .profile-workspace-layout {
              flex-direction: column;
            }
            .side-profile-area {
              position: static;
            }
          }
          @media (max-width: 600px) {
            .profile-avatar-section {
              flex-direction: column;
              text-align: center;
            }
            .profile-info-grid {
              grid-template-columns: 1fr;
            }
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          .message {
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .message.success {
            background: rgba(72, 187, 120, 0.15);
            color: #38a169;
          }
          .message.error {
            background: rgba(229, 62, 62, 0.15);
            color: #e53e3e;
          }
          .submit-btn {
            background: #000000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .submit-btn:hover {
            background: #333333;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 400px;
            width: 90%;
            position: relative;
            box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .modal-header h2 {
            margin: 0;
            font-size: 22px;
            color: #1a1a1a;
          }
          .modal-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #999;
            transition: color 0.2s;
          }
          .modal-close:hover {
            color: #333;
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }
          .form-group input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }
          .form-group input:focus {
            outline: none;
            border-color: #000000;
          }
          .auth-switch {
            margin-top: 16px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .auth-switch span span {
            color: #000000;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .auth-switch span span:hover {
            opacity: 0.6;
          }
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #000000;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div className="profile-workspace-layout">
          
          <div className="main-profile-area glass-panel">
            <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111' }}>Личный кабинет</h1>
                <p className="profile-subtitle" style={{ color: '#555', marginTop: '6px' }}>Управление профилем и просмотр статистики</p>
              </div>
            </div>

            <div className="profile-avatar-section" style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="avatar-wrapper">
                {profileData?.avatar ? (
                  <img 
                    src={`http://localhost:8000${profileData?.avatar}`} 
                    alt="Аватар пользователя" 
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-default">
                    {getInitials()}
                  </div>
                )}
                
                <button 
                  className="avatar-edit-btn"
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                >
                  <VscDeviceCamera ></VscDeviceCamera >
                </button>

                {isEditingPhoto && (
                  <div className="avatar-menu">
                    <label className="avatar-menu-item">
                      Загрузить фото
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {profileData?.avatar && (
                      <button 
                        className="avatar-menu-item danger"
                        onClick={handleRemoveAvatar}
                      >
                        Удалить фото
                      </button>
                    )}
                    <button 
                      className="avatar-menu-item"
                      onClick={() => setIsEditingPhoto(false)}
                    >
                      Закрыть
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-name">
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111' }}>{profileData?.username || 'Пользователь'}</h2>
                <p className="profile-role" style={{ color: '#666', margin: '4px 0 0 0' }}>Пользователь DocBridge</p>
              </div>
            </div>
            <div className="profile-info-grid" style={{ marginTop: '30px' }}>
              <div className="profile-info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profileData?.email || 'не указан'}</span>
                <span className="info-hint">Изменить нельзя</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">Имя пользователя</span>
                <span className="info-value">{profileData?.username || 'не указан'}</span>
                <span className="info-hint">Изменить нельзя</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">Дата регистрации</span>
                <span className="info-value">{profileData?.date_joined}</span>
              </div>
            </div>

            <div className="profile-stats" style={{ marginTop: '40px' }}>
              <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', color: '#111' }}>Моя статистика</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{statsData?.pastes_count || '-'}</div>
                  <div className="stat-label">Паст создано</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{statsData?.files_count || '-'}</div>
                  <div className="stat-label">Файлов загружено</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats?.total_size || '-'}</div>
                  <div className="stat-label">Всего места</div>
                </div>
              </div>
            </div>

            <div className="profile-pastes" style={{ marginTop: '40px' }}>
  <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', color: '#111' }}>Мои пасты</h3>
  {loading ? (
    <p style={{ color: '#666' }}>Загрузка...</p>
  ) : statsData?.pastes?.length === 0 ? (
    <div className="empty-state">
      <p style={{ margin: 0, fontWeight: '600' }}>У вас пока нет паст</p>
      <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Создайте первую пасту в разделе "Заметки"</p>
    </div>
  ) : (
    <div className="pastes-list">
  {statsData?.pastes?.map((paste) => (
    <div 
      key={paste.id} 
      className="paste-item"
      onClick={() => openPasteView(paste)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="paste-title">
          {getCategoryIcon(paste.category)} {paste.title || 'Без названия'}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation(); // ← Останавливаем всплытие
              navigate(`/api/pastes/edit/${paste.code}/`, {state: {from: 'profile'}});
            }}
            title="Редактировать"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              color: '#667eea'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <GoPencil></GoPencil>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // ← Останавливаем всплытие
              deletePaste(paste.code, e);
            }}
            title="Удалить"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              color: '#dc3545'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <IoTrashOutline></IoTrashOutline>
          </button>
        </div>
      </div>
      <div className="paste-meta">
        <span>{getLanguageIcon(paste.language)} {getLanguageName(paste.language)}</span>
        <span>{getCategoryIcon(paste.category)} {getCategoryName(paste.category)}</span>
        <span><MdAccessTime> </MdAccessTime> {getTimeAgo(paste.created_at || paste.createdAt)}</span>
        <span><CiInboxIn ></CiInboxIn > {formatSize(paste.size)}</span>
        {paste.tags && paste.tags.map((t, i) => (
          <span key={i} className="tag-badge">#{t}</span>
        ))}
      </div>
    </div>
  ))}
</div>
  )}
</div>

            {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>{message}</div>}
          </div>

          <div className="side-profile-area glass-panel">
            <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', color: '#111' }}>О профиле</h3>
            <div className="info-list">
              <div className="info-item">
                <span style={{ color: '#555' }}>Статус</span>
                <span className="status-badge">Активен</span>
              </div>
              <div className="info-item">
                <span style={{ color: '#555' }}>Пасты</span>
                <span style={{ fontWeight: '600' }}>{statsData?.pastes_count || '-'}</span>
              </div>
              <div className="info-item">
                <span style={{ color: '#555' }}>Файлы</span>
                <span style={{ fontWeight: '600' }}>{statsData?.files_count || '-'}</span>
              </div>
              <div className="info-item">
                <span style={{ color: '#555' }}>Место</span>
                <span style={{ fontWeight: '600' }}>{stats?.total_size || '-'}</span>
              </div>
              <div className="info-item">
                <span style={{ color: '#555' }}>Дата регистрации</span>
                <span style={{ fontWeight: '600' }}>{profileData?.date_joined}</span>
              </div>
            </div>
            <p className="info-note">
              <strong>Поддерживаются форматы аватара:</strong><br />
              JPG, PNG, GIF, WebP, BMP, SVG, TIFF, ICO
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ProfilePage;