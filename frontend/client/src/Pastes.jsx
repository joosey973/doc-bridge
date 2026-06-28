import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Pastes.css';
import './MainPage.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const API_URL = 'http://localhost:8000/api';

function Pastes() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [pastes, setPastes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('⏳ Проверка...');
  const [selectedPaste, setSelectedPaste] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
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

  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');

  const categories = [
    { id: 'work', name: '💼 Работа' },
    { id: 'personal', name: '👤 Личная жизнь' },
    { id: 'food', name: '🍕 Еда' },
    { id: 'study', name: '📚 Учеба' },
    { id: 'travel', name: '✈️ Путешествия' },
    { id: 'health', name: '💪 Здоровье' },
    { id: 'entertainment', name: '🎬 Развлечения' },
    { id: 'other', name: '📌 Другое' },
  ];

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
            setUser(data.user);
            setToken(savedToken);
            setProfileData(data.user);
          } else {
            localStorage.removeItem('token');
            setToken('');
            setUser(null);
            setProfileData(null);
          }
        } catch (error) {
          console.error('❌ Ошибка проверки:', error);
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
          setProfileData(null);
        }
      }
      
      setLoadingAuth(false);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/auth/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfileData(data.user);
      } else {
        setToken('');
        localStorage.removeItem('token');
        setUser(null);
        setProfileData(null);
      }
    } catch (error) {
      console.error('❌ Ошибка профиля:', error);
      setToken('');
      localStorage.removeItem('token');
      setUser(null);
      setProfileData(null);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register' && authPassword !== authPasswordConfirm) {
      setAuthError('❌ Пароли не совпадают!');
      return;
    }

    try {
      const endpoint = authMode === 'login' ? 'login/' : 'register/';
      
      const body = authMode === 'login' 
        ? { username: authUsername, password: authPassword }
        : { 
            username: authUsername, 
            password: authPassword,
            password_confirm: authPasswordConfirm,
            email: authEmail 
          };
      
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        const newToken = String(data.token || '');
        
        if (!newToken || newToken === 'undefined' || newToken === 'null') {
          setAuthError('❌ Ошибка: не получен токен');
          return;
        }
        
        setToken(newToken);
        localStorage.setItem('token', newToken);
        setUser(data.user);
        setProfileData(data.user);
        
        setShowAuthModal(false);
        setAuthUsername('');
        setAuthPassword('');
        setAuthPasswordConfirm('');
        setAuthEmail('');
        setMessage(`✅ ${authMode === 'login' ? 'Вход' : 'Регистрация'} выполнен!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(' ');
          setAuthError(`❌ ${errorMessages}`);
        } else {
          setAuthError(data.error || 'Ошибка авторизации');
        }
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      setAuthError('❌ Ошибка подключения к серверу');
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setProfileData(null);
    localStorage.removeItem('token');
    setMessage('👋 Вы вышли');
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/pastes/`);
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

  useEffect(() => {
    fetchPastes();
  }, []);

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

  const getAvatarUrl = () => {
    if (profileData?.avatar) {
      return `http://localhost:8000${profileData?.avatar}`;
    }
    return null;
  };

  const incrementViews = async (pasteId) => {
    const viewedPastes = JSON.parse(localStorage.getItem('viewedPastes') || '[]');
    
    try {
      const response = await fetch(`${API_URL}/pastes/${pasteId}/increment-views/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      viewedPastes.push(pasteId);
      localStorage.setItem('viewedPastes', JSON.stringify(viewedPastes));
      
      setSelectedPaste(prev => ({
        ...prev,
        views: data.views
      }));
      
      setPastes(prevPastes => 
        prevPastes.map(p => 
          p.id === pasteId 
            ? { ...p, views: data.views }
            : p
        )
      );
      
    } catch (error) {
      console.error('Ошибка увеличения просмотров:', error);
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
      const response = await fetch(`${API_URL}/pastes/${code}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      
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

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const submitPaste = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage('⚠️ Введите содержимое');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/pastes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          title: title || 'Без названия',
          text: content,
          language: language,
          category: category,
          tags: tags,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Паста создана! Код: ${data.paste.code}`);
        setTitle('');
        setContent('');
        setTags([]);
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        let errorMessage = 'Ошибка создания';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ');
          setMessage(`❌ ${errorMessages}`);
        } else if (data.error) {
            errorMessage = data.error;
        } else if (data.message) {
            errorMessage = data.message;
        }
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
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
      javascript: 'JavaScript',
      python: 'Python',
      cpp: 'C++',
      java: 'Java',
      html: 'HTML',
      css: 'CSS',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      sql: 'SQL',
      text: 'Текст'
    };
    return names[langId] || langId;
  };

  const getLanguageIcon = (langId) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      cpp: '⚡',
      java: '☕',
      html: '🌐',
      css: '🎨',
      php: '🐘',
      ruby: '💎',
      go: '🐹',
      rust: '🦀',
      sql: '🗄️',
      text: '📝'
    };
    return icons[langId] || '📝';
  };

  const openPaste = (paste) => {
    incrementViews(paste.id);
    setSelectedPaste(paste);
  };

  const closePaste = () => {
    setSelectedPaste(null);
  };

  const getCategoryIcon = (catId) => {
    const icons = {
      work: '💼',
      personal: '👤',
      food: '🍕',
      study: '📚',
      travel: '✈️',
      health: '💪',
      entertainment: '🎬',
      other: '📌'
    };
    return icons[catId] || '📌';
  };

  const getCategoryName = (catId) => {
    const names = {
      work: 'Работа',
      personal: 'Личная жизнь',
      food: 'Еда',
      study: 'Учеба',
      travel: 'Путешествия',
      health: 'Здоровье',
      entertainment: 'Развлечения',
      other: 'Другое'
    };
    return names[catId] || 'Другое';
  };

  const closeMenu = () => setIsOpen(false);

  if (loadingAuth) {
    return (
      <div className="app" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
        <canvas ref={canvasRef} className="glitch-bg-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />
        <div className="loading-screen" style={{ position: 'relative', zIndex: 1 }}>
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
          <li><a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>О нас</a></li>
          <li><Link to="/api/pastes/" onClick={closeMenu}>Заметки</Link></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); }}>Хранилище</a></li>
        </ul>
      </nav>

      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link>
        </h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
            <span className="notification-badge"></span>
            ➤
          </button>
          <Link to="/api/profile/" style={{ textDecoration: 'none', color: 'inherit' }}>
          {user ? (
            <>
              {getAvatarUrl() ? (
                <img 
                  src={getAvatarUrl()} 
                  alt="Аватар пользователя" 
                  className="profile-avatar-img"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255,255,255,0.8)'
                  }}
                />
              ) : (
                <div className="profile-avatar-default" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </>
          ) : (user?.username?.charAt(0)?.toUpperCase() || 'U')}
        </Link>
        </div>
      </header>

      <div className="main-content" style={{ height: 'auto', minHeight: 'calc(100vh - 80px)', padding: '40px 20px', overflowY: 'auto' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="create-paste">
            <h2>📝 Новая паста</h2>
            <form onSubmit={submitPaste}>
              <div className="form-group">
                <label>Заголовок</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название пасты..."
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Содержимое</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Введите текст или код..."
                  rows={10}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Тип пасты</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Подсветка</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="javascript">🟨 JavaScript</option>
                    <option value="python">🐍 Python</option>
                    <option value="cpp">⚡ C++</option>
                    <option value="java">☕ Java</option>
                    <option value="html">🌐 HTML</option>
                    <option value="css">🎨 CSS</option>
                    <option value="php">🐘 PHP</option>
                    <option value="ruby">💎 Ruby</option>
                    <option value="go">🐹 Go</option>
                    <option value="rust">🦀 Rust</option>
                    <option value="sql">🗄️ SQL</option>
                    <option value="text">📝 Текст</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Теги</label>
                <div className="tags-input">
                  {tags.map((tag, i) => (
                    <span key={i} className="tag">
                      #{tag}
                      <span className="remove" onClick={() => removeTag(i)}>×</span>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Тег и Enter"
                  />
                </div>
              </div>

              {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '⏳ Создание...' : 'Создать пасту'}
              </button>
            </form>
          </div>
          
          <div className="public-pastes">
  <h3>
    📋 Все пасты
    <span className="count">{pastes.length}</span>
  </h3>
  
  {!user ? (
    <div className="empty-state" style={{ 
      textAlign: 'center', 
      padding: '60px 20px',
      background: 'rgba(255,255,255,0.5)',
      borderRadius: '16px'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
      <h2 style={{ color: '#1a1a1a', marginBottom: '10px', fontSize: '24px' }}>
        Войдите в аккаунт
      </h2>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>
        Чтобы просмотреть пасты, необходимо авторизоваться
      </p>
      <button 
        className="submit-btn"
        onClick={() => setShowAuthModal(true)}
        style={{ 
          padding: '12px 40px',
          background: '#000000',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        Войти
      </button>
    </div>
  ) : (
    pastes.length === 0 ? (
      <div className="empty-state">
        <span className="icon">📭</span>
        <p>Нет паст</p>
        <p style={{ fontSize: '13px', marginTop: '8px' }}>Создайте первую!</p>
      </div>
    ) : (
      pastes.map((paste) => (
        <div key={paste.id} className="paste-item" onClick={() => openPaste(paste)}>
          <div className="paste-header">
            <div className="paste-title">
              <span className="category-icon">{getCategoryIcon(paste.category)}</span>
              {paste.title}
            </div>
          </div>
          <div className="paste-meta">
            <span className="lang">{getLanguageIcon(paste.language)} {getLanguageName(paste.language)}</span>
            <span className="category">{getCategoryIcon(paste.category)} {getCategoryName(paste.category)}</span>
            <span className="user">👤 {paste.user || 'Гость'}</span>
            <span className="time">{getTimeAgo(paste.created_at)}</span>
            <span className="size">{formatSize(paste.size)}</span>
            {paste.tags && paste.tags.map((t, i) => (
              <span key={i} className="tag-badge">#{t}</span>
            ))}
          </div>
          <div className="paste-preview">
            <SyntaxHighlighter
              language={paste.language === 'text' ? 'text' : paste.language}
              style={atomOneDark}
              customStyle={{
                fontSize: '12px',
                maxHeight: '80px',
                margin: 0,
                padding: '10px',
                borderRadius: '4px',
                background: '#1a1a1a',
                overflow: 'hidden'
              }}
              wrapLines={true}
            >
              {paste.text ? paste.text.slice(0, 300) + (paste.text.length > 300 ? '...' : '') : ''}
            </SyntaxHighlighter>
          </div>
        </div>
      ))
    )
  )}
</div>
        </div>
      </div>

      <footer className="bottom-footer">
        <div className="footer-buttons">
          <button className="footer-btn">Политика</button>
          <button className="footer-btn">Условия</button>
          <button className="footer-btn">Контакты</button>
        </div>
      </footer>
      
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)} style={{ zIndex: 200 }}>
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
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
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
      
      {selectedPaste && (
        <div className="modal-overlay" onClick={closePaste} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="category-icon">{getCategoryIcon(selectedPaste.category)}</span>
                {selectedPaste.title}
              </h2>
              <button className="modal-close" onClick={closePaste}>✕</button>
            </div>
            <div className="modal-meta">
              <span>{getLanguageIcon(selectedPaste.language)} {getLanguageName(selectedPaste.language)}</span>
              <span>• {getCategoryIcon(selectedPaste.category)} {getCategoryName(selectedPaste.category)}</span>
              <span>• 👤 {selectedPaste.user || 'Гость'}</span>
              <span>• {getTimeAgo(selectedPaste.created_at)}</span>
              <span>• {formatSize(selectedPaste.size)}</span>
              <span>• 👁️ {selectedPaste.views || 0} просмотров</span>
              {selectedPaste.tags && selectedPaste.tags.map((t, i) => (
                <span key={i} className="tag-badge">#{t}</span>
              ))}
            </div>
            <div className="modal-body">
              <SyntaxHighlighter
                language={selectedPaste.language === 'text' ? 'text' : selectedPaste.language}
                style={atomOneDark}
                customStyle={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  padding: '20px',
                  borderRadius: '8px',
                  background: '#1a1a1a',
                  margin: 0
                }}
                wrapLines={true}
                wrapLongLines={true}
              >
                {selectedPaste.text || ''}
              </SyntaxHighlighter>
            </div>
            <div className="modal-footer">
              <span className="paste-code">Код: {selectedPaste.code}</span>
              <button className="modal-close-btn" onClick={closePaste}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pastes;