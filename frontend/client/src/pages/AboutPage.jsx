import React from 'react';
import './Pages.css';

function AboutPage() {
  return (
    <div className="about-page-wrapper">
      <div className="about-glass-card">
        
        <header className="about-page-header">
          <h1>О проекте DocBridge</h1>
          <p className="about-page-subtitle">Современная платформа для комплексной работы с файлами</p>
        </header>

        <div className="about-page-grid">
          
          {/* Левая колонка */}
          <div>
            <section className="about-page-section">
              <h2>Что такое DocBridge?</h2>
              <p>
                DocBridge — это единая веб-платформа, объединяющая все необходимые инструменты 
                для работы с файлами и кодом в одном месте. Мы создали сервис, который заменяет 
                несколько отдельных вкладок: Pastebin, онлайн-конвертеры, файлообменники и оптимизаторы размера.
              </p>
              <p>
                Наша цель — избавить вас от рутины. Никаких лишних переключений, рекламы и тяжелых интерфейсов. 
                Просто загружайте, обрабатывайте и делитесь результатом.
              </p>
            </section>

            <section className="about-page-section">
              <h2>Почему DocBridge?</h2>
              <div className="about-reasons">
                <div className="about-reason-line">Все инструменты доступны на единой панели</div>
                <div className="about-reason-line">Мгновенная обработка данных на стороне сервера</div>
                <div className="about-reason-line">Строгий минимализм интерфейса без отвлекающих деталей</div>
                <div className="about-reason-line">Безопасность и конфиденциальность ваших файлов</div>
              </div>
            </section>
          </div>

          {/* Правая колонка */}
          <div>
            <section className="about-page-section">
              <h2>Возможности</h2>
              <div className="about-features-list">
                
                <div className="about-feature-item">
                  <h3>Текстовые пасты</h3>
                  <p>Создание заметок и шеринг кода с подсветкой синтаксиса.</p>
                </div>

                <div className="about-feature-item">
                  <h3>Конвертация</h3>
                  <p>Быстрый экспорт между PDF, DOCX, изображениями и текстом.</p>
                </div>

                <div className="about-feature-item">
                  <h3>Сжатие</h3>
                  <p>Уменьшение веса документов и изображений без потери качества.</p>
                </div>

                <div className="about-feature-item">
                  <h3>Обмен файлами</h3>
                  <p>Генерация прямых ссылок для отправки коллегам или друзьям.</p>
                </div>

              </div>
            </section>
          </div>

        </div>

        {/* Футер */}
        <footer className="about-page-footer">
          <section className="about-page-section" style={{ marginBottom: 0 }}>
            <h2>Контакты для связи</h2>
            <div className="about-contacts-row">
              
              <div className="about-contact-card">
                <div className="about-contact-label">Email</div>
                <div className="about-contact-value">docbridge@mail.com</div>
              </div>

              <div className="about-contact-card">
                <div className="about-contact-label">Telegram</div>
                <div className="about-contact-value">@docbridge_bot</div>
              </div>

              <div className="about-contact-card">
                <div className="about-contact-label">GitHub</div>
                <div className="about-contact-value">github.com/docbridge</div>
              </div>

            </div>
          </section>
        </footer>

      </div>
    </div>
  );
}

export default AboutPage;