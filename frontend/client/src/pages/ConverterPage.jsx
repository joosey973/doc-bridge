import React, { useState, useEffect, useRef } from 'react';
  import './Pages.css';

function ConverterPage({ changePage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [convertFrom, setConvertFrom] = useState('pdf');
  const [convertTo, setConvertTo] = useState('docx');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Эффект анимации матрицы/глитча
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
    pdf: ['docx', 'txt', 'jpg', 'png'],
    docx: ['pdf', 'txt'],
    jpg: ['png', 'pdf'],
    png: ['jpg', 'pdf'],
    txt: ['pdf', 'docx'],
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setMessage('> Поддерживаются только: PDF, DOCX, JPG, PNG, TXT');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    let format = ext;
    if (ext === 'jpeg') format = 'jpg';

    setSelectedFile(file);
    setConvertFrom(format);

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

  const handleConvert = () => {
    if (!selectedFile) {
      setMessage('> Сначала загрузите файл!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage(`~ Конвертация ${selectedFile.name} из ${convertFrom.toUpperCase()} в ${convertTo.toUpperCase()}... (заглушка)`);
    setTimeout(() => {
      setMessage(`+ Конвертация завершена! (UI-заглушка, логику добавит другой разработчик)`);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (format) => {
    const icons = {
      pdf: '[PDF]',
      docx: '[DOC]',
      jpg: '[JPG]',
      png: '[PNG]',
      txt: '[TXT]'
    };
    return icons[format] || '[FILE]';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Добавляем сам холст на задний план */}
      <canvas ref={canvasRef} className="glitch-bg-canvas" />

      <header className="page-header-wrapper">
        <div className="page-header-left">
          <button 
            className={`burger-btn-page ${isSidebarOpen ? 'open' : ''}`} 
            onClick={toggleSidebar}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 className="page-logo" onClick={() => changePage && changePage('main')}>
            DocBridge
          </h1>
        </div>
        <div className="page-header-right">
          <button className="page-icon-btn" title="Уведомления">[•]</button>
          <button className="page-auth-btn">Войти</button>
        </div>
      </header>

      <div className={`page-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
      <nav className={`page-sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button className="page-sidebar-close" onClick={closeSidebar}>✕</button>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); closeSidebar(); changePage && changePage('main'); }}>Главная</a></li>
          <li><a href="#">Личный кабинет</a></li>
          <li><a href="#">О нас</a></li>
          <li><a href="#">Хранилище</a></li>
        </ul>
      </nav>

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
              style={{ display: 'none' }}
              onChange={handleFileInput}
              accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
            />
            
            {!selectedFile ? (
              <>
                <div className="drop-zone-icon">[+]</div>
                <h3>Перетащите файл сюда</h3>
                <p>или нажмите для выбора</p>
                <div className="supported-formats">
                  Поддерживаемые форматы: PDF, DOCX, JPG, PNG, TXT
                </div>
              </>
            ) : (
              <div className="file-preview">
                <div className="file-icon" style={{ color: '#666' }}>
                  {getFileIcon(filePreview?.format)}
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
                  ✕
                </button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="converter-options">
              <div className="converter-row">
                <div className="converter-field">
                  <label>Исходный формат</label>
                  <div className="format-badge from">
                    {getFileIcon(convertFrom)} {convertFrom.toUpperCase()}
                  </div>
                </div>

                <div className="converter-arrow">→</div>

                <div className="converter-field">
                  <label>Формат для конвертации</label>
                  <select 
                    value={convertTo} 
                    onChange={(e) => setConvertTo(e.target.value)}
                    className="format-select"
                  >
                    {formats[convertFrom]?.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {getFileIcon(fmt)} {fmt.toUpperCase()}
                      </option>
                    ))}
                    {(!formats[convertFrom] || formats[convertFrom].length === 0) && (
                      <option value="txt">[TXT] TXT</option>
                    )}
                  </select>
                </div>
              </div>

              <button className="convert-btn" onClick={handleConvert}>
                [→] Конвертировать
              </button>
            </div>
          )}

          {message && <div className={`message ${message.includes('+') ? 'success' : 'error'}`}>{message}</div>}
        </div>

        <div className="info-card">
          <h3>Поддерживаемые форматы</h3>
          <div className="format-list">
            <div className="info-item">
              <span>PDF</span>
              <span>→ DOCX, TXT, JPG, PNG</span>
            </div>
            <div className="info-item">
              <span>DOCX</span>
              <span>→ PDF, TXT</span>
            </div>
            <div className="info-item">
              <span>JPG</span>
              <span>→ PNG, PDF</span>
            </div>
            <div className="info-item">
              <span>PNG</span>
              <span>→ JPG, PDF</span>
            </div>
            <div className="info-item">
              <span>TXT</span>
              <span>→ PDF, DOCX</span>
            </div>
          </div>
          <p className="info-note">
            * Конвертация пока в разработке — интерфейс готов!
          </p>
        </div>
      </div>

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
    </>
  );
}

export default ConverterPage;