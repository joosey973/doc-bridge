import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

function PolicyPage() {
  return (
    <>
    <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link></h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
          </button>
        </div>
      </header>
    <div className="about-page-wrapper">
      <div className="about-glass-card">
        
        <header className="about-page-header">
          <h1>Политика конфиденциальности</h1>
          <p className="about-page-subtitle">Как платформа DocBridge обрабатывает и защищает ваши данные</p>
        </header>

        <div className="about-page-grid">
          
          <div className="about-page-full-content">
            
            <section className="about-page-section">
              <h2>1. Сбор информации</h2>
              <div className="section-block">
                <p>
                  Мы собираем только те данные, которые необходимы для стабильного функционирования сервисов:
                </p>
                
                  <p>При регистрации аккаунта: имя пользователя (username) и адрес электронной почты (email);</p>
                  <p>Техническая информация: IP-адрес (для защиты от спама и DDoS-атак) и файлы cookie (для сохранения сессии авторизации).</p>
              </div>
            </section>

            <section className="about-page-section">
              <h2>2. Обработка файлов и заметок</h2>
              <div className="section-block">
                <p>
                  Безопасность вашего контента является нашим приоритетом. На платформе DocBridge действуют строгие правила изоляции данных:
                </p>
                
                  <p>Файлы, загружаемые в Конвертер или Сжатие, обрабатываются в оперативной памяти сервера и уничтожаются сразу после завершения операции;</p>
                  <p>Текстовые заметки (Pastes) шифруются на стороне базы данных и доступны только по прямой ссылке, либо владельцу аккаунта;</p>
                  <p>Мы не анализируем, не просматриваем и не передаем третьим лицам содержимое ваших файлов или заметок.</p>
              </div>
            </section>

            <section className="about-page-section">
              <h2>3. Защита данных</h2>
              <p>
                Для защиты передаваемой информации используется протокол HTTPS (SSL-шифрование). Все пароли пользователей хэшируются с использованием современных криптографических алгоритмов перед сохранением в базу данных. Мы рекомендуем использовать уникальные пароли для обеспечения максимальной безопасности вашего личного кабинета.
              </p>
            </section>

            <section className="about-page-section">
              <h2>4. Права пользователей</h2>
              <p>
                Вы имеете полное право в любой момент изменить данные своего профиля в личном кабинете. Если вы решите полностью удалить свой аккаунт, вы можете отправить соответствующий запрос в службу поддержки, и все связанные с вами данные (включая сохраненные заметки) будут безвозвратно стерты из системы.
              </p>
            </section>

            <div className="legal-footnote">
              <p>© {new Date().getFullYear()} DocBridge. Конфиденциальность гарантирована. Последнее обновление: Июнь 2026.</p>
            </div>

          </div>

        </div> {/* Конец grid */}
        
      </div>
    </div>
    </>
  );
}

export default PolicyPage;