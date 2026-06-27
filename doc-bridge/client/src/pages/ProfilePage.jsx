import React, { useState, useEffect, useRef } from 'react';
import './Pages.css';

const API_URL = 'http://localhost:3001';

function ProfilePage({ user }) {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [userPastes, setUserPastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // ===== ФОН С ЦИФРАМИ =====
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

  // ===== ЗАГРУЗКА ПАСТ =====
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

  const stats = {
    pastesCount: userPastes.length,
    filesCount: 8,
    totalSize: '24.5 МБ',
    memberSince: 'Июнь 2026'
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
      work: '[W]', personal: '[P]', food: '[F]', study: '[S]',
      travel: '[T]', health: '[H]', entertainment: '[E]', other: '[O]'
    };
    return icons[catId] || '[O]';
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

  const handleAvatarChange = (e) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatar(file);
      setMessage('✅ Фото обновлено!');
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsDataURL(file);
    setIsEditingPhoto(false);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    setMessage('Фото удалено');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) {
    return (
      <div className="profile-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <canvas ref={canvasRef} className="glitch-bg-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />
        <div className="profile-card glass-panel" style={{ textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Войдите в аккаунт</h2>
          <p style={{ color: '#666' }}>Чтобы просмотреть профиль, необходимо авторизоваться</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 20px'
    }}>
      {/* Стили для красивого размытия и адаптивности во весь экран */}
      <style>{`
        .profile-workspace-layout {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          flex-direction: row;
          gap: 30px;
          align-items: flex-start;
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
        @media (max-width: 992px) {
          .profile-workspace-layout {
            flex-direction: column;
          }
          .side-profile-area {
            position: static;
          }
        }
      `}</style>

      <canvas ref={canvasRef} className="glitch-bg-canvas" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />
      
      {/* Контейнер теперь растягивается на всю ширину (100%) */}
      <div className="profile-workspace-layout">
        
        {/* ЛЕВАЯ ЧАСТЬ: Личный кабинет (Занимает 3/4 ширины) */}
        <div className="main-profile-area glass-panel">
          <div className="profile-header">
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#111' }}>Личный кабинет</h1>
            <p className="profile-subtitle" style={{ color: '#555', marginTop: '6px' }}>Управление профилем и просмотр статистики</p>
          </div>

          <div className="profile-avatar-section" style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="avatar-wrapper" style={{ position: 'relative' }}>
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
                    Загрузить фото
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
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111' }}>{user?.username || 'Пользователь'}</h2>
              <p className="profile-role" style={{ color: '#666', margin: '4px 0 0 0' }}>Пользователь DocBridge</p>
            </div>
          </div>

          <div className="profile-info-grid" style={{ marginTop: '30px' }}>
            <div className="profile-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email || 'не указан'}</span>
              <span className="info-hint">Изменить нельзя</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Имя пользователя</span>
              <span className="info-value">{user?.username || 'не указан'}</span>
              <span className="info-hint">Изменить нельзя</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Дата регистрации</span>
              <span className="info-value">{stats.memberSince}</span>
            </div>
          </div>

          <div className="profile-stats" style={{ marginTop: '40px' }}>
            <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', color: '#111' }}>Моя статистика</h3>
            <div className="stats-grid">
              <div className="stat-card" style={{ background: 'rgba(255,255,255,0.4)' }}>
                <div className="stat-number">{stats.pastesCount}</div>
                <div className="stat-label">Паст создано</div>
              </div>
              <div className="stat-card" style={{ background: 'rgba(255,255,255,0.4)' }}>
                <div className="stat-number">{stats.filesCount}</div>
                <div className="stat-label">Файлов загружено</div>
              </div>
              <div className="stat-card" style={{ background: 'rgba(255,255,255,0.4)' }}>
                <div className="stat-number">{stats.totalSize}</div>
                <div className="stat-label">Всего места</div>
              </div>
            </div>
          </div>

          <div className="profile-pastes" style={{ marginTop: '40px' }}>
            <h3 style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', color: '#111' }}>Мои пасты</h3>
            {loading ? (
              <p style={{ color: '#666' }}>Загрузка...</p>
            ) : userPastes.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                <p style={{ margin: 0, fontWeight: '600' }}>У вас пока нет паст</p>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Создайте первую пасту в разделе "Пасты"</p>
              </div>
            ) : (
              <div className="pastes-list">
                {userPastes.map((paste) => (
                  <div key={paste.id} className="paste-item" style={{ background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.5)' }}>
                    <div className="paste-title" style={{ fontWeight: '600', color: '#111' }}>
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

          {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>{message}</div>}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: О профиле (Занимает 1/4 ширины и аккуратно дополняет экран) */}
        <div className="side-profile-area glass-panel">
          <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px', color: '#111' }}>О профиле</h3>
          <div className="info-list">
            <div className="info-item" style={{ display: 'flex', justifyContent: 'between', padding: '10px 0' }}>
              <span style={{ color: '#555' }}>Статус</span>
              <span className="status-badge" style={{ marginLeft: 'auto' }}>Активен</span>
            </div>
            <div className="info-item" style={{ display: 'flex', justifyContent: 'between', padding: '10px 0' }}>
              <span style={{ color: '#555' }}>Пасты</span>
              <span style={{ marginLeft: 'auto', fontWeight: '600' }}>{stats.pastesCount}</span>
            </div>
            <div className="info-item" style={{ display: 'flex', justifyContent: 'between', padding: '10px 0' }}>
              <span style={{ color: '#555' }}>Файлы</span>
              <span style={{ marginLeft: 'auto', fontWeight: '600' }}>{stats.filesCount}</span>
            </div>
            <div className="info-item" style={{ display: 'flex', justifyContent: 'between', padding: '10px 0' }}>
              <span style={{ color: '#555' }}>Место</span>
              <span style={{ marginLeft: 'auto', fontWeight: '600' }}>{stats.totalSize}</span>
            </div>
          </div>
          <p className="info-note" style={{ fontSize: '12px', color: '#666', marginTop: '25px', lineHeight: '1.4', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
            <strong>Поддерживаются форматы аватара:</strong><br />
            JPG, PNG, GIF, WebP, BMP, SVG, TIFF, ICO
          </p>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;