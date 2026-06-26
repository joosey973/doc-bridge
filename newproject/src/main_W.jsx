import { useState, useEffect, useRef } from 'react';
import './main_W.css';

// Добавили { changePage } в аргументы, чтобы менять страницы
function App({ changePage }) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const numDigits = 70; 
    const digits = [];

    for (let i = 0; i < numDigits; i++) {
      digits.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: Math.random() > 0.5 ? '1' : '0',
        size: Math.floor(Math.random() * 6) + 12, 
        glitchX: (Math.random() - 0.5) * 20,
        glitchY: (Math.random() - 0.5) * 20,
        tick: 0,
        tickMax: Math.floor(Math.random() * 15) + 5
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
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.56)'; 
      
      digits.forEach((d, idx) => {
        ctx.font = `700 ${d.size}px monospace`; 
        if (isHovered) {
          const rows = 8; 
          const targetY = (idx % rows) * (height / rows) + (height / (rows * 2));
          
          d.y = targetY;
          
          d.tick++;
          if (d.tick > 5) {
            d.x += 15; 
            if (Math.random() > 0.85) d.char = d.char === '1' ? '0' : '1';
            d.tick = 0;
          }

          if (idx % 8 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.fillRect(0, targetY + 2, width, 1);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; 
          }

        } else {
          d.tick++;
          if (d.tick >= d.tickMax) {
            d.x += (Math.random() - 0.5) * 60;
            d.y += (Math.random() - 0.5) * 60;
            
            if (Math.random() > 0.5) d.char = Math.random() > 0.5 ? '1' : '0';
            
            d.tick = 0;
            d.tickMax = Math.floor(Math.random() * 20) + 10;
          }
        }

        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        ctx.fillText(d.char, d.x, d.y);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  return (
    <div className="app-container">
      <canvas ref={canvasRef} className="glitch-bg-canvas" />
      
      {isOpen && <div className="background-overlay" onClick={closeMenu}></div>}

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
          <li><a href="#">Личный кабинет</a></li>
          <li><a href="#">О нас</a></li>
          {/* Ссылка в боковом меню переключает на docbridge */}
          <li><a href="#" onClick={(e) => { e.preventDefault(); changePage('docbridge'); }}>Заметки</a></li>
          <li><a href="#">Хранилище</a></li>
        </ul>
      </nav>

      <header className="top-header">
        <div className="header-left"></div>
        <h1 className="logo">DocBridge</h1>
        <div className="header-right">
          <button className="icon-btn" title="Уведомления">
            <span className="notification-badge"></span>
            ➤
          </button>
          <button className="auth-btn">Войти</button>
        </div>
      </header>

      <main className="main-content">
        <div className="buttons-grid">
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('converter')}
          >
            <span data-text="Конвертер">Конвертер</span>
          </button>
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('compress')}
          >
            <span data-text="Сжатие">Сжатие</span>
          </button>
          {/* Большая кнопка "Заметки" теперь переключает страницу по клику */}
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('docbridge')}
          >
            <span data-text="Заметки">Заметки</span>
          </button>
          <button 
            className="menu-item-btn"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => changePage('droppage')}
          >
            <span data-text="Файлообменник">Файлообменник</span>
          </button>
        </div>
      </main>

      <footer className="bottom-footer">
        <div className="footer-buttons">
          <button className="footer-btn">1</button>
          <button className="footer-btn">2</button>
          <button className="footer-btn">3</button>
        </div>
      </footer>
    </div>
  );
}

export default App;