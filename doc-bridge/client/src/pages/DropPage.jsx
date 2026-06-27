import React, { useState } from 'react';
import './Pages.css';

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

  const handleUpload = () => {
    if (!selectedFile) {
      setMessage('> Сначала загрузите файл!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('~ Загрузка файла... (заглушка)');

    setTimeout(() => {
      const link = `https://docbridge.io/d/${Math.random().toString(36).substring(2, 10)}`;
      setFileLink(link);
      setUploading(false);
      setMessage(`+ Файл загружен! Ссылка создана.`);
      setTimeout(() => setMessage(''), 3000);
    }, 2000);
  };

  const handleSendEmail = () => {
    if (!recipient) {
      setMessage('> Укажите получателя!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage(`~ Отправка "${selectedFile?.name}" на ${recipient}... (заглушка)`);
    setTimeout(() => {
      setMessage(`+ Ссылка отправлена на ${recipient}!`);
    }, 2000);
  };

  const copyLink = () => {
    if (fileLink) {
      navigator.clipboard.writeText(fileLink);
      setMessage('+ Ссылка скопирована в буфер обмена!');
      setTimeout(() => setMessage(''), 3000);
    }
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
            <h2>DropMeFiles</h2>
            <p className="page-subtitle">Загрузите файл и получите ссылку для отправки</p>
          </div>

          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('dropFileInput').click()}
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
                  PDF, DOCX, JPG, PNG, ZIP и другие
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
                    setFileLink(null);
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button 
            className="upload-btn" 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? '~ Загрузка...' : '[↑] Загрузить файл'}
          </button>

          {fileLink && (
            <div className="link-container">
              <div className="link-box">
                <span className="link-label">Ссылка на файл:</span>
                <input 
                  type="text" 
                  className="link-input" 
                  value={fileLink} 
                  readOnly 
                />
                <button className="copy-btn" onClick={copyLink}>
                  [C] Копировать
                </button>
              </div>
            </div>
          )}

          <div className="email-form">
            <h4>Отправить ссылку по почте</h4>
            
            <div className="form-group">
              <label>КОМУ:</label>
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
              [→] Отправить ссылку
            </button>
          </div>

          {message && <div className={`message ${message.includes('+') ? 'success' : 'error'}`}>{message}</div>}
        </div>

        <div className="info-card">
          <h3>Информация</h3>
          <div className="info-list">
            <div className="info-item">
              <span>Максимальный размер</span>
              <span>2 GB</span>
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
            * Отправка пока в разработке — интерфейс готов!
          </p>
        </div>
      </div>
    </>
  );
}

export default DropPage;