// DOC-BRIDGE/client/src/App.jsx
import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css';

const API_URL = 'http://localhost:3001';

function App() {
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
  
  // Авторизация
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');

  // Категории
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

  // ===== АВТОРИЗАЦИЯ =====
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

    // Проверка подтверждения пароля при регистрации
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
        setMessage(`✅ ${authMode === 'login' ? 'Вход' : 'Регистрация'} выполнен!`);
        setTimeout(() => setMessage(''), 3000);
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
    setMessage('👋 Вы вышли');
    setTimeout(() => setMessage(''), 3000);
  };

  // ===== ОСТАЛЬНЫЕ ФУНКЦИИ =====
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

  useEffect(() => {
    fetchPastes();
  }, []);

  const fetchPastes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pastes`);
      if (response.ok) {
        const data = await response.json();
        setPastes(data);
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
      const response = await fetch(`${API_URL}/api/pastes/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Паста удалена');
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
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
      const response = await fetch(`${API_URL}/api/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          title: title || 'Без названия',
          content: content,
          language: language,
          category: category,
          tags: tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Паста создана! Код: ${data.code}`);
        setTitle('');
        setContent('');
        setTags([]);
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
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

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          📦 Doc<span>Bridge</span>
        </div>
        <div className="header-actions">
          <span className={`server-status ${serverStatus.includes('✅') ? 'online' : 'offline'}`}>
            {serverStatus}
          </span>
          {user ? (
            <>
              <span className="username">👤 {user.username}</span>
              <button className="logout-btn" onClick={logout}>🚪 Выйти</button>
            </>
          ) : (
            <button className="login-btn" onClick={() => setShowAuthModal(true)}>
              🔑 Войти
            </button>
          )}
        </div>
      </header>

      {/* Модальное окно авторизации */}
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

      <div className="container">
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
              {loading ? '⏳ Создание...' : '🚀 Создать пасту'}
            </button>
          </form>
        </div>

        <div className="public-pastes">
          <h3>
            📋 Все пасты
            <span className="count">{pastes.length}</span>
          </h3>
          {pastes.length === 0 ? (
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
                  <button 
                    className="delete-btn" 
                    onClick={(e) => deletePaste(paste.code, e)}
                    title="Удалить пасту"
                  >
                    🗑️
                  </button>
                </div>
                <div className="paste-meta">
                  <span className="lang">{getLanguageIcon(paste.language)} {getLanguageName(paste.language)}</span>
                  <span className="category">{getCategoryIcon(paste.category)} {getCategoryName(paste.category)}</span>
                  <span className="user">👤 {paste.username || 'Гость'}</span>
                  <span className="time">{getTimeAgo(paste.createdAt)}</span>
                  <span className="size">{formatSize(paste.size)}</span>
                  {paste.tags.map((t, i) => (
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
                    {paste.content.slice(0, 300) + (paste.content.length > 300 ? '...' : '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedPaste && (
        <div className="modal-overlay" onClick={closePaste}>
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
              <span>• 👤 {selectedPaste.username || 'Гость'}</span>
              <span>• {getTimeAgo(selectedPaste.createdAt)}</span>
              <span>• {formatSize(selectedPaste.size)}</span>
              <span>• 👁️ {selectedPaste.views || 0} просмотров</span>
              {selectedPaste.tags.map((t, i) => (
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
                {selectedPaste.content}
              </SyntaxHighlighter>
            </div>
            <div className="modal-footer">
              <span className="paste-code">Код: {selectedPaste.code}</span>
              <button className="modal-close-btn" onClick={closePaste}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2026 DocBridge — Обменник файлов и кода. Сделано с ❤️</p>
      </footer>
    </div>
  );
}

export default App;