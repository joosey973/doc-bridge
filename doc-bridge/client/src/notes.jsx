import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './notes.css';

const API_URL = 'http://localhost:3001';

function App({ changePage }) {
  const [pastes, setPastes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('Проверка...');
  const [selectedPaste, setSelectedPaste] = useState(null);

  const categories = [
    { id: 'work', name: 'Работа' },
    { id: 'personal', name: 'Личная жизнь' },
    { id: 'food', name: 'Еда' },
    { id: 'study', name: 'Учеба' },
    { id: 'travel', name: 'Путешествия' },
    { id: 'health', name: 'Здоровье' },
    { id: 'entertainment', name: 'Развлечения' },
    { id: 'other', name: 'Другое' },
  ];

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/api/message`);
        if (response.ok) {
          setServerStatus('Сервер работает');
        } else {
          setServerStatus('Сервер недоступен');
        }
      } catch {
        setServerStatus('Сервер не запущен');
      }
    };
    checkServer();
  }, []);

  useEffect(() => {
    fetchPastes();
  }, []);

  const fetchPastes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pastes`);
      if (response.ok) {
        const data = await response.json();
        setPastes(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  const deletePaste = async (code, event) => {
    event.stopPropagation();
    
    if (!confirm(`Удалить пасту "${code}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/pastes/${code}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Паста удалена');
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`${data.error}`);
      }
    } catch (error) {
      setMessage('Ошибка удаления');
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const submitPaste = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage('Введите содержимое');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Без названия',
          content: content,
          language: language,
          category: category,
          tags: tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Паста создана. Код: ${data.code}`);
        setTitle('');
        setContent('');
        setTags([]);
        fetchPastes();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`${data.error}`);
      }
    } catch (error) {
      setMessage('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return `${Math.floor(days / 7)} нед назад`;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} КБ`;
    return `${(bytes / 1048576).toFixed(2)} МБ`;
  };

  const getLanguageName = (langId) => {
    const names = {
      javascript: 'JavaScript',
      python: 'Python',
      cpp: 'C++',
      java: 'Java',
      html: 'HTML',
      css: 'CSS',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      sql: 'SQL',
      text: 'Текст'
    };
    return names[langId] || langId;
  };

  const openPaste = (paste) => {
    setSelectedPaste(paste);
  };

  const closePaste = () => {
    setSelectedPaste(null);
  };

  const getCategoryName = (catId) => {
    const names = {
      work: 'Работа',
      personal: 'Личная жизнь',
      food: 'Еда',
      study: 'Учеба',
      travel: 'Путешествия',
      health: 'Здоровье',
      entertainment: 'Развлечения',
      other: 'Другое'
    };
    return names[catId] || 'Другое';
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          Doc<span>Bridge</span>
        </div>
        <div className="header-actions">
          <span className={`server-status ${serverStatus.includes('работает') ? 'online' : 'offline'}`}>
            {serverStatus}
          </span>
        </div>
      </header>

      <div className="container">
        <div className="create-paste">
          <h2>Новая паста</h2>
          <form onSubmit={submitPaste}>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название пасты..."
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Содержимое</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите текст или код..."
                rows={10}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Тип пасты</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Подсветка</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="sql">SQL</option>
                  <option value="text">Текст</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Теги</label>
              <div className="tags-input">
                {tags.map((tag, i) => (
                  <span key={i} className="tag">
                    #{tag}
                    <span className="remove" onClick={() => removeTag(i)}>×</span>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Тег и Enter"
                />
              </div>
            </div>

            {message && <div className={`message ${message.includes('создана') ? 'success' : 'error'}`}>{message}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Создание...' : 'Создать пасту'}
            </button>
          </form>
        </div>

        <div className="public-pastes">
          <h3>
            Все пасты
            <span className="count">{pastes.length}</span>
          </h3>
          {pastes.length === 0 ? (
            <div className="empty-state">
              <p>Нет паст</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Создайте первую!</p>
            </div>
          ) : (
            pastes.map((paste) => (
              <div key={paste.id} className="paste-item" onClick={() => openPaste(paste)}>
                <div className="paste-header">
                  <div className="paste-title">
                    {paste.title}
                  </div>
                  <button 
                    className="delete-btn" 
                    onClick={(e) => deletePaste(paste.code, e)}
                    title="Удалить пасту"
                  >
                    ✕
                  </button>
                </div>
                <div className="paste-meta">
                  <span className="lang">{getLanguageName(paste.language)}</span>
                  <span className="category">{getCategoryName(paste.category)}</span>
                  <span className="user">{paste.username || 'Гость'}</span>
                  <span className="time">{getTimeAgo(paste.createdAt)}</span>
                  <span className="size">{formatSize(paste.size)}</span>
                  {paste.tags.map((t, i) => (
                    <span key={i} className="tag-badge">#{t}</span>
                  ))}
                </div>
                <div className="paste-preview">
                  <SyntaxHighlighter
                    language={paste.language === 'text' ? 'text' : paste.language}
                    style={atomOneDark}
                    customStyle={{
                      fontSize: '12px',
                      maxHeight: '80px',
                      margin: 0,
                      padding: '10px',
                      borderRadius: '4px',
                      background: '#1a1a1a',
                      overflow: 'hidden'
                    }}
                    wrapLines={true}
                  >
                    {paste.content.slice(0, 300) + (paste.content.length > 300 ? '...' : '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedPaste && (
        <div className="modal-overlay" onClick={closePaste}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPaste.title}</h2>
              <button className="modal-close" onClick={closePaste}>✕</button>
            </div>
            <div className="modal-meta">
              <span>{getLanguageName(selectedPaste.language)}</span>
              <span>• {getCategoryName(selectedPaste.category)}</span>
              <span>• {selectedPaste.username || 'Гость'}</span>
              <span>• {getTimeAgo(selectedPaste.createdAt)}</span>
              <span>• {formatSize(selectedPaste.size)}</span>
              <span>• {selectedPaste.views || 0} просмотров</span>
              {selectedPaste.tags.map((t, i) => (
                <span key={i} className="tag-badge">#{t}</span>
              ))}
            </div>
            <div className="modal-body">
              <SyntaxHighlighter
                language={selectedPaste.language === 'text' ? 'text' : selectedPaste.language}
                style={atomOneDark}
                customStyle={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  padding: '20px',
                  borderRadius: '8px',
                  background: '#1a1a1a',
                  margin: 0
                }}
                wrapLines={true}
                wrapLongLines={true}
              >
                {selectedPaste.content}
              </SyntaxHighlighter>
            </div>
            <div className="modal-footer">
              <span className="paste-code">Код: {selectedPaste.code}</span>
              <button className="modal-close-btn" onClick={closePaste}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2026 DocBridge — Обменник файлов и кода</p>
      </footer>
    </div>
  );
}

export default App;