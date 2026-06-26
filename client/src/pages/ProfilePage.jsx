// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import './Pages.css';

const API_URL = 'http://localhost:3001';

function ProfilePage({ user }) {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [userPastes, setUserPastes] = useState([]);  // ← НОВОЕ
  const [loading, setLoading] = useState(true);      // ← НОВОЕ

  // ===== ЗАГРУЗКА ПАСТ ПОЛЬЗОВАТЕЛЯ =====
  useEffect(() => {
    if (user) {
      fetchUserPastes();
    }
  }, [user]);

  const fetchUserPastes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pastes/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPastes(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки паст:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== СТАТИСТИКА (реальная) =====
  const stats = {
    pastesCount: userPastes.length,  // ← ТЕПЕРЬ РЕАЛЬНОЕ КОЛИЧЕСТВО
    filesCount: 8,
    totalSize: '24.5 МБ',
    memberSince: 'Июнь 2026'
  };

  // ... остальной код (аватар, обработчики) ...

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
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

  // ===== ПОЛУЧЕНИЕ ИНИЦИАЛОВ =====
  const getInitials = () => {
    if (!user || !user.username) return '👤';
    return user.username.charAt(0).toUpperCase();
  };

  // ===== ОБРАБОТЧИКИ АВАТАРА =====
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico'];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage('⚠️ Размер фото не должен превышать 10 МБ');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setMessage('⚠️ Поддерживаются форматы: JPG, PNG, GIF, WebP, BMP, SVG, TIFF, ICO');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatar(file);
      setMessage('✅ Фото обновлено! (UI-заглушка)');
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsDataURL(file);
    setIsEditingPhoto(false);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    setMessage('✅ Фото удалено');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Войдите в аккаунт</h2>
          <p style={{ color: '#888' }}>Чтобы просмотреть профиль, необходимо авторизоваться</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* ===== ШАПКА ===== */}
        <div className="profile-header">
          <h1>👤 Личный кабинет</h1>
          <p className="profile-subtitle">Управление профилем и просмотр статистики</p>
        </div>

        {/* ===== АВАТАР ===== */}
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
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
              📷
            </button>

            {isEditingPhoto && (
              <div className="avatar-menu">
                <label className="avatar-menu-item">
                  📤 Загрузить фото
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {avatarPreview && (
                  <button 
                    className="avatar-menu-item danger"
                    onClick={handleRemoveAvatar}
                  >
                    🗑️ Удалить фото
                  </button>
                )}
                <button 
                  className="avatar-menu-item"
                  onClick={() => setIsEditingPhoto(false)}
                >
                  ✕ Закрыть
                </button>
              </div>
            )}
          </div>

          <div className="profile-name">
            <h2>{user?.username || 'Пользователь'}</h2>
            <p className="profile-role">Пользователь DocBridge</p>
          </div>
        </div>

        {/* ===== ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ ===== */}
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="info-label">📧 Email</span>
            <span className="info-value">{user?.email || 'не указан'}</span>
            <span className="info-hint">Изменить нельзя</span>
          </div>
          <div className="profile-info-item">
            <span className="info-label">👤 Имя пользователя</span>
            <span className="info-value">{user?.username || 'не указан'}</span>
            <span className="info-hint">Изменить нельзя</span>
          </div>
          <div className="profile-info-item">
            <span className="info-label">📅 Дата регистрации</span>
            <span className="info-value">{stats.memberSince}</span>
          </div>
        </div>

        {/* ===== СТАТИСТИКА ===== */}
        <div className="profile-stats">
          <h3>📊 Моя статистика</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.pastesCount}</div>
              <div className="stat-label">📝 Паст создано</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.filesCount}</div>
              <div className="stat-label">📤 Файлов загружено</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalSize}</div>
              <div className="stat-label">💾 Всего места</div>
            </div>
          </div>
        </div>

        {/* ===== МОИ ПАСТЫ (РЕАЛЬНЫЕ) ===== */}
        <div className="profile-pastes">
          <h3>📝 Мои пасты</h3>
          {loading ? (
            <p style={{ color: '#888' }}>Загрузка...</p>
          ) : userPastes.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              <p>У вас пока нет паст</p>
              <p style={{ fontSize: '13px' }}>Создайте первую пасту в разделе "Пасты"</p>
            </div>
          ) : (
            <div className="pastes-list">
              {userPastes.map((paste) => (
                <div key={paste.id} className="paste-item">
                  <div className="paste-title">
                    {getCategoryIcon(paste.category)} {paste.title}
                  </div>
                  <div className="paste-meta">
                    <span className="lang">{getLanguageIcon(paste.language)} {getLanguageName(paste.language)}</span>
                    <span className="category">{getCategoryIcon(paste.category)} {getCategoryName(paste.category)}</span>
                    <span className="time">{getTimeAgo(paste.createdAt)}</span>
                    <span className="size">{formatSize(paste.size)}</span>
                    {paste.tags.map((t, i) => (
                      <span key={i} className="tag-badge">#{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
      </div>

      {/* ===== ИНФОРМАЦИОННАЯ КАРТОЧКА ===== */}
      <div className="profile-info-card">
        <h3>ℹ️ О профиле</h3>
        <div className="info-list">
          <div className="info-item">
            <span>Статус</span>
            <span className="status-badge">🟢 Активен</span>
          </div>
          <div className="info-item">
            <span>Пасты</span>
            <span>{stats.pastesCount}</span>
          </div>
          <div className="info-item">
            <span>Файлы</span>
            <span>{stats.filesCount}</span>
          </div>
          <div className="info-item">
            <span>Использовано места</span>
            <span>{stats.totalSize}</span>
          </div>
        </div>
        <p className="info-note">
          📷 Поддерживаются: JPG, PNG, GIF, WebP, BMP, SVG, TIFF, ICO
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;