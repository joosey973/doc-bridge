import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTelegram, FaLinkedin } from 'react-icons/fa';
import { FiGithub } from "react-icons/fi";
import './Pages.css';

function TeamPage() {
  const canvasRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const digits = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      char: Math.random() > 0.5 ? '1' : '0',
      size: Math.floor(Math.random() * 6) + 12,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
      digits.forEach((d) => {
        ctx.font = `700 ${d.size}px monospace`;
        d.x += d.speedX;
        d.y += d.speedY;
        if (d.x < 0 || d.x > width) d.speedX *= -1;
        if (d.y < 0 || d.y > height) d.speedY *= -1;
        ctx.fillText(d.char, d.x, d.y);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const teamMembers = [
    { name: 'Артемий', role: 'Fullstack разработчик', tg: '', gh: 'https://github.com/joosey973' },
    { name: 'Соня', role: 'Frontend & UI', gh: 'https://github.com/ssahratova' },
    { name: 'Вероника', role: 'Frontend & UI', gh: 'https://github.com/veronikakras29-bit' },
  ];

  return (
    <>
      <canvas ref={canvasRef} className="glitch-bg-canvas" />

      {isOpen && <div className="background-overlay" onClick={closeMenu}></div>}

      <button className={`burger-btn ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span></span><span></span><span></span>
      </button>

      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/api/profile/" onClick={closeMenu}>Личный кабинет</Link></li>
          <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
          <li><Link to="/api/converter/" onClick={closeMenu}>Конвертер</Link></li>
          <li><Link to="/api/pastes/" onClick={closeMenu}>Заметки</Link></li>
          <li><Link to="/api/compress/" onClick={closeMenu}>Сжатие</Link></li>
          <li><Link to="/api/droppage/" onClick={closeMenu}>Файлообменник</Link></li>
          <li><Link to="/api/about/" onClick={closeMenu}>О нас</Link></li>
        </ul>
      </nav>

      <header className="top-header">
        <h1 className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>DocBridge</Link></h1>
      </header>

      <div className="cont">
        <div className="page-card" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div className="page-header">
            <h2>Наша команда</h2>
            <p className="page-subtitle">Мы создаем инструменты для эффективной работы с документами</p>
          </div>

          <div className="team-list" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card" style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{member.name}</h3>
                  <span style={{ color: '#888', fontSize: '14px' }}>{member.role}</span>
                </div>
                <div style={{ display: 'flex', gap: '15px', zIndex: 2}}>
                  <a href={member.gh} style={{ color: 'black' }}><FiGithub size={20}/></a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#888' }}>Хотите присоединиться к команде?</p>
            <a href="mailto:dev@docbridge.com" style={{ color: '#667eea', textDecoration: 'none' }}>Связаться с нами</a>
          </div>
        </div>
      </div>
      <footer className="bottom-footer">
        <div className="footer-buttons">
          <Link to="/api/policy/" className="footer-btn">Политика</Link>
          <Link to="/api/termsofservice/" className="footer-btn">Условия</Link>
          <Link to="/api/contacts/" className="footer-btn">Контакты</Link>
        </div>
      </footer>
    </>
  );
}

export default TeamPage;