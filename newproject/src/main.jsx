import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainW from './main_W.jsx'
import DocBridge from '@docbridge/notes.jsx' 
import CompressPage from '@docbridge/pages/CompressPage.jsx' 
import DropPage from '@docbridge/pages/DropPage.jsx' 
import ConverterPage from '@docbridge/pages/ConverterPage.jsx' 
import AboutPage from '@docbridge/pages/AboutPage.jsx' 
import ProfilePage from '@docbridge/pages/ProfilePage.jsx' 

const API_URL = 'http://localhost:3001';

function RootApp() {
  const [currentPage, setCurrentPage] = useState('main');

  // ГЛОБАЛЬНЫЕ СТЕЙТЫ АВТОРИЗАЦИИ ДЛЯ ВСЕХ СТРАНИЦ
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page); 
    window.history.pushState({ page }, '', page === 'main' ? '/' : `/${page}`);
  };

  // Слушатель кнопки "Назад" в браузере
  useEffect(() => {
    const handlePopState = (event) => {
      setCurrentPage(event.state?.page || 'main');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Автоматическая проверка токена и загрузка профиля
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user); // Пользователь записан в глобальный стейт!
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  // Рендеринг страниц с прокидыванием авторизации (user, token и т.д.)
  switch (currentPage) {
    case 'main':
      return (
        <MainW 
          changePage={handlePageChange} 
          user={user} 
          setUser={setUser} 
          token={token} 
          setToken={setToken} 
          logout={logout} 
        />
      );
    case 'docbridge':
      return (
        <DocBridge 
          changePage={handlePageChange} 
          user={user} 
          token={token} 
        />
      );
    case 'compress':
      return (
        <CompressPage 
          changePage={handlePageChange} 
          user={user} 
          token={token} 
        />
      );
    case 'converter':
      return (
        <ConverterPage 
          changePage={handlePageChange} 
          user={user} 
          token={token} 
        />
      );
    case 'droppage':
      return (
        <DropPage 
          changePage={handlePageChange} 
          user={user} 
          token={token} 
        />
      );
    case 'about':
      return (
        <AboutPage 
          changePage={handlePageChange} 
          user={user} 
        />
      );
    case 'profile':
      return (
        <ProfilePage 
          changePage={handlePageChange} 
          user={user} 
          token={token} 
        />
      );
    default:
      return (
        <MainW 
          changePage={handlePageChange} 
          user={user} 
          setUser={setUser} 
          token={token} 
          setToken={setToken} 
          logout={logout} 
        />
      );
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)