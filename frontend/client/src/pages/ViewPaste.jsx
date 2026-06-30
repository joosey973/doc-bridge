import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './EditPastePage.css';

// ===== ИКОНКИ =====
import { 
  MdOutlineWorkOutline,
  MdAccessTime,
  MdEdit,
  MdDelete,
  MdLock,
  MdClose
} from "react-icons/md";
import { 
  BsPersonWorkspace 
} from "react-icons/bs";
import { 
  MdOutlineFastfood 
} from "react-icons/md";
import { 
  PiBookBookmarkThin,
  PiFilmSlateLight 
} from "react-icons/pi";
import { 
  IoIosAirplane, 
  IoIosStarOutline 
} from "react-icons/io";
import { 
  CiMedicalCross,
  CiInboxIn 
} from "react-icons/ci";
import { 
  GoPencil 
} from "react-icons/go";
import { 
  IoTrashOutline 
} from "react-icons/io5";
import { 
  VscDeviceCamera 
} from "react-icons/vsc";
import { SlLock } from "react-icons/sl";

const API_URL = 'http://localhost:8000/api';

const ViewPastePage = () => {
  const { pasteCode } = useParams();
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (from === 'profile') {
      navigate('/api/profile');
    } else if (from === 'pastes') {
      navigate('/api/pastes');
    } else {
      navigate('/');
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
  const from = location.state?.from || 'main';
  
  // Данные пасты
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const token = localStorage.getItem('token');
  const user = location.state?.usr || 'null';

  // ===== КАТЕГОРИИ С REACT-ИКОНКАМИ =====
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

  // ===== ФУНКЦИИ ДЛЯ ИКОНОК =====
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

  const copyToClipboard = async () => {
    const link = `${window.location.origin}/api/pastes/view/${pasteCode}`;
    await navigator.clipboard.writeText(link);
  };

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

  // Загрузка данных пасты
  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(`${API_URL}/pastes/view/${pasteCode}/`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTitle(data.paste.title || '');
          setContent(data.paste.text || '');
          setLanguage(data.paste.language || 'javascript');
          setCategory(data.paste.category || 'other');
          setTags(data.paste.tags || []);
          setProfileData(data.paste_user || 'Аноним');
        } else {
          setError('❌ Паста не найдена');
          setTimeout(() => navigate('/api/pastes'), 20000);
        }
      } catch (err) {
        setError('❌ Ошибка загрузки пасты');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  }, [pasteCode, navigate]);

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
          <div className="link-container">
            <h1>Просмотр заметки</h1>
            <div onClick={copyToClipboard} style={{cursor: 'pointer'}}>
              📋 Скопировать ссылку на заметку
            </div>
          </div>
            
          <button onClick={handleBack} className="back-btn">
            ← Назад
          </button>
        </div>

        <div className="edit-form">
          <div className="form-group">
            <label>Заголовок</label>
            <input
              type="text"
              value={title}
              placeholder="Название пасты..."
              maxLength={100}
              className="edit-input"
              disabled
            />
          </div>

          <div className="form-group">
            <label>Содержимое</label>
            <textarea
              value={content}
              placeholder="Введите текст или код..."
              rows={12}
              className="edit-textarea"
              disabled
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Тип пасты</label>
              <div className="category-display">
                {getCategoryIcon(category)} {getCategoryName(category)}
              </div>
            </div>
            <div className="form-group">
              <label>Подсветка</label>
              <div className="language-display">
                {language.charAt(0).toUpperCase() + language.slice(1)}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Теги</label>
            <div className="tags-input">
              {tags.map((tag, i) => (
                <span key={i} className="tag">
                  #{tag}
                </span>
              ))}
              {tags.length === 0 && (
                <span style={{ color: '#999', fontSize: '14px' }}>Нет тегов</span>
              )}
            </div>
          </div>
        </div>

        <div className="paste-info">
          <span>Код пасты: <strong>{pasteCode}</strong></span>
          <span>•</span>
          <span>Владелец: <strong>{profileData?.username || 'Аноним'}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ViewPastePage;