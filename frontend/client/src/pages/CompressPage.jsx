import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Pages.css';
import { 
  FaFileAlt, 
  FaFilePdf, 
  FaFileImage, 
  FaFileArchive, 
  FaBalanceScale 
} from "react-icons/fa";
import { 
  MdCloudUpload, 
  MdClose, 
  MdSpeed, 
  MdFlashOn, 
  MdAutorenew, 
  MdInfoOutline 
} from "react-icons/md";

function CompressPage({ changePage }) {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000/api';
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [compressLevel, setCompressLevel] = useState('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);
  
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
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
            }
          } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
          }
        }
      };
      checkAuth();
    }, []);

    const getAvatarUrl = () => {
      if (user?.avatar) return `http://localhost:8000${user.avatar}`;
      return null;
    };

  // Степени сжатия
  const compressLevels = [
    { id: 'low', label: 'Низкое сжатие (быстро)', icon: <MdSpeed size={18} />, desc: 'Минимальное сжатие, высокая скорость' },
    { id: 'medium', label: 'Среднее сжатие (рекомендуется)', icon: <FaBalanceScale size={18} />, desc: 'Оптимальный баланс размера и качества' },
    { id: 'high', label: 'Высокое сжатие (медленно)', icon: <MdFlashOn size={18} />, desc: 'Максимальное сжатие, дольше обработка' },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;

    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setMessage('Неподдерживаемый формат файла');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: file.size,
      format: ext,
    });
    setMessage(`Файл "${file.name}" успешно загружен`);
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

  const handleCompress = () => {
    if (!selectedFile) {
      setMessage('Сначала загрузите файл!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsCompressing(true);
    setMessage(`Сжатие "${selectedFile.name}"... (уровень: ${compressLevel})`);

    setTimeout(() => {
      setIsCompressing(false);
      setMessage(`Сжатие завершено! Размер успешно уменьшен на ${Math.floor(Math.random() * 40 + 20)}% (UI-заглушка)`);
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1048576).toFixed(1) + ' МБ';
  };

  // Расчет предполагаемого размера после сжатия
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
          <Link to="/api/profile/" className="auth-btn" style={{ textDecoration: 'none', color: 'inherit' }}>Личный кабинет</Link>
        </div>
      </header>

      <nav className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/api/profile/" onClick={closeSidebar}>Личный кабинет</Link></li>
          <li><Link to="/" onClick={closeSidebar}>Главная</Link></li>
          <li><Link to="/api/converter/" onClick={closeSidebar}>Конвертер</Link></li>
          <li><Link to="/api/compress/" onClick={closeSidebar}>Сжатие</Link></li>
          <li><Link to="/api/droppage/" onClick={closeSidebar}>Файлообменник</Link></li>
          <li><Link to="/api/about/" onClick={closeSidebar}>О нас</Link></li>
        </ul>
      </nav>

      <div className="page-container converter-container">
        <div className="page-card converter-card">
          <div className="page-header">
            <h2>Сжатие файлов</h2>
            <p className="page-subtitle">Загрузите файл и выберите степень сжатия</p>
          </div>

          {/* DRAG-AND-DROP ЗОНА */}
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
                <FaFileAlt size={32} />
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
                }}
              >
                <MdClose size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ВЫБОР СТЕПЕНИ СЖАТИЯ */}
        {selectedFile && (
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

          {message && <div className={`message ${message.includes('успешно') || message.includes('завершено') ? 'success' : 'error'}`}>{message}</div>}
        </div>

        {/* ИНФОРМАЦИОННАЯ КАРТОЧКА */}
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
              <span><FaFileImage size={14} style={{ marginRight: '6px', verticalAlign: 'middle' ,color: "blue"}} /> Изображения (JPG/PNG)</span>
              <span>Среднее или высокое</span>
            </div>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span><FaFilePdf size={14} style={{ marginRight: '6px', verticalAlign: 'middle',color: "red" }} /> Документы (PDF/DOCX)</span>
              <span>Низкое или среднее</span>
            </div>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span><FaFileArchive size={14} style={{ marginRight: '6px', verticalAlign: 'middle',color: "orange" }} /> Архивы (ZIP/RAR)</span>
              <span>Низкое сжатие</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
      <style>{`
        /* Стили для холста анимации, чтобы он фиксировался сзади всей страницы */
        .glitch-bg-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          pointer-events: none;
        }

        .custom-select {
          position: relative;
          width: 100%;
        }
        .custom-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          min-height: 38px;
          box-sizing: border-box;
        }
        .custom-select-trigger:hover { border-color: #000; }
        
        .custom-select-value {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .custom-select-arrow {
          transition: transform 0.2s;
          font-size: 16px;
        }
        .custom-select-arrow.open { transform: rotate(180deg); }
        
        .custom-select-options {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          height: 180px;
          overflow-y: scroll;
          z-index: 999;
          box-shadow: 0 8px 24px rgba(229, 217, 217, 0.15);
        }
        
        .custom-select-options::-webkit-scrollbar { width: 6px; }
        .custom-select-options::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .custom-select-options::-webkit-scrollbar-track { background: #f1f1f1; }

        .custom-select-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.15s;
        }
        .custom-select-option:hover { background: #f5f5f5; }
        .custom-select-option.selected { background: #e8e8e8; font-weight: 600; }
        
        .form-row, .form-group, .create-paste, .main-content { overflow: visible !important; }
      `}</style>

export default CompressPage;