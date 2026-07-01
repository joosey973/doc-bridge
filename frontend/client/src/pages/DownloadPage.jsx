import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaDownload, FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";
import { MdClose, MdPerson, MdErrorOutline } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import './Pages.css';

const API_URL = 'http://localhost:8000/api';

function DownloadPage() {
  const { fileCode } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [filePreviews, setFilePreviews] = useState([]);

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
    const fetchFileData = async () => {
      try {
        const response = await fetch(`${API_URL}/droppage/${fileCode}/`);
        if (response.ok) {
          const data = await response.json();
          console.log(data.data)
          setFileData(data.data);;
          setFilePreviews(data.data.files);
          setError(null);
        } else {
          setError('Истек срок хранения или файлы не были созданы');
          setFileData(null);
          setFilePreviews([]);
        }
      } catch (err) {
        setError('Истек срок хранения или файлы не были созданы');
        setFileData(null);
        setFilePreviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (fileCode) {
      fetchFileData();
    } else {
      setError('Неверный код файла');
      setLoading(false);
    }
  }, [fileCode]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/droppage/download/${fileCode}/`);
      
      if (response.ok) {
        const blob = await response.blob();
        const contentType = response.headers.get('content-type');
        const isZip = contentType && (
            contentType.includes('application/zip') || 
            contentType.includes('application/x-zip-compressed')
        );
        if (isZip) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileData?.code}.zip` || 'archive.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData?.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
      } else {
        alert('⚠️ Сервер не отвечает, скачивается тестовый файл');
        const content = `Тестовый файл для демонстрации\n\nКод файла: ${fileCode}\nДата: ${new Date().toLocaleString()}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData?.filename || `${fileCode}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('⚠️ Ошибка скачивания, создаётся тестовый файл');
      const content = `Тестовый файл для демонстрации\n\nКод файла: ${fileCode}\nДата: ${new Date().toLocaleString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileData?.filename || `${fileCode}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  // ===== ФОРМАТИРОВАНИЕ РАЗМЕРА =====
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Б';
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1048576).toFixed(1) + ' МБ';
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ===== ЗАКРЫТИЕ МЕНЮ =====
  const closeMenu = () => setIsOpen(false);

  if (loading) {
    return (
      <div className="app-container">
        <canvas ref={canvasRef} className="glitch-bg-canvas" />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Загрузка файла...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <canvas ref={canvasRef} className="glitch-bg-canvas" />
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="page-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              <MdErrorOutline size={48} style={{ color: '#e53935' }} />
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Файл не найден</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>{error}</p>
            <button className="submit-btn" onClick={() => navigate('/')}>
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <canvas ref={canvasRef} className="glitch-bg-canvas" />
      
      {isOpen && <div className="background-overlay" onClick={closeMenu}></div>}

      {/* БУРГЕР-МЕНЮ */}
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
          <li><a href="/" onClick={closeMenu}>Главная</a></li>
          <li><a href="/api/pastes/" onClick={closeMenu}>Заметки</a></li>
          <li><a href="/api/converter/" onClick={closeMenu}>Конвертер</a></li>
          <li><a href="/api/compress/" onClick={closeMenu}>Сжатие</a></li>
          <li><a href="/api/droppage/" onClick={closeMenu}>Файлообменник</a></li>
          <li><a href="/api/about/" onClick={closeMenu}>О нас</a></li>
        </ul>
      </nav>

      {/* ХЕДЕР */}
      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</a>
        </h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
            <span className="notification-badge"></span>
            ➤
          </button>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="main-content" style={{ 
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)'
      }}>
        <div className="page-container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 350px', 
          gap: '40px',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div className="page-card" style={{ textAlign: 'center' }}>
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
                  </div>
                ))}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '25px',
              fontSize: '13px',
              color: '#666',
              alignItems: 'center'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaFileAlt size={14} /> {formatFileSize(fileData?.size)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CiCalendarDate size={16} /> {fileData?.created_at}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdPerson size={16} /> {fileData?.user.username || 'Аноним'}
              </span>
            </div>

            <button 
              className="submit-btn" 
              onClick={handleDownload}
              style={{ 
                padding: '14px 48px',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <FaDownload size={18} /> Скачать файл
            </button>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#aaa' }}>
              <CiCalendarDate size={14} style={{ marginRight: '4px' }} /> 
              Ссылка действительна до {fileData?.expires_at || Date.now() + 7 * 24 * 60 * 60 * 1000}
            </div>
          </div>

          {/* ИНФОРМАЦИОННАЯ КАРТОЧКА */}
          <div className="info-card">
            <h3 style={{ 
              fontFamily: "'Syncopate', sans-serif",
              fontSize: '13px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '20px',
              fontWeight: '700'
            }}>
              <FaCloudUploadAlt size={16} style={{ marginRight: '8px' }} /> Информация
            </h3>
            
            <div className="info-list">
              <div className="info-item">
                <span><FaFileAlt size={12} style={{ marginRight: '6px' }} /> Количество файлов</span>
                <span style={{ wordBreak: 'break-all' }}>{fileData?.count || '—'}</span>
              </div>
              <div className="info-item">
                <span><FaFileAlt size={12} style={{ marginRight: '6px' }} /> Размер</span>
                <span>{formatFileSize(fileData?.size)}</span>
              </div>
              <div className="info-item">
                <span><MdPerson size={12} style={{ marginRight: '6px' }} /> Загрузил</span>
                <span>{fileData?.user.username || 'Аноним'}</span>
              </div>
              <div className="info-item">
                <span><CiCalendarDate size={12} style={{ marginRight: '6px' }} /> Дата загрузки</span>
                <span>{fileData?.created_at}</span>
              </div>
              <div className="info-item">
                <span><CiCalendarDate size={12} style={{ marginRight: '6px' }} /> Срок действия</span>
                <span>{fileData?.expires_at}</span>
              </div>
            </div>
            
            <p className="info-note" style={{ 
              marginTop: '20px',
              padding: '12px',
              borderLeft: '2px solid #000',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <MdErrorOutline size={14} /> Файл будет автоматически удален после истечения срока
            </p>
            
          </div>
        </div>
      </main>

      <footer className="bottom-footer">
        <div className="footer-buttons">
          <button className="footer-btn">Политика</button>
          <button className="footer-btn">Условия</button>
          <button className="footer-btn">Контакты</button>
        </div>
      </footer>

      <style>{`
        .bottom-footer {
          background: transparent;
          padding: 15px 20px;
          display: flex;
          justify-content: flex-end;
          border-top: 0.5px solid #c4c4c4;
        }
        .footer-buttons {
          display: flex;
          gap: 20px;
        }
        .footer-btn {
          background: none;
          border: none;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          color: #888;
          padding: 4px 8px;
          transition: color 0.3s;
        }
        .footer-btn:hover {
          color: #000;
        }
        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 30px;
          border-bottom: 0.5px solid #c4c4c4;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .logo {
          font-family: 'Syncopate', sans-serif;
          font-size: 18px;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 700;
          margin: 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .icon-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #000;
          position: relative;
        }
        .notification-badge {
          position: absolute;
          top: -2px;
          right: -4px;
          width: 6px;
          height: 6px;
          background: #000;
          border-radius: 50%;
        }
        .burger-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #000;
          padding: 4px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: fixed;
          top: 12px;
          left: 15px;
          z-index: 60;
        }
        .burger-btn span {
          display: block;
          width: 24px;
          height: 2px;
          background: #000;
          transition: all 0.3s;
        }
        .burger-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(4px, 4px);
        }
        .burger-btn.open span:nth-child(2) {
          opacity: 0;
        }
        .burger-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(4px, -4px);
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: -280px;
          width: 280px;
          height: 100vh;
          background: #ffffff;
          border-right: 0.5px solid #c4c4c4;
          transition: left 0.3s ease;
          z-index: 100;
          padding: 70px 20px 20px 20px;
          overflow-y: auto;
        }
        .sidebar.active {
          left: 0;
        }
        .sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar ul li {
          margin-bottom: 8px;
        }
        .sidebar ul li a {
          display: block;
          padding: 12px 16px;
          color: #000;
          text-decoration: none;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 0.5px solid transparent;
          transition: all 0.3s;
          font-weight: 500;
        }
        .sidebar ul li a:hover {
          border-color: #000;
          background: rgba(0, 0, 0, 0.02);
        }
        .background-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          z-index: 90;
        }
        .glitch-bg-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .app-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          background: #ffffff;
        }
        .main-content {
          position: relative;
          z-index: 1;
        }
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          position: relative;
          z-index: 2;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 2px solid #e0e0e0;
          border-top: 2px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default DownloadPage;