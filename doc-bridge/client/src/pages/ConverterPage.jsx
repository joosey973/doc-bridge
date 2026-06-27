import React, { useState } from 'react';
import './Pages.css';

function ConverterPage({ changePage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [convertFrom, setConvertFrom] = useState('pdf');
  const [convertTo, setConvertTo] = useState('docx');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    </>
  );
}

export default ConverterPage;