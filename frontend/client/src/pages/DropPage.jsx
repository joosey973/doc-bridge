import React, { useState } from 'react';
import './Pages.css';
import { 
  FaFileAlt, 
  FaCloudUploadAlt, 
  FaRegCheckCircle 
} from "react-icons/fa";
import { 
  MdClose, 
  MdInfoOutline 
} from "react-icons/md";

function DropPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileLink, setFileLink] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div className="page-container drop-container">
      <div className="page-card drop-card">
        <div className="page-header">
          <h2><FaCloudUploadAlt size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Обмен файлами</h2>
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
              <div className="drop-zone-icon"><FaCloudUploadAlt size={48} style={{ color: '#667eea' }} /></div>
              <h3>Перетащите файл сюда</h3>
              <p>или нажмите для выбора</p>
              <div className="supported-formats">
                Максимальный размер: 2 ГБ. Любые форматы.
              </div>
            </>
          ) : (
            <div className="file-preview">
              <div className="file-icon"><FaFileAlt size={32} /></div>
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
  );
}

export default DropPage;