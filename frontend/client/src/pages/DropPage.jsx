import React, { useState, useEffect, useRef } from 'react';
import './Pages.css';
import { 
  FaFileAlt
} from "react-icons/fa";
import { 
  MdClose, 
  MdInfoOutline 
} from "react-icons/md";

function DropPage({ changePage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileLink, setFileLink] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleUpload = () => {
    if (!selectedFile) return;
    setUploading(true);
    setMessage('Загрузка файла на сервер...');

    setTimeout(() => {
      setUploading(false);
      setFileLink(`https://dropfile.io/d/${Math.random().toString(36).substr(2, 9)}`);
      setMessage('Файл успешно загружен! Ссылка сгенерирована.');
    }, 2000);
  };

  const handleSendEmail = () => {
    if (!recipient) {
      setMessage('Укажите получателя!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage(`Ссылка успешно отправлена на ${recipient}`);
    setTimeout(() => {
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      setFileLink(null);
      setRecipient('');
      setSender('');
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1048576).toFixed(1) + ' МБ';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* КАНВАС С ЦИФРАМИ - НА ФОНЕ */}
      <canvas ref={canvasRef} className="glitch-bg-canvas" />

      {/* ВСЁ ОСТАЛЬНОЕ ПОВЕРХ */}
      <div className="drop-page-wrapper" style={{ position: 'relative', zIndex: 1 }}>

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

        <div className="page-container drop-container">
          <div className="page-card drop-card">
            <div className="page-header">
              <h2>Обмен файлами</h2>
              <p className="page-subtitle">Загрузите большой файл и отправьте ссылку другу</p>
            </div>

            {/* DRAG-AND-DROP ЗОНА */}
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !fileLink && document.getElementById('dropFileInput').click()}
            >
              <input
                type="file"
                id="dropFileInput"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              
              {!selectedFile ? (
                <>
                  <div className="drop-zone-icon">[+]</div>
                  <h3>Перетащите файл сюда</h3>
                  <p>или нажмите для выбора</p>
                  <div className="supported-formats">
                    Максимальный размер: 2 ГБ. Любые форматы.
                  </div>
                </>
              ) : (
                <div className="file-preview">
                  <div className="file-icon" style={{ color: '#666' }}>[FILE]</div>
                  <div className="file-info">
                    <div className="file-name">{filePreview?.name}</div>
                    <div className="file-details">
                      <span className="file-format">{filePreview?.format?.toUpperCase()}</span>
                      <span className="file-size">{formatFileSize(filePreview?.size)}</span>
                    </div>
                  </div>
                  {!fileLink && (
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
                  )}
                </div>
              )}
            </div>

            {/* ССЫЛКА И ОТПРАВКА */}
            {selectedFile && !fileLink && (
              <button 
                className="upload-btn" 
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : 'Получить ссылку'}
              </button>
            )}

            {fileLink && (
              <div className="link-section">
                <div className="link-label">Ваша ссылка готова:</div>
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

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>КОМУ ОТПРАВИТЬ:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="E-mail или SMS-номер"
                  />
                </div>

                <div className="form-group">
                  <label>ОТ КОГО:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Имя или E-mail"
                  />
                </div>

                <button 
                  className="send-btn" 
                  onClick={handleSendEmail}
                  disabled={!selectedFile || !recipient}
                >
                  Отправить ссылку
                </button>
              </div>
            )}

            {message && <div className={`message ${message.includes('успешно') || message.includes('загружен') ? 'success' : 'error'}`}>{message}</div>}
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
                <span>Email / SMS</span>
              </div>
            </div>
            <p className="info-note">
              Отправка пока в разработке — интерфейс готов!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default DropPage;