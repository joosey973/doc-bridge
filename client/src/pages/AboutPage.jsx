// client/src/pages/AboutPage.jsx
import React from 'react';
import './Pages.css';

function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-card">
        <div className="about-header">
          <h1>📦 О проекте DocBridge</h1>
          <p className="about-subtitle">Современная платформа для работы с файлами</p>
        </div>

        {/* ===== О ПРОЕКТЕ ===== */}
        <section className="about-section">
          <h2>Что такое DocBridge?</h2>
          <p>
            DocBridge — это веб-платформа, объединяющая все необходимые инструменты 
            для работы с файлами в одном месте. Мы создали сервис, который заменяет 
            несколько отдельных приложений: Pastebin для текста, онлайн-конвертеры, 
            файлообменники и инструменты для сжатия.
          </p>
          <p>
            Наша цель — сделать работу с файлами максимально простой, быстрой и удобной. 
            Никаких лишних действий — просто загружайте, конвертируйте, сжимайте и делитесь.
          </p>
        </section>

        {/* ===== НАШИ ВОЗМОЖНОСТИ ===== */}
        <section className="about-section">
          <h2>Наши возможности</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Пасты</h3>
              <p>Создавайте текстовые заметки с подсветкой синтаксиса. Поддерживается 12 языков программирования.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Конвертер</h3>
              <p>Конвертируйте файлы между популярными форматами: PDF, DOCX, JPG, PNG, TXT.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Сжатие</h3>
              <p>Уменьшайте размер файлов с выбором степени сжатия. Экономьте место и трафик.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>Файлообменник</h3>
              <p>Загружайте файлы и получайте уникальные ссылки для быстрой отправки по почте.</p>
            </div>
          </div>
        </section>

        {/* ===== ДЛЯ КОГО ===== */}
        <section className="about-section">
          <h2>Для кого DocBridge?</h2>
          <div className="audience-grid">
            <div className="audience-item">
              <span className="audience-icon">🎓</span>
              <div>
                <h4>Студенты</h4>
                <p>Обмен лекциями, курсовыми, конспектами</p>
              </div>
            </div>
            <div className="audience-item">
              <span className="audience-icon">👨‍💻</span>
              <div>
                <h4>Разработчики</h4>
                <p>Обмен кодом, документацией, логами</p>
              </div>
            </div>
            <div className="audience-item">
              <span className="audience-icon">🏢</span>
              <div>
                <h4>Офисные работники</h4>
                <p>Отчёты, презентации, счета, договоры</p>
              </div>
            </div>
            <div className="audience-item">
              <span className="audience-icon">🎨</span>
              <div>
                <h4>Дизайнеры</h4>
                <p>Передача макетов, изображений, проектов</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ПОЧЕМУ МЫ ===== */}
        <section className="about-section">
          <h2>Почему выбирают DocBridge?</h2>
          <div className="reasons-list">
            <div className="reason-item">
              <span className="reason-check">✅</span>
              <div>
                <h4>Все инструменты в одном месте</h4>
                <p>Не нужно переключаться между разными сервисами</p>
              </div>
            </div>
            <div className="reason-item">
              <span className="reason-check">✅</span>
              <div>
                <h4>Простой и понятный интерфейс</h4>
                <p>Интуитивно понятный дизайн для всех пользователей</p>
              </div>
            </div>
            <div className="reason-item">
              <span className="reason-check">✅</span>
              <div>
                <h4>Современные технологии</h4>
                <p>Быстрая работа, адаптивный дизайн, безопасность</p>
              </div>
            </div>
            <div className="reason-item">
              <span className="reason-check">✅</span>
              <div>
                <h4>Постоянное развитие</h4>
                <p>Мы регулярно добавляем новые функции и улучшения</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== КОНТАКТЫ ===== */}
        <section className="about-section">
          <h2>Контакты</h2>
          <div className="contacts">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>docbridge@mail.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span>@docbridge_bot (Telegram)</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🐙</span>
              <span>github.com/docbridge</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;