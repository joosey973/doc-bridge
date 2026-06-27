import React, { useState } from 'react';
import './Pages.css';

function CompressPage({ changePage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [compressLevel, setCompressLevel] = useState('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const compressLevels = [
    { id: 'low', label: 'Низкое сжатие (быстро)', icon: '[L]', desc: 'Минимальное сжатие, высокая скорость' },
    { id: 'medium', label: 'Среднее сжатие (рекомендуется)', icon: '[M]', desc: 'Оптимальный баланс размера и качества' },
    { id: 'high', label: 'Высокое сжатие (медленно)', icon: '[H]', desc: 'Максимальное сжатие, дольше обработка' },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;

    const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setMessage('> Неподдерживаемый формат файла');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: file.size,
      format: ext,
    });
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

  const handleCompress = () => {
    if (!selectedFile) {
      setMessage('> Сначала загрузите файл!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsCompressing(true);
    setMessage(`~ Сжатие "${selectedFile.name}"... (уровень: ${compressLevel})`);

    setTimeout(() => {
      setIsCompressing(false);
      setMessage(`+ Сжатие завершено! Размер уменьшен на ${Math.floor(Math.random() * 40 + 20)}% (UI-заглушка)`);
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
            
            {!selectedFile ? (
              <>
                <div className="drop-zone-icon">[+]</div>
                <h3>Перетащите файл сюда</h3>
                <p>или нажмите для выбора</p>
                <div className="supported-formats">
                  Поддерживаемые форматы: PDF, DOCX, JPG, PNG, TXT, ZIP, RAR
                </div>
              </>
            ) : (
              <div className="file-preview">
                <div className="file-icon">[FILE]</div>
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
                  '~ Сжатие...'
                ) : (
                  `[›] Сжать файл (${compressLevels.find(l => l.id === compressLevel)?.icon})`
                )}
              </button>
            </div>
          )}

          {message && <div className={`message ${message.includes('+') ? 'success' : 'error'}`}>{message}</div>}
        </div>

        <div className="info-card">
          <h3>Информация о сжатии</h3>
          <div className="info-list">
            <div className="info-item">
              <span>Максимальный размер</span>
              <span>100 MB</span>
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
              <span>[IMG] Изображения</span>
              <span>Среднее или высокое</span>
            </div>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span>[DOC] Документы</span>
              <span>Низкое или среднее</span>
            </div>
            <div className="info-item" style={{ fontSize: '12px' }}>
              <span>[ARC] Архивы</span>
              <span>Низкое сжатие</span>
            </div>
          </div>

          <p className="info-note">
            * Сжатие пока в разработке — интерфейс готов!
          </p>
        </div>
      </div>
    </>
  );
}

export default CompressPage;