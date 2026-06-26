import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainW from './main_W.jsx'
import DocBridge from '@docbridge/notes.jsx' 
import CompressPage from '@docbridge/pages/CompressPage.jsx' 
import DropPage from '@docbridge/pages/DropPage.jsx' 
import ConverterPage from '@docbridge/pages/ConverterPage.jsx' 

function RootApp() {
  const [currentPage, setCurrentPage] = useState('main');

  const handlePageChange = (page) => {
    setCurrentPage(page); 
    window.history.pushState({ page }, '', page === 'main' ? '/' : `/${page}`);
  };

  useEffect(() => {
    const handlePopState = (event) => {
      setCurrentPage(event.state?.page || 'main');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Рендеринг страниц в зависимости от состояния
  if (currentPage === 'main') {
    return <MainW changePage={handlePageChange} />;
  }
  if (currentPage === 'docbridge') {
    return <DocBridge changePage={handlePageChange} />; 
  }
  if (currentPage === 'compress') {
    return <CompressPage changePage={handlePageChange} />; 
  }
  // ДОБАВИЛИ ЭТИ ДВА УСЛОВИЯ:
  if (currentPage === 'converter') {
    return <ConverterPage changePage={handlePageChange} />; 
  }
  if (currentPage === 'droppage') {
    return <DropPage changePage={handlePageChange} />; 
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)