import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';
import '../MainPage.css';import { 
  FaFileAlt,
  FaCloudUploadAlt
} from "react-icons/fa";
import { 
  MdClose, 
  MdInfoOutline 
} from "react-icons/md";

const API_URL = 'http://localhost:8000/api';
const WEBPAGE_URL = 'http://localhost:5173/api/droppage/'

function DropPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [fileLink, setFileLink] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [code, setCode] = useState('');
  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `http://localhost:8000${user?.avatar}`;
    }
    return null;
  };

  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      let animationFrameId;
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);
  
      const numDigits = 60;
      const digits = [];
  
      for (let i = 0; i < numDigits; i++) {
        digits.push({
          x: Math.random() * width,
          y: Math.random() * height,
          char: Math.random() > 0.5 ? '1' : '0',
          size: Math.floor(Math.random() * 6) + 12,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          tick: 0,
          tickMax: Math.floor(Math.random() * 40) + 20
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
        
        digits.forEach((d) => {
          d.x += d.speedX;
          d.y += d.speedY;
  
          d.tick++;
          if (d.tick >= d.tickMax) {
            d.speedX = (Math.random() - 0.5) * 0.8;
            d.speedY = (Math.random() - 0.5) * 0.8;
            d.char = Math.random() > 0.5 ? '1' : '0';
            d.tick = 0;
            d.tickMax = Math.floor(Math.random() * 40) + 20;
            d.opacity = Math.random() * 0.3 + 0.1;
          }
  
          if (d.x < 0 || d.x > width) d.speedX *= -1;
          if (d.y < 0 || d.y > height) d.speedY *= -1;
  
          ctx.fillStyle = `rgba(0, 0, 0, ${d.opacity})`;
          ctx.font = `${d.size}px monospace`;
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
                setIsAuthenticated(true);
                setUser(data.user);
                localStorage.setItem('userData', JSON.stringify(data.user));
              } else {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
              }
            } catch (error) {
              console.error('Ошибка проверки авторизации:', error);
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
            }
          }
          setLoadingAuth(false);
        };
        checkAuth();
      }, []);
    
      const closeMenu = () => setIsOpen(false);
    
      const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
        window.location.reload();
      };
    
      const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
          const isEmail = authForm.login.includes('@');
          const loginData = { password: authForm.password };
          if (isEmail) loginData.email = authForm.login;
          else loginData.username = authForm.login;
          
          const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
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
          setAuthError('Пароли не совпадают!');
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
            window.location.reload();
          } else {
            const error = await response.json();
            const errorMessages = Object.values(error.errors).flat().join(', ');
            setAuthError(errorMessages || 'Ошибка регистрации');
          }
        } catch (error) {
          setAuthError('Ошибка при регистрации');
        }
      };

  const handleFilesSelect = (files) => {
    if (!files || files.length === 0) return;

    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar'];
    const newFiles = [];
    const newPreviews = [];
    let hasInvalid = false;

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(ext)) {
        hasInvalid = true;
        return;
      }

      newFiles.push(file);
      newPreviews.push({
        name: file.name,
        size: file.size,
        format: ext,
      });
    });

    if (hasInvalid) {
      setMessage('Некоторые файлы имеют неподдерживаемый формат');
      setTimeout(() => setMessage(''), 3000);
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setFilePreviews(prev => [...prev, ...newPreviews]);
      setMessage(`Добавлено ${newFiles.length} файл(ов)`);
      setTimeout(() => setMessage(''), 10000);
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      handleFilesSelect([file]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFilesSelect(files);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    handleFilesSelect(files);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (files) => {
  if (selectedFiles.length === 0) return;
  setUploading(true);
  setMessage('Загрузка файлов на сервер...');

  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file_${index + 1}`, file);
  });

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/droppage/`, {
      method: 'POST',
      body: formData,
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
    });
    
    const data = await response.json();
    if (response.ok) {
      setTimeout(() => {
        setUploading(false);
        setFileLink(`${WEBPAGE_URL}${data.code}/`);
        setMessage(`${selectedFiles.length} файл(ов) успешно загружены! Ссылка сгенерирована.`);
      }, 2000);
    } else {
      setUploading(false);
      setMessage(data.error || 'Ошибка загрузки');
    }
  } catch (error) {
    setUploading(false);
    setMessage('Ошибка при загрузке файлов');
    console.error('Upload error:', error);
  }
};

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1048576).toFixed(1) + ' МБ';
  };

  const getTotalSize = () => {
    const total = filePreviews.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(total);
  };

  return (
    <>
    <canvas ref={canvasRef} className="glitch-bg-canvas" />
    {isOpen && <div className="background-overlay" onClick={closeMenu}></div>}
    <button 
        className={`burger-btn ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span><span></span><span></span>
      </button>
    
    <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        <ul>
          <li><a href="/api/profile/" onClick={closeMenu}>Личный кабинет</a></li>
          <li><a href="/" onClick={closeMenu}>Главная</a></li>
          <li><a href="/api/converter/" onClick={closeMenu}>Конвертер</a></li>
          <li><a href="/api/pastes/" onClick={closeMenu}>Заметки</a></li>
          <li><a href="/api/compress/" onClick={closeMenu}>Сжатие</a></li>
          <li><a href="/api/about/" onClick={closeMenu}>О нас</a></li>
          <li><Link to="/api/teampage/" onClick={closeMenu}>Наша команда</Link></li>
          {isAuthenticated ? <li><a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); handleLogout(); }}>Выйти</a></li> : ''}
        </ul>
      </nav>
    <div className="drop-page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
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
    <div className="page-container drop-container">
      <div className="page-card drop-card">
        <div className="page-header">
          <h2><FaCloudUploadAlt size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Обмен файлами</h2>
          <p className="page-subtitle">Загрузите файлы и отправьте ссылку другу</p>
        </div>

        {/* DRAG-AND-DROP ЗОНА */}
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFiles.length > 0 ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !fileLink && document.getElementById('dropFileInput').click()}
        >
          <input
            type="file"
            id="dropFileInput"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          
          {selectedFiles.length === 0 ? (
            <>
              <div className="drop-zone-icon"><FaCloudUploadAlt size={48} style={{ color: '#667eea' }} /></div>
              <h3>Перетащите файлы сюда</h3>
              <p>или нажмите для выбора</p>
              <div className="supported-formats">
                Максимальный размер: 2 ГБ. Любые форматы.
              </div>
            </>
          ) : (
            <div className="files-preview">
              <div className="files-header">
                <span className="files-count" style={{marginBottom: '5px'}}>Выбрано файлов: {selectedFiles.length}</span>
                <span className="files-total-size">Общий размер: {getTotalSize()}</span>
              </div>
              <div className="files-list">
                {filePreviews.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    <div className="file-icon"><FaFileAlt size={20} /></div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-details">
                        <span className="file-format">{file.format?.toUpperCase()}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    {!fileLink && (
                      <button 
                        className="file-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <MdClose size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!fileLink && (
                <button 
                  className="add-more-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('dropFileInput').click();
                  }}
                >
                  Добавить еще файлы
                </button>
              )}
            </div>
          )}
        </div>

        {/* ССЫЛКА И ОТПРАВКА */}
        {selectedFiles.length > 0 && !fileLink && (
          <button 
            className="upload-btn" 
            onClick={() => handleUpload(selectedFiles)}
            disabled={uploading}
          >
            {uploading ? 'Загрузка...' : `Получить ссылку (${selectedFiles.length} файл${selectedFiles.length > 1 ? 'ов' : ''})`}
          </button>
        )
        }

        {fileLink && (
          <div className="link-section">
            <div className="link-label" style={{marginTop: '10px', marginBottom: '10px'}}>Ваша ссылка готова:</div>
            <div className="link-copy-box">
              <input type="text" className="link-input" value={fileLink} readOnly />
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(fileLink);
                  setMessage('Ссылка успешно скопирована!');
                  setTimeout(() => setMessage(''), 2000);
                }}
              >
                Копировать
              </button>
            </div>
        </div>
        )}

        {message && <div className={`message ${message.includes('успешно') || message.includes('загружен') || message.includes('Добавлено') || message.includes('Загрузка') ? 'success' : 'error'}`}>{message}</div>}
      </div>

      {/* ИНФОРМАЦИОННАЯ КАРТОЧКА */}
      <div className="info-card">
        <h3><MdInfoOutline size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Информация</h3>
        <div className="info-list">
          <div className="info-item">
            <span>Максимальный размер</span>
            <span>2 ГБ</span>
          </div>
          <div className="info-item">
            <span>Срок хранения</span>
            <span>7 дней</span>
          </div>
          <div className="info-item">
            <span>Отправка</span>
            <span>Ссылка</span>
          </div>
        </div>
        <p className="info-note">
          Отправка пока в разработке — интерфейс готов!
        </p>
      </div>
    </div>
    </div>
    <footer className="bottom-footer" style={{marginTop: '200px'}}>
                  <div className="footer-buttons">
                    <Link to="/api/policy/" className="footer-btn">Политика</Link>
                    <Link to="/api/termsofservice/" className="footer-btn">Условия</Link>
                    <Link to="/api/contacts/" className="footer-btn">Контакты</Link>
                  </div>
                </footer>
    </>
  );
}

export default DropPage;