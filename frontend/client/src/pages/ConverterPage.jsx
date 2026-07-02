import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';
import { BsFiletypeCsv } from "react-icons/bs";
import { 
  FaRegFilePdf, 
  FaRegFileWord, 
  FaRegFileImage, 
  FaRegFileAlt,
  FaRegFilePowerpoint,
  FaRegFileCode
} from "react-icons/fa";
import { 
  MdCloudUpload, 
  MdArrowForward, 
  MdClose,
  MdAutorenew
} from "react-icons/md";

const API_URL = 'http://localhost:8000/api';

function ConverterPage({ changePage }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [convertFrom, setConvertFrom] = useState('pdf');
  const [convertTo, setConvertTo] = useState('docx');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const getAvatarUrl = () => {
    if (user?.avatar) return `http://localhost:8000${user.avatar}`;
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

  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

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
      setAuthError('❌ Пароли не совпадают!');
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
        setAuthError(`${errorMessages || 'Ошибка регистрации'}`);
      }
    } catch (error) {
      setAuthError('Ошибка при регистрации');
    }
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

  const formats = {
    pdf: ['docx', 'txt', 'jpg', 'png', 'jpeg', 'pptx'],
    docx: ['pdf', 'txt', 'odt'],
    jpg: ['png', 'pdf', 'webp', 'jpeg'],
    jpeg: ['png', 'pdf', 'webp', 'jpg'],
    png: ['jpg', 'pdf', 'webp', 'jpeg'],
    txt: ['pdf', 'docx', 'csv'],
    pptx: ['pdf', 'jpg', 'png'],
    csv: ['txt'],
    webp: ['jpg', 'png', 'pdf', 'jpeg'],
    odt: ['docx', 'pdf', 'txt'],
  };

  const validExtensions = [
    'pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt',
    'pptx', 'csv', 'webp', 'odt'
  ];

  const getFileIcon = (format, size = 18) => {
    const icons = {
      pdf: <FaRegFilePdf size={size} />,
      docx: <FaRegFileWord size={size} />,
      odt: <FaRegFileWord size={size} />,
      jpg: <FaRegFileImage size={size} />,
      jpeg: <FaRegFileImage size={size} />,
      png: <FaRegFileImage size={size} />,
      webp: <FaRegFileImage size={size} />,
      txt: <FaRegFileAlt size={size} />,
      pptx: <FaRegFilePowerpoint size={size} />,
      csv: <BsFiletypeCsv size={size} />,
    };
    return icons[format] || <FaRegFileAlt size={size} />;
  };

  const getFormatLabel = (format) => {
    const labels = {
      pdf: 'PDF',
      docx: 'DOCX',
      jpg: 'JPG',
      png: 'PNG',
      jpeg: 'JPEG',
      txt: 'TXT',
      pptx: 'PPTX',
      csv: 'CSV',
      webp: 'WEBP',
      odt: 'ODT'
    };
    return labels[format] || format.toUpperCase();
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setMessage(`> Поддерживаются только: PDF, DOCX, JPG, PNG, JPEG, TXT, PPTX, CSV, WEBP, ODT`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    let format = ext;

    setSelectedFile(file);
    setConvertFrom(format);
    setConvertedFile(null); 

    setFilePreview({
      name: file.name,
      size: file.size,
      type: file.type,
      format: format,
      lastModified: file.lastModified,
    });

    const availableFormats = formats[format] || ['txt'];
    if (availableFormats.length > 0) {
      setConvertTo(availableFormats[0]);
    }

    setMessage(`+ Файл "${file.name}" загружен`);
    setTimeout(() => setMessage(''), 3000);
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
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setMessage('> Сначала загрузите файл!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsConverting(true);
    setMessage('~ Отправка на сервер...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('from_format', convertFrom);
    formData.append('to_format', convertTo);
    formData.append('file_type', selectedFile.name.split('.').pop().toLowerCase());

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/converter/`, {
        method: 'POST',
        body: formData,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
      });

      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.includes('application/octet-stream')) {
        const originalSize = response.headers.get('X-Original-Size');
        const convertedSize = response.headers.get('X-Converted-Size');
        const fromFormat = response.headers.get('X-From-Format');
        const toFormat = response.headers.get('X-To-Format');
        
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${selectedFile.name.replace(/\.[^.]+$/, '')}.${convertTo}`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        
        setIsConverting(false);
        setMessage(`~ Файл сконвертирован! (${fromFormat || convertFrom.toUpperCase()} → ${toFormat || convertTo.toUpperCase()})`);
        
        setConvertedFile({
          name: filename,
          size: parseInt(convertedSize) || blob.size,
          originalSize: parseInt(originalSize) || selectedFile.size,
          downloadUrl: url
        });
        
      } else {
        const data = await response.json();
        setIsConverting(false);
        setMessage(`${data.error || 'Ошибка конвертации'}`);
      }
    } catch (error) {
      setIsConverting(false);
      setMessage('Ошибка подключения к серверу');
      console.error('Convert error:', error);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;

    if (convertedFile.downloadUrl) {
      window.open(convertedFile.downloadUrl, '_blank');
    } else {
      const content = `Конвертированный файл: ${convertedFile.name}\nИсходный формат: ${convertFrom.toUpperCase()}\nЦелевой формат: ${convertTo.toUpperCase()}\nИсходный размер: ${formatFileSize(convertedFile.originalSize)}\nРазмер: ${formatFileSize(convertedFile.size)}\n\nЭто демонстрационный файл. Реальная конвертация будет добавлена позже.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = convertedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    setMessage('✅ Файл скачан!');
    setTimeout(() => setMessage(''), 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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
          <li><Link to="/api/profile/" onClick={closeMenu}>Личный кабинет</Link></li>
          <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
          <li><Link to="/api/compress/" onClick={closeMenu}>Сжатие</Link></li>
          <li><Link to="/api/pastes/" onClick={closeMenu}>Заметки</Link></li>
          <li><Link to="/api/droppage/" onClick={closeMenu}>Файлообменник</Link></li>
          <li><Link to="/api/about/" onClick={closeMenu}>О нас</Link></li>
          <li><Link to="/api/teampage/" onClick={closeMenu}>Наша команда</Link></li>
          {isAuthenticated ? <li><a href="#" onClick={(e) => { e.preventDefault(); closeMenu(); handleLogout(); }}>Выйти</a></li> : ''}
        </ul>
      </nav>

      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link></h1>
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

      <div className="page-container converter-container">
        <div className="page-card converter-card">
          <div className="page-header">
            <h2>Конвертер файлов</h2>
            <p className="page-subtitle">Загрузите файл и выберите формат для конвертации</p>
          </div>

          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('converterFileInput').click()}
          >
            <input
              type="file"
              id="converterFileInput"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileInput}
              accept=".pdf,.docx,.jpg,.jpeg,.png,.txt,.pptx,.csv,.webp,.odt"
            />
            
            {!selectedFile ? (
              <>
                <div className="drop-zone-icon"><MdCloudUpload size={48} style={{ color: '#667eea' }} /></div>
                <h3>Перетащите файл сюда</h3>
                <p>или нажмите для выбора</p>
                <div className="supported-formats">
                  Поддерживаемые форматы: PDF, DOCX, JPG, PNG, JPEG, TXT, PPTX, CSV, WEBP, ODT
                </div>
              </>
            ) : (
              <div className="file-preview">
                <div className="file-icon" style={{ color: '#666' }}>
                  {getFileIcon(filePreview?.format, 32)}
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
                  setSelectedFile(null);
                  setFilePreview(null);
                  setConvertedFile(null);
                  
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <MdClose size={18} />
              </button>
              </div>
            )}
          </div>

          {selectedFile && !convertedFile && (
            <div className="converter-options">
              <div className="converter-row">
                <div className="converter-field">
                  <label>Исходный формат</label>
                  <div className="format-badge from" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {getFileIcon(convertFrom)} {getFormatLabel(convertFrom)}
                  </div>
                </div>

                <div className="converter-arrow"><MdArrowForward size={20} style={{ color: '#888' }} /></div>

                <div className="converter-field">
                  <label>Формат для конвертации</label>
                  <select 
                    value={convertTo} 
                    onChange={(e) => setConvertTo(e.target.value)}
                    className="format-select"
                  >
                    {formats[convertFrom]?.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {getFileIcon(fmt)} {getFormatLabel(fmt)}
                      </option>
                    ))}
                    {(!formats[convertFrom] || formats[convertFrom].length === 0) && (
                      <option value="txt">{getFileIcon('txt')} TXT</option>
                    )}
                  </select>
                </div>
              </div>

              <button 
                className="convert-btn" 
                onClick={handleConvert}
                disabled={isConverting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isConverting ? (
                  <>
                    <MdAutorenew size={18} className="spinner-animation" style={{ marginRight: '8px' }} /> Обработка...
                  </>
                ) : (
                  <>
                    <MdArrowForward size={18} /> Конвертировать
                  </>
                )}
              </button>
            </div>
          )}

          {convertedFile && (
            <div className="convert-result">
              <div className="result-info">
                <div className="result-row">
                  <span>Исходный формат:</span>
                  <span className="result-value">{convertFrom.toUpperCase()}</span>
                </div>
                <div className="result-row">
                  <span>Целевой формат:</span>
                  <span className="result-value">{convertTo.toUpperCase()}</span>
                </div>
                <div className="result-row">
                  <span>Исходный размер:</span>
                  <span className="result-value">{formatFileSize(convertedFile.originalSize)}</span>
                </div>
                <div className="result-row">
                  <span>Размер после конвертации:</span>
                  <span className="result-value result-success">{formatFileSize(convertedFile.size)}</span>
                </div>
              </div>
              <button 
                className="download-btn" 
                onClick={handleDownload}
              >
                <MdArrowForward size={16} style={{ marginRight: '8px' }} /> Скачать сконвертированный файл
              </button>
            </div>
          )}

          {message && <div className={`message ${message.includes('~') || message.includes('+') ? 'success' : 'error'}`}>{message}</div>}
        </div>

        <div className="info-card">
          <h3>Поддерживаемые форматы</h3>
          <div className="format-list">
            <div className="info-item"><span>{getFileIcon('pdf')} PDF</span><span>→ DOCX, TXT, JPG, PNG, PPTX, JPEG</span></div>
            <div className="info-item"><span>{getFileIcon('docx')} DOCX</span><span>→ PDF, TXT, ODT</span></div>
            <div className="info-item"><span>{getFileIcon('jpg')} JPG</span><span>→ PNG, PDF, WEBP, JPEG</span></div>
            <div className="info-item"><span>{getFileIcon('jpeg')} JPEG</span><span>→ PNG, PDF, WEBP</span></div>
            <div className="info-item"><span>{getFileIcon('png')} PNG</span><span>→ JPG, PDF, WEBP, JPEG</span></div>
            <div className="info-item"><span>{getFileIcon('txt')} TXT</span><span>→ PDF, DOCX, CSV</span></div>
            <div className="info-item"><span>{getFileIcon('pptx')} PPTX</span><span>→ PDF, JPG, PNG</span></div>
            <div className="info-item"><span>{getFileIcon('csv')} CSV</span><span>→ TXT</span></div>
            <div className="info-item"><span>{getFileIcon('webp')} WEBP</span><span>→ JPG, PNG, PDF, JPEG</span></div>
            <div className="info-item"><span>{getFileIcon('odt')} ODT</span><span>→ DOCX, PDF, TXT</span></div>
          </div>
        </div>
      </div>
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

export default ConverterPage;