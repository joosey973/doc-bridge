import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Pastes.css';
import './MainPage.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
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
  DiGo} from "react-icons/di";
import { SiSqlite } from "react-icons/si";
import { FaFileAlt, FaLock } from "react-icons/fa";
import { 
  IoTrashOutline 
} from "react-icons/io5";

const API_URL = 'http://localhost:8000/api';

function Pastes() {
  const navigate = useNavigate();
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
  const [serverStatus, setServerStatus] = useState('Проверка...');
  const [selectedPaste, setSelectedPaste] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Состояния для кастомного select
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const categoryRef = useRef(null);
  const languageRef = useRef(null);
  
  const [editingPaste, setEditingPaste] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);
 
  
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);
  
  // Закрытие кастомных select при клике вне
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
    
  const openPasteView = (paste) => {
    setTimeout(() => {
      navigate(`/api/pastes/view/${paste.code}/`, { 
        state: { from: 'pastes' } 
      });
    }, 2000);
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
          
          d.y += (targetY - d.y) * 0.1;
          
          d.tick++;
          if (d.tick > 5) {
            d.x += 12;
            if (Math.random() > 0.85) d.char = d.char === '1' ? '0' : '1';
            d.tick = 0;
          }

          if (idx % rows === 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.fillRect(0, targetY + 2, width, 1);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; 
          }
        } else {
          d.x += d.speedX;
          d.y += d.speedY;

          d.tick++;
          if (d.tick >= d.tickMax) {
            d.speedX = (Math.random() - 0.5) * 2;
            d.speedY = (Math.random() - 0.5) * 2;
            if (Math.random() > 0.5) d.char = Math.random() > 0.5 ? '1' : '0';
            d.tick = 0;
            d.tickMax = Math.floor(Math.random() * 40) + 20;
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
  }, []);

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
    { id: 'work', name: 'Работа', icon: <MdOutlineWorkOutline size={16} /> },
    { id: 'personal', name: 'Личная жизнь', icon: <BsPersonWorkspace size={16} /> },
    { id: 'food', name: 'Еда', icon: <MdOutlineFastfood size={16} /> },
    { id: 'study', name: 'Учеба', icon: <PiBookBookmarkThin size={16} /> },
    { id: 'travel', name: 'Путешествия', icon: <IoIosAirplane size={16} /> },
    { id: 'health', name: 'Здоровье', icon: <CiMedicalCross size={16} /> },
    { id: 'entertainment', name: 'Развлечения', icon: <PiFilmSlateLight size={16} /> },
    { id: 'other', name: 'Другое', icon: <IoIosStarOutline size={16} /> },
  ];

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', icon: <DiJavascript1 size={16} /> },
    { value: 'python', label: 'Python', icon: <AiOutlinePython size={16} /> },
    { value: 'cpp', label: 'C++', icon: <SiCplusplusbuilder size={16} /> },
    { value: 'java', label: 'Java', icon: <DiJava size={16} /> },
    { value: 'html', label: 'HTML', icon: <DiHtml5 size={16} /> },
    { value: 'css', label: 'CSS', icon: <DiCss3 size={16} /> },
    { value: 'php', label: 'PHP', icon: <DiPhp size={16} /> },
    { value: 'ruby', label: 'Ruby', icon: <DiRuby size={14} /> },
    { value: 'go', label: 'Go', icon: <DiGo size={25} /> },
    { value: 'rust', label: 'Rust', icon: <SiRust size={16} /> },
    { value: 'sql', label: 'SQL', icon: <SiSqlite size={16} /> },
    { value: 'text', label: 'Текст', icon: <FaFileAlt size={16} /> },
  ];

  const openEditModal = (pasteCode) => {
    if (!token) {
      setMessage('Авторизуйтесь, чтобы редактировать пасты');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    navigate(`/api/pastes/edit/${pasteCode}/`);
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
          console.error('Ошибка проверки:', error);
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register' && authPassword !== authPasswordConfirm) {
      setAuthError('Пароли не совпадают!');
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
          setAuthError('Ошибка: не получен токен');
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
        setMessage(`${authMode === 'login' ? 'Вход' : 'Регистрация'} выполнен!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(' ');
          setAuthError(`${errorMessages}`);
        } else {
          setAuthError(data.error || 'Ошибка авторизации');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Ошибка подключения к серверу');
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setProfileData(null);
    localStorage.removeItem('token');
    setMessage('Вы вышли');
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/pastes/`);
        if (response.ok) {
          setServerStatus('Сервер работает');
        } else {
          setServerStatus('Сервер недоступен');
        }
      } catch {
        setServerStatus('Сервер не запущен');
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
          ...(token && { 'Authorization': `Bearer ${token}` })
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
      setMessage('Авторизуйтесь, чтобы удалять пасты');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (!confirm(`Удалить пасту "${code}"?`)) {
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
        setMessage('Паста удалена');
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`${data.error || 'Ошибка удаления'}`);
      }
    } catch (error) {
      setMessage('Ошибка удаления');
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
      setMessage('Введите содержимое');
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
        setMessage(`Паста создана! Код: ${data.paste.code}`);
        openPasteView(data.paste);
        setTitle('');
        setContent('');
        setTags([]);
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        let errorMessage = 'Ошибка создания';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(', ');
          setMessage(`${errorMessages}`);
        } else if (data.error) {
            errorMessage = data.error;
        } else if (data.message) {
            errorMessage = data.message;
        }
        setMessage(`${errorMessage}`);
      }
    } catch (error) {
      setMessage('Ошибка подключения к серверу');
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
      javascript: <DiJavascript1 size={16} />,
      python: <AiOutlinePython size={16} />,
      cpp: <SiCplusplusbuilder size={16} />,
      java: <DiJava size={16} />,
      html: <DiHtml5 size={16} />,
      css: <DiCss3 size={16} />,
      php: <DiPhp size={16} />,
      ruby: <DiRuby size={16} />,
      go: <DiGo size={30} />,
      rust: <SiRust size={16} />,
      sql: <SiSqlite size={16} />,
      text: <FaFileAlt size={16} />
    };
    return icons[langId] || <FaFileAlt size={16} />;
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
      work: <MdOutlineWorkOutline size={16} />,
      personal: <BsPersonWorkspace size={16} />,
      food: <MdOutlineFastfood size={16} />,
      study: <PiBookBookmarkThin size={16} />,
      travel: <IoIosAirplane size={16} />,
      health: <CiMedicalCross size={16} />,
      entertainment: <PiFilmSlateLight size={16} />,
      other: <IoIosStarOutline size={16} />
    };
    return icons[catId] || <IoIosStarOutline size={16} />;
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
          <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
          <li><Link to="/api/converter/" onClick={closeMenu}>Конвертер</Link></li>
          <li><Link to="/api/compress/" onClick={closeMenu}>Сжатие</Link></li>
          <li><Link to="/api/droppage/" onClick={closeMenu}>Файлообменник</Link></li>
          <li><Link to="/api/about/" onClick={closeMenu}>О нас</Link></li>
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

      <div className="main-content" style={{ flex: '1 1 auto', padding: '40px 20px', overflowY: 'auto' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '140px' }}>
          <div className="create-paste">
            <h2><ImFileText2 size={20} style={{ marginRight: '8px' }} /> Новая паста</h2>
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
                  {/* Кастомный select для категорий */}
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

                <div className="form-group">
                  <label>Подсветка</label>
                  {/* Кастомный select для языков */}
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
                  />
                </div>
              </div>

              {message && <div className={`message ${message.includes('выполнен') || message.includes('создана') || message.includes('удалена') ? 'success' : 'error'}`}>{message}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Создание...' : 'Создать пасту'}
              </button>
            </form>
          </div>
          
          <div className="public-pastes">
            <h3>
              <VscFolderLibrary size={20} style={{ marginRight: '8px' }} /> Все пасты
              <span className="count">{pastes.length}</span>
            </h3>
            
            {!user ? (
              <div className="empty-state" style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}><FaLock size={64} /></div>
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
                  <FaFileAlt size={48} style={{ color: '#ccc' }} />
                  <p>Нет паст</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Создайте первую!</p>
                </div>
              ) : (
                <div className="paste-list">
                  {pastes.map((paste) => {
                    const isOwner = user && paste.user === user.username;
                    return (
                      <div key={paste.id} className="paste-item" onClick={() => openPaste(paste)}>
                        <div className="paste-header">
                          <div className="paste-title">
                            <span className="category-icon">{getCategoryIcon(paste.category)}</span>
                            {paste.title}
                          </div>
                          <div className="paste-actions">
                            {isOwner && (
                              <>
                                <button 
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(paste.code);
                                  }}
                                  title="Редактировать"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                    color: '#667eea'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                >
                                  <MdEdit size={18} />
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={(e) => deletePaste(paste.code, e)}
                                  title="Удалить"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                    color: '#dc3545'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                >
                                                              <IoTrashOutline size={16} />
                                  
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="paste-meta">
                          <span className="lang">
                            {getLanguageIcon(paste.language)} {getLanguageName(paste.language)}
                          </span>
                          <span className="category">
                            {getCategoryIcon(paste.category)} {getCategoryName(paste.category)}
                          </span>
                          <span className="user"><MdPersonOutline size={12} style={{ marginRight: '4px' }} /> {paste.user || 'Гость'}</span>
                          <span className="time"><MdAccessTime size={12} style={{ marginRight: '4px' }} /> {getTimeAgo(paste.created_at)}</span>
                          <span className="size"><MdCode size={12} style={{ marginRight: '4px' }} /> {formatSize(paste.size)}</span>
                          {paste.tags && paste.tags.map((t, i) => (
                            <span key={i} className="tag-badge">
                              <MdLabel size={10} style={{ marginRight: '4px' }} /> {t}
                            </span>
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
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      
      {selectedPaste && (
        <div className="modal-overlay" onClick={closePaste} style={{ zIndex: 200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="category-icon">{getCategoryIcon(selectedPaste.category)}</span>
                {selectedPaste.title}
              </h2>
              <button className="modal-close" onClick={closePaste}><MdClose size={24} /></button>
            </div>
            <div className="modal-meta">
              <span>{getLanguageIcon(selectedPaste.language)} {getLanguageName(selectedPaste.language)}</span>
              <span>• {getCategoryIcon(selectedPaste.category)} {getCategoryName(selectedPaste.category)}</span>
              <span>• <MdPersonOutline size={12} style={{ marginRight: '4px' }} /> {selectedPaste.user || 'Гость'}</span>
              <span>• <MdAccessTime size={12} style={{ marginRight: '4px' }} /> {getTimeAgo(selectedPaste.created_at)}</span>
              <span>• <MdCode size={12} style={{ marginRight: '4px' }} /> {formatSize(selectedPaste.size)}</span>
              <span>• <MdVisibility size={12} style={{ marginRight: '4px' }} /> {selectedPaste.views || 0} просмотров</span>
              {selectedPaste.tags && selectedPaste.tags.map((t, i) => (
                <span key={i} className="tag-badge">
                  <MdLabel size={10} style={{ marginRight: '4px' }} /> {t}
                </span>
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
              <div>
              {profileData?.username === selectedPaste?.user && (
                <button className="modal-close-btn" onClick={() => openEditModal(selectedPaste.code)} style={{marginRight: '12px'}}>
                  <MdCreate size={16} style={{ marginRight: '4px' }} /> Редактировать
                </button>
              )}
              <button className="modal-close-btn" onClick={closePaste}>
                <MdClose size={16} style={{ marginRight: '4px' }} /> Закрыть
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно авторизации */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)} style={{ zIndex: 300 }}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {authMode === 'login' ? (
                  <><MdLock size={20} style={{ marginRight: '8px' }} /> Вход</>
                ) : (
                  <><MdCreate size={20} style={{ marginRight: '8px' }} /> Регистрация</>
                )}
              </h2>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleAuth}>
              <div className="modal-body">
                {authError && <div className="message error">{authError}</div>}
                
                <div className="form-group">
                  <label>Имя пользователя</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Введите username"
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
                      required={authMode === 'register'}
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

                <div className="auth-switch">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError('');
                    }}
                    className="switch-btn"
                  >
                    {authMode === 'login' 
                      ? 'Нет аккаунта? Зарегистрироваться' 
                      : 'Уже есть аккаунт? Войти'}
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pastes;