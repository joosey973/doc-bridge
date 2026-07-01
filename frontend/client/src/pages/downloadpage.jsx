import React, { useState } from 'react';
import { FaFilePdf } from "react-icons/fa";
import { MdOutlineInstallDesktop } from "react-icons/md";


const DownloadWindowSimple = () => {
    const API_URL = 'http://localhost:9000/api';

    const [isDownloading, setIsDownloading] = useState(false);
    const [message, setMessage] = useState(null);

    const fileData = {
        name: 'report_2026.pdf',
        size: '3.8 MB',
        format: 'PDF',
        icon: <FaFilePdf ></FaFilePdf>
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        setMessage(null);
        
        setTimeout(() => {
            setMessage({ 
                type: 'success', 
                text: `Файл "${fileData.name}" успешно скачан` 
            });
            setIsDownloading(false);
        }, 1500);
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            padding: '20px',
            background: '#f0f2f5'
        }}>
            <div className="page-card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="page-header">
                    <h2 style={{ fontSize: '18px' }}><MdOutlineInstallDesktop ></MdOutlineInstallDesktop> Скачивание файла</h2>
                    <div className="page-subtitle">Нажмите кнопку, чтобы скачать</div>
                </div>

                {/* Блок файла */}
                <div className="drop-zone has-file">
                    <div className="drop-zone-icon" style={{ fontSize: '48px' }}>
                        {fileData.icon}
                    </div>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>
                        {fileData.name}
                    </h3>
                    <div className="file-details" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <span className="file-format">{fileData.format}</span>
                        <span className="file-size">{fileData.size}</span>
                    </div>
                </div>

                {/* Кнопка */}
                <button 
                    className="upload-btn"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{ marginTop: '20px' }}
                >
                    {isDownloading ? ' Загрузка...' : '⬇ Скачать файл'}
                </button>

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadWindowSimple;