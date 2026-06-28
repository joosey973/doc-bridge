import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './EditPastePage.css';

const API_URL = 'http://localhost:8000/api';

const EditPastePage = () => {
  const { pasteCode } = useParams();
  const navigate = useNavigate();
  const handleBack = () => {
      if (from === 'profile') {
            navigate('/api/profile');
          } else {
            navigate('/api/pastes');
          }
    };
  
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const location = useLocation();
  const from = location.state?.from || 'pastes';
  
  // Данные пасты
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

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

  // Эффект для фона с цифрами (как в MainPage)
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

  const fetchProfileData = async () => {
    try {
      const savedToken = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pastes/edit/${pasteCode}/`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Загрузка данных пасты
  useEffect(() => {
    const fetchPaste = async () => {
      if (!token) {
        navigate('/api/pastes');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/pastes/edit/${pasteCode}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.user.username !== data.paste_user.username) {
            setError('⛔ Вы можете редактировать только свои пасты');
            setTimeout(() => navigate('/api/pastes'), 20000);
            return;
          }
          fetchProfileData();
          setTitle(data.paste.title || '');
          setContent(data.paste.text || '');
          setLanguage(data.paste.language || 'javascript');
          setCategory(data.paste.category || 'other');
          setTags(data.paste.tags || []);
        } else {
          setError('❌ Паста не найдена');
          setTimeout(() => navigate('/api/pastes'), 2000);
        }
      } catch (err) {
        setError('❌ Ошибка загрузки пасты');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  }, [pasteCode, token, user, navigate]);

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

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage('⚠️ Введите содержимое');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/pastes/edit/${pasteCode}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        setMessage('✅ Паста успешно обновлена!');
        setTimeout(() => {
          if (from === 'profile')
          {
            navigate('/api/profile', { 
            state: { message: '✅ Паста успешно обновлена!' }
          });
          } else {
            navigate('/api/pastes', { 
            state: { message: '✅ Паста успешно обновлена!' }
          });
          }
          
        }, 1500);
      } else {
        let errorMessage = 'Ошибка обновления';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ');
          setMessage(`❌ ${errorMessages}`);
        } else if (data.error) {
          setMessage(`❌ ${data.error}`);
        } else if (data.message) {
          setMessage(`❌ ${data.message}`);
        } else {
          setMessage(`❌ ${errorMessage}`);
        }
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setMessage('❌ Ошибка подключения к серверу');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-page-container">
        <canvas ref={canvasRef} className="glitch-bg-canvas" />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Загрузка пасты...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-page-container">
        <canvas ref={canvasRef} className="glitch-bg-canvas" />
        <div className="error-container">
          <h2>{error}</h2>
          <button onClick={() => navigate('/api/pastes')} className="back-btn">
            Вернуться к пастам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page-container">
      <canvas ref={canvasRef} className="glitch-bg-canvas" />
      
      <div className="edit-page-content">
        <div className="edit-page-header">
          <h1>Редактирование пасты</h1>
          <button onClick={() => handleBack()} className="back-btn">
            ← Назад
          </button>
        </div>

        <form onSubmit={handleSave} className="edit-form">
          <div className="form-group">
            <label>Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название пасты..."
              maxLength={100}
              className="edit-input"
            />
          </div>

          <div className="form-group">
            <label>Содержимое</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст или код..."
              rows={12}
              required
              className="edit-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Тип пасты</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="edit-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Подсветка</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="edit-select"
              >
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
                className="tag-input"
              />
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => handleBack()}
              className="cancel-btn"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              disabled={saving}
            >
              {saving ? '⏳ Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>

        <div className="paste-info">
          <span>Код пасты: <strong>{pasteCode}</strong></span>
          <span>•</span>
          <span>Владелец: <strong>{profileData?.username}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default EditPastePage;