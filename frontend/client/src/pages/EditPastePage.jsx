import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './EditPastePage.css';

// Импорт иконок
import { ImFileText2 } from "react-icons/im";
import { VscFolderLibrary } from "react-icons/vsc";
import { BsPersonWorkspace } from "react-icons/bs";
import { MdOutlineFastfood } from "react-icons/md";
import { PiBookBookmarkThin } from "react-icons/pi";
import { IoIosAirplane, IoIosStarOutline, IoIosArrowDown } from "react-icons/io";
import { CiMedicalCross } from "react-icons/ci";
import { PiFilmSlateLight } from "react-icons/pi";
import { AiOutlinePython } from "react-icons/ai";
import { SiCplusplusbuilder, SiRust } from "react-icons/si";
import { GoPaperAirplane } from "react-icons/go";
import { 
  MdOutlineWorkOutline,
  MdEdit,
  MdDelete,
  MdClose,
  MdLock,
  MdPersonOutline,
  MdAccessTime,
  MdCode,
  MdLabel,
  MdCreate,
  MdVisibility
} from "react-icons/md";
import { 
  DiJavascript1,  
  DiJava, 
  DiHtml5, 
  DiCss3, 
  DiPhp, 
  DiRuby, 
  DiGo
} from "react-icons/di";
import { SiSqlite } from "react-icons/si";
import { FaFileAlt, FaLock } from "react-icons/fa";

const API_URL = 'http://localhost:8000/api';

const EditPastePage = () => {
  const { pasteCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || 'pastes';
  const user = location.state?.usr || null;

  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Состояния для кастомных селектов
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const categoryRef = useRef(null);
  const languageRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Данные пасты
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const token = localStorage.getItem('token');

  // Опции для категорий с иконками
  const categories = [
    { id: 'work', name: 'Работа', icon: <MdOutlineWorkOutline size={16} /> },
    { id: 'personal', name: 'Личная жизнь', icon: <BsPersonWorkspace size={16} /> },
    { id: 'food', name: 'Еда', icon: <MdOutlineFastfood size={16} /> },
    { id: 'study', name: 'Учеба', icon: <PiBookBookmarkThin size={16} /> },
    { id: 'travel', name: 'Путешествия', icon: <IoIosAirplane size={16} /> },
    { id: 'health', name: 'Здоровье', icon: <CiMedicalCross size={16} /> },
    { id: 'entertainment', name: 'Развлечения', icon: <PiFilmSlateLight size={16} /> },
    { id: 'other', name: 'Другое', icon: <IoIosStarOutline size={16} /> },
  ];

  // Опции для языков с иконками
  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', icon: <DiJavascript1 size={16} /> },
    { value: 'python', label: 'Python', icon: <AiOutlinePython size={16} /> },
    { value: 'cpp', label: 'C++', icon: <SiCplusplusbuilder size={16} /> },
    { value: 'java', label: 'Java', icon: <DiJava size={16} /> },
    { value: 'html', label: 'HTML', icon: <DiHtml5 size={16} /> },
    { value: 'css', label: 'CSS', icon: <DiCss3 size={16} /> },
    { value: 'php', label: 'PHP', icon: <DiPhp size={16} /> },
    { value: 'ruby', label: 'Ruby', icon: <DiRuby size={16} /> },
    { value: 'go', label: 'Go', icon: <DiGo size={25} /> },
    { value: 'rust', label: 'Rust', icon: <SiRust size={16} /> },
    { value: 'sql', label: 'SQL', icon: <SiSqlite size={16} /> },
    { value: 'text', label: 'Текст', icon: <FaFileAlt size={16} /> },
  ];

  // Закрытие кастомных селектов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Эффект для фона с цифрами
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
        
        d.tick++;
        if (d.tick >= d.tickMax) {
          d.x += (Math.random() - 0.5) * 60;
          d.y += (Math.random() - 0.5) * 60;
          if (Math.random() > 0.5) d.char = Math.random() > 0.5 ? '1' : '0';
          d.tick = 0;
          d.tickMax = Math.floor(Math.random() * 20) + 10;
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
  }, []);

  const handleBack = () => {
    if (from === 'profile') {
      navigate('/api/profile');
    } else {
      navigate('/api/pastes');
    }
  };

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
            setError('Вы можете редактировать только свои пасты');
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
          setError('Паста не найдена');
          setTimeout(() => navigate('/api/pastes'), 2000);
        }
      } catch (err) {
        setError('Ошибка загрузки пасты');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  }, [pasteCode, token, navigate]);

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
      setMessage('Введите содержимое');
      setMessageType('error');
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
        setMessage('Паста успешно обновлена!');
        setMessageType('success');
        setTimeout(() => {
          if (from === 'profile') {
            navigate('/api/profile', {
              state: { message: 'Паста успешно обновлена!' }
            });
          } else {
            navigate('/api/pastes', {
              state: { message: 'Паста успешно обновлена!' }
            });
          }
        }, 1500);
      } else {
        let errorMessage = 'Ошибка обновления';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ');
          setMessage(`${errorMessages}`);
          setMessageType('error');
        } else if (data.error) {
          setMessage(`${data.error}`);
          setMessageType('error');
        } else if (data.message) {
          setMessage(`${data.message}`);
          setMessageType('error');
        } else {
          setMessage(`${errorMessage}`);
          setMessageType('error');
        }
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setMessage('Ошибка подключения к серверу');
      setMessageType('error');
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
          <button onClick={handleBack} className="back-btn">
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
            {/* Кастомный селект для категории */}
            <div className="form-group">
              <label>Тип пасты</label>
              <div className="custom-select" ref={categoryRef}>
                <div 
                  className="custom-select-trigger"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <span className="custom-select-value">
                    {categories.find(c => c.id === category)?.icon} {categories.find(c => c.id === category)?.name}
                  </span>
                  <IoIosArrowDown className={`custom-select-arrow ${isCategoryOpen ? 'open' : ''}`} />
                </div>
                {isCategoryOpen && (
                  <div className="custom-select-options">
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className={`custom-select-option ${category === cat.id ? 'selected' : ''}`}
                        onClick={() => {
                          setCategory(cat.id);
                          setIsCategoryOpen(false);
                        }}
                      >
                        {cat.icon} {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Кастомный селект для языка */}
            <div className="form-group">
              <label>Подсветка</label>
              <div className="custom-select" ref={languageRef}>
                <div 
                  className="custom-select-trigger"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                >
                  <span className="custom-select-value">
                    {languageOptions.find(l => l.value === language)?.icon} {languageOptions.find(l => l.value === language)?.label}
                  </span>
                  <IoIosArrowDown className={`custom-select-arrow ${isLanguageOpen ? 'open' : ''}`} />
                </div>
                {isLanguageOpen && (
                  <div className="custom-select-options">
                    {languageOptions.map(lang => (
                      <div
                        key={lang.value}
                        className={`custom-select-option ${language === lang.value ? 'selected' : ''}`}
                        onClick={() => {
                          setLanguage(lang.value);
                          setIsLanguageOpen(false);
                        }}
                      >
                        {lang.icon} {lang.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Теги</label>
            <div className="tags-input">
              {tags.map((tag, i) => (
                <span key={i} className="tag">
                  <MdLabel size={12} style={{ marginRight: '4px' }} />
                  {tag}
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
            <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleBack}
              className="cancel-btn"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>

        <div className="paste-info">
          <span>Код пасты: <strong>{pasteCode}</strong></span>
          <span>•</span>
          <span>Владелец: <strong>{profileData?.username || 'Аноним'}</strong></span>
        </div>
      </div>

        
    </div>
  );
};

export default EditPastePage;