import React from 'react';
import './Pages.css';

function ContactsPage() {
  return (
    <div className="about-page-wrapper">
      <div className="about-glass-card">
        
        <header className="about-page-header">
          <h1>Контакты и поддержка</h1>
          <p className="about-page-subtitle">Свяжитесь с командой DocBridge по любым вопросам</p>
        </header>

        <div className="about-page-grid">
          
          <div className="about-page-full-content">
            
            <section className="about-page-section">
              <h2>Служба поддержки</h2>
              <div className="section-block">
                <p>
                  Если у вас возникли технические проблемы при работе с конвертером, сжатием файлов 
                  или авторизацией, наша команда готова помочь вам. Мы обрабатываем запросы в течение 24 часов.
                </p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Email для связи:</strong> <a href="mailto:docbridge@mail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>docbridge@mail.com</a>
                </p>
              </div>
            </section>



            <section className="about-page-section">
              <h2>Официальные сообщества</h2>
              <div className="section-block">
                <p>
                  Следите за обновлениями платформы, анонсами новых функций и общайтесь с другими 
                  пользователями в нашем официальном Telegram-канале.
                </p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Telegram канал:</strong> <a href="https://t.me/docbridge_project" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>@docbridge_project</a>
                </p>
              </div>
            </section>

            <div className="legal-footnote">
              <p>© {new Date().getFullYear()} DocBridge. Мы всегда на связи.</p>
            </div>

          </div>

        </div>
        
      </div>
    </div>
  );
}

export default ContactsPage;