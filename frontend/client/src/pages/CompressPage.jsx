import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';
import { 
  FaRegFileAlt, 
  FaRegFilePdf, 
  FaRegFileImage, 
  FaRegFileArchive, 
  FaBalanceScale,
  FaDownload
} from "react-icons/fa";
import { 
  MdCloudUpload, 
  MdClose, 
  MdSpeed, 
  MdFlashOn, 
  MdAutorenew, 
  MdInfoOutline,
  MdCheckCircle,
  MdError 
} from "react-icons/md";

const API_URL = 'http://localhost:8000/api';

function CompressPage({ changePage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [compressLevel, setCompressLevel] = useState('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [compressedFile, setCompressedFile] = useState(null);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);
  const fileInputRef = useRef(null);
  const closeMenu = () => setIsOpen(false);
  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `http://localhost:8000${user?.avatar}`;
    }
    return null;
  };
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
    isHoveredRef.current = isHovered;
  }, [isHovered]);

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

  const compressLevels = [
    { id: 'low', label: 'Низкое сжатие (быстро)', icon: <MdSpeed size={18} />, desc: 'Минимальное сжатие, высокая скорость' },
    { id: 'medium', label: 'Среднее сжатие (рекомендуется)', icon: <FaBalanceScale size={18} />, desc: 'Оптимальный баланс размера и качества' },
    { id: 'high', label: 'Высокое сжатие (медленно)', icon: <MdFlashOn size={18} />, desc: 'Максимальное сжатие, дольше обработка' },
  ];

  // Функция для полного сброса выбора файла
  const resetFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setCompressedFile(null);
    // Очищаем значение инпута
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMessage('');
    setMessageType('');
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Проверяем, не тот ли это файл, который уже выбран
    if (selectedFile && selectedFile.name === file.name && selectedFile.size === file.size) {
      // Если это тот же файл, сбрасываем и загружаем заново
      resetFileSelection();
      // Небольшая задержка для перезагрузки
      setTimeout(() => {
        handleFileSelect(file);
      }, 10);
      return;
    }

    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setMessage('Неподдерживаемый формат файла');
      setMessageType('error');
      setTimeout(() => { 
        setMessage(''); 
        setMessageType(''); 
      }, 3000);
      // Очищаем инпут при ошибке
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: file.size,
      format: ext,
    });
    setMessage(`Файл "${file.name}" успешно загружен`);
    setMessageType('success');
    setTimeout(() => { 
      setMessage(''); 
      setMessageType(''); 
    }, 3000);
    setCompressedFile(null);
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
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    // Очищаем инпут после выбора, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      setMessage('Сначала загрузите файл!');
      setMessageType('error');
      setTimeout(() => { 
        setMessage(''); 
        setMessageType(''); 
      }, 3000);
      return;
    }

    setIsCompressing(true);
    setMessage('Отправка на сервер...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('compression_level', compressLevel);
    formData.append('file_type', selectedFile.name.split('.').pop().toLowerCase());

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/compress/`, {
        method: 'POST',
        body: formData,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
      });

      const data = await response.json();

      if (response.ok) {
        setIsCompressing(false);
        setMessage(`Сжатие завершено! (Уровень: ${compressLevel})`);
        setMessageType('success');
        
        setCompressedFile({
          name: `compressed_${selectedFile.name}`,
          size: data.compressed_size || Math.floor(selectedFile.size * 0.7),
          originalSize: data.original_size || selectedFile.size,
          reduction: data.reduction || Math.floor(Math.random() * 40 + 20),
          downloadUrl: data.download_url || null
        });
      } else {
        setIsCompressing(false);
        setMessage(`${data.error || 'Ошибка сжатия'}`);
        setMessageType('error');
      }
    } catch (error) {
      setIsCompressing(false);
      setMessage('Ошибка подключения к серверу');
      setMessageType('error');
      console.error('Compress error:', error);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;

    if (compressedFile.downloadUrl) {
      window.open(compressedFile.downloadUrl, '_blank');
    } else {
      const content = `Сжатый файл: ${compressedFile.name}\nИсходный размер: ${formatFileSize(compressedFile.originalSize)}\nСжатый размер: ${formatFileSize(compressedFile.size)}\nСтепень сжатия: ${compressedFile.reduction}%\n\nЭто демонстрационный файл. Реальное сжатие будет добавлено позже.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = compressedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    setMessage('Файл скачан!');
    setMessageType('success');
    setTimeout(() => { 
      setMessage(''); 
      setMessageType(''); 
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1048576).toFixed(1) + ' МБ';
  };

  const getEstimatedSize = () => {
    if (!selectedFile) return 0;
    const sizes = {
      low: 0.9,
      medium: 0.7,
      high: 0.5
    };
    return selectedFile.size * (sizes[compressLevel] || 0.7);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <canvas ref={canvasRef} className="glitch-bg-canvas" />
      {/* <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link>
        </h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">➤</button>
          <Link to="/api/profile/" className="auth-btn" style={{ textDecoration: 'none', color: 'inherit' }}>Личный кабинет</Link>
        </div>
      </header> */}

       <canvas ref={canvasRef} className="glitch-bg-canvas" />

      {isSidebarOpen && <div className="background-overlay" onClick={closeSidebar}></div>}

      <button 
        className={`burger-btn ${isSidebarOpen ? 'open' : ''}`} 
        onClick={toggleSidebar}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link>
        </h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">➤</button>
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

      <nav className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/api/profile/" onClick={closeSidebar}>Личный кабинет</Link></li>
          <li><Link to="/" onClick={closeSidebar}>Главная</Link></li>
          <li><Link to="/api/converter/" onClick={closeSidebar}>Конвертер</Link></li>
          <li><Link to="/api/pastes/" onClick={closeSidebar}>Заметки</Link></li>
          <li><Link to="/api/droppage/" onClick={closeSidebar}>Файлообменник</Link></li>
          <li><Link to="/api/about/" onClick={closeSidebar}>О нас</Link></li>
          <li><Link to="/api/teampage/" onClick={closeMenu}>Наша команда</Link></li>
          {isAuthenticated ? <li><a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); handleLogout(); }}>Выйти</a></li> : ''}
        </ul>
      </nav>

      <div className="page-container compress-container">
        <div className="page-card compress-card">
          <div className="page-header">
            <h2>Сжатие файлов</h2>
            <p className="page-subtitle">Загрузите файл и выберите степень сжатия</p>
          </div>

          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('compressFileInput').click()}
          >
            <input
              type="file"
              id="compressFileInput"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
            
            {!selectedFile ? (
              <>
                <div className="drop-zone-icon"><MdCloudUpload size={48} style={{ color: '#667eea' }} /></div>
                <h3>Перетащите файл сюда</h3>
                <p>или нажмите для выбора</p>
                <div className="supported-formats">
                  Поддерживаемые форматы: PDF, DOCX, JPG, PNG, TXT, ZIP, RAR
                </div>
              </>
            ) : (
              <div className="file-preview">
                <div className="file-icon">
                  <FaRegFileAlt size={32} />
                </div>
                <div className="file-info">
                  <div className="file-name">{filePreview?.name}</div>
                  <div className="file-details">
                    <span className="file-format">{filePreview?.format?.toUpperCase()}</span>
                    <span className="file-size">{formatFileSize(filePreview?.size)}</span>
                  </div>
                </div>
                <button 
                  className="file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFileSelection(); // Используем функцию сброса
                  }}
                >
                  <MdClose size={18} />
                </button>
              </div>
            )}
          </div>

          {selectedFile && !compressedFile && (
            <div className="compress-options">
              <div className="compress-levels">
                <label className="options-label">Выберите степень сжатия:</label>
                <div className="level-buttons">
                  {compressLevels.map((level) => (
                    <button
                      key={level.id}
                      className={`level-btn ${compressLevel === level.id ? 'active' : ''}`}
                      onClick={() => setCompressLevel(level.id)}
                    >
                      <span className="level-icon">{level.icon}</span>
                      <span className="level-label">{level.label}</span>
                      <span className="level-desc">{level.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="compress-info">
                <div className="info-row">
                  <span>Исходный размер:</span>
                  <span className="info-value">{formatFileSize(selectedFile?.size || 0)}</span>
                </div>
                <div className="info-row">
                  <span>Ожидаемый размер:</span>
                  <span className="info-value info-estimate">
                    ~{formatFileSize(getEstimatedSize())}
                  </span>
                </div>
                <div className="info-row">
                  <span>Экономия:</span>
                  <span className="info-value info-estimate">
                    ~{Math.round((1 - getEstimatedSize() / (selectedFile?.size || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <button 
                className="compress-btn" 
                onClick={handleCompress}
                disabled={isCompressing}
              >
                {isCompressing ? (
                  <>
                    <MdAutorenew size={18} className="spinner-animation" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Обработка...
                  </>
                ) : (
                  'Сжать файл'
                )}
              </button>
            </div>
          )}

          {compressedFile && (
            <div className="compress-result">
              <div className="result-info">
                <div className="result-row">
                  <span>Исходный размер:</span>
                  <span className="result-value">{formatFileSize(compressedFile.originalSize)}</span>
                </div>
                <div className="result-row">
                  <span>Сжатый размер:</span>
                  <span className="result-value result-success">{formatFileSize(compressedFile.size)}</span>
                </div>
                <div className="result-row">
                  <span>Уменьшено на:</span>
                  <span className="result-value result-highlight">{compressedFile.reduction}%</span>
                </div>
              </div>
              <button 
                className="download-btn" 
                onClick={handleDownload}
              >
                <FaDownload size={16} style={{ marginRight: '8px' }} /> Скачать сжатый файл
              </button>
            </div>
          )}

          {message && <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>{messageType === 'success' ? <MdCheckCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> : <MdError size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />}{message}</div>}
        </div>

        <div className="info-card">
          <h3><MdInfoOutline size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Информация о сжатии</h3>
          <div className="info-list">
            <div className="info-item">
              <span>Максимальный размер</span>
              <span>100 МБ</span>
            </div>
            <div className="info-item">
              <span>Поддерживаемые форматы</span>
              <span>PDF, DOCX, JPG, PNG, ZIP</span>
            </div>
            <div className="info-item">
              <span>Степени сжатия</span>
              <span>Низкая / Средняя / Высокая</span>
            </div>
          </div>

          <h4 style={{ marginTop: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>
             Рекомендации:
          </h4>
          <div className="info-list" style={{ marginTop: '8px' }}>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span><FaRegFileImage size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Изображения (JPG/PNG)</span>
              <span>Среднее или высокое</span>
            </div>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span><FaRegFilePdf size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Документы (PDF/DOCX)</span>
              <span>Низкое или среднее</span>
            </div>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span><FaRegFileArchive size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Архивы (ZIP/RAR)</span>
              <span>Низкое сжатие</span>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isLoginMode ? 'Вход' : 'Регистрация'}</h2>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            </div>
            <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
              {isLoginMode ? (
                <div className="form-group">
                  <label>Email или имя пользователя</label>
                  <input
                    type="text"
                    placeholder="Введите email или username"
                    value={authForm.login}
                    onChange={(e) => setAuthForm({...authForm, login: e.target.value})}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Имя пользователя</label>
                    <input
                      type="text"
                      placeholder="Придумайте имя"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  placeholder="Введите пароль"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  required
                />
              </div>
              {!isLoginMode && (
                <div className="form-group">
                  <label>Подтверждение пароля</label>
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={authForm.passwordConfirm}
                    onChange={(e) => setAuthForm({...authForm, passwordConfirm: e.target.value})}
                    required
                  />
                </div>
              )}
              {authError && <div className="message error">{authError}</div>}
              <button type="submit" className="submit-btn">
                {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            <div className="auth-switch">
              {isLoginMode ? (
                <span>Нет аккаунта? <span onClick={() => { setIsLoginMode(false); setAuthError(''); }}>Зарегистрироваться</span></span>
              ) : (
                <span>Уже есть аккаунт? <span onClick={() => { setIsLoginMode(true); setAuthError(''); }}>Войти</span></span>
              )}
            </div>
          </div>
        </div>
      )}
      <footer className="bottom-footer" style={{marginTop: '130px'}}>
              <div className="footer-buttons">
                <Link to="/api/policy/" className="footer-btn">Политика</Link>
                <Link to="/api/termsofservice/" className="footer-btn">Условия</Link>
                <Link to="/api/contacts/" className="footer-btn">Контакты</Link>
              </div>
            </footer>
    </>
  );
}

export default CompressPage;