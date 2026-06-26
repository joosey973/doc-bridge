// client/src/pages/PastesPage.jsx
import React, { useState, useEffect } from 'react';
import './Pages.css';

const API_URL = 'http://localhost:3001';

function PastesPage({ user }) {
  const [pastes, setPastes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPaste, setSelectedPaste] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

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

  // Языки для подсветки
  const languages = [
    { id: 'text', name: 'Без подсветки', icon: '📝' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'ruby', name: 'Ruby', icon: '💎' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'sql', name: 'SQL', icon: '🗄️' },
  ];

  // Загрузка паст
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

  // Добавление тега
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

  // Создание пасты
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

  // Удаление пасты
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

  // Вспомогательные функции
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
    <div className="pastes-container">
      <div className="pastes-card">
        {/* ===== ШАПКА ===== */}
        <div className="pastes-header">
          <h1>📝 Мои пасты</h1>
          <p className="pastes-subtitle">Создавайте и управляйте своими заметками</p>
        </div>

        {/* ===== ФОРМА СОЗДАНИЯ ===== */}
        <div className="create-paste-form">
          <h2>✏️ Создать новую пасту</h2>
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
                rows={8}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Категория</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Подсветка</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>
                  ))}
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

        {/* ===== СПИСОК ПАСТ ===== */}
        <div className="pastes-list-section">
          <h2>📋 Все пасты</h2>
          <div className="pastes-grid">
            {pastes.length === 0 ? (
              <div className="empty-state">
                <span className="icon">📭</span>
                <p>Нет паст</p>
                <p className="empty-hint">Создайте свою первую пасту!</p>
              </div>
            ) : (
              pastes.map((paste) => (
                <div key={paste.id} className="paste-card">
                  <div className="paste-card-header">
                    <div className="paste-card-title">
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
                  <div className="paste-card-meta">
                    <span className="lang">{getLanguageIcon(paste.language)} {getLanguageName(paste.language)}</span>
                    <span className="category">{getCategoryIcon(paste.category)} {getCategoryName(paste.category)}</span>
                    <span className="user">👤 {paste.username || 'Гость'}</span>
                    <span className="time">{getTimeAgo(paste.createdAt)}</span>
                    <span className="size">{formatSize(paste.size)}</span>
                  </div>
                  {paste.tags.length > 0 && (
                    <div className="paste-card-tags">
                      {paste.tags.map((t, i) => (
                        <span key={i} className="tag-badge">#{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="paste-card-preview">
                    <pre>{paste.content.slice(0, 150)}{paste.content.length > 150 ? '...' : ''}</pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== ИНФОРМАЦИОННАЯ КАРТОЧКА ===== */}
      <div className="pastes-info-card">
        <h3>ℹ️ О пастах</h3>
        <div className="info-list">
          <div className="info-item">
            <span>Всего паст</span>
            <span>{pastes.length}</span>
          </div>
          <div className="info-item">
            <span>Ваших паст</span>
            <span>{pastes.filter(p => p.username === user?.username || p.username === 'Гость').length}</span>
          </div>
          <div className="info-item">
            <span>Языков</span>
            <span>{languages.length}</span>
          </div>
          <div className="info-item">
            <span>Категорий</span>
            <span>{categories.length}</span>
          </div>
        </div>
        <div className="info-tips">
          <h4>💡 Советы:</h4>
          <ul>
            <li>Используйте теги для поиска</li>
            <li>Выбирайте язык для подсветки</li>
            <li>Пасты удаляют только авторы</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PastesPage;