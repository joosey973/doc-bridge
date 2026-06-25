const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

// Хранилище паст (в памяти)
let pastes = [];
let idCounter = 1;

// Языки для подсветки синтаксиса
const languages = [
    { id: 'text', name: 'Без подсветки', icon: '📝' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'ruby', name: 'Ruby', icon: '💎' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'sql', name: 'SQL', icon: '🗄️' },
];

// Сроки хранения
const expirations = [
    { id: 'never', label: 'Никогда' },
    { id: '1hour', label: '1 час' },
    { id: '1day', label: '1 день' },
    { id: '1week', label: '1 неделя' },
    { id: '1month', label: '1 месяц' },
];

// Видимость
const visibilities = [
    { id: 'public', label: 'Публичный' },
    { id: 'unlisted', label: 'По ссылке' },
    { id: 'private', label: 'Приватный' },
];

// Генерация случайной строки
function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Создание новой пасты
function createPaste(title, content, language, expiration, visibility, tags = []) {
    const paste = {
        id: idCounter++,
        title: title || 'Без названия',
        content: content,
        language: language,
        expiration: expiration,
        visibility: visibility,
        tags: tags,
        createdAt: new Date(),
        views: 0,
        code: generateRandomString(),
        size: content.length,
    };
    pastes.unshift(paste);
    
    // Ограничим количество паст в памяти (последние 100)
    if (pastes.length > 100) {
        pastes = pastes.slice(0, 100);
    }
    
    return paste;
}

// Получение публичных паст
function getPublicPastes() {
    return pastes
        .filter(p => p.visibility === 'public')
        .slice(0, 20);
}

// Получение пасты по коду
function getPasteByCode(code) {
    return pastes.find(p => p.code === code);
}

// Удаление просроченных паст
function cleanupExpiredPastes() {
    const now = new Date();
    pastes = pastes.filter(p => {
        if (p.expiration === 'never') return true;
        
        const created = new Date(p.createdAt);
        let diffHours = (now - created) / (1000 * 60 * 60);
        
        switch(p.expiration) {
            case '1hour': return diffHours < 1;
            case '1day': return diffHours < 24;
            case '1week': return diffHours < 168;
            case '1month': return diffHours < 720;
            default: return true;
        }
    });
}

// Запускаем очистку каждый час
setInterval(cleanupExpiredPastes, 60 * 60 * 1000);

// ================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return minutes + ' мин назад';
    if (hours < 24) return hours + ' ч назад';
    if (days < 7) return days + ' дн назад';
    return Math.floor(days / 7) + ' нед назад';
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' КБ';
    return (bytes / 1048576).toFixed(2) + ' МБ';
}

// Простая подсветка синтаксиса
function highlightCode(content, language) {
    let escaped = escapeHtml(content);
    
    if (language === 'python') {
        escaped = escaped
            .replace(/\b(def|class|import|from|return|if|else|elif|for|while|try|except|with|as|print|async|await|yield|global|nonlocal|lambda|pass|break|continue|raise|assert|del|exec|in|is|not|or|and|True|False|None)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(#.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'javascript' || language === 'js') {
        escaped = escaped
            .replace(/\b(const|let|var|function|return|if|else|for|while|try|catch|class|import|export|default|async|await|new|this|super|extends|typeof|instanceof|delete|void|yield|of|from|in|with|get|set|has|of|break|continue|debugger|do|switch|case|throw|finally)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'cpp') {
        escaped = escaped
            .replace(/\b(int|void|char|float|double|return|if|else|for|while|class|public|private|protected|include|namespace|using|const|static|virtual|override|final|template|typename|typedef|enum|struct|union|new|delete|this|friend|explicit|mutable|register|volatile|inline|sizeof|catch|try|throw|auto|decltype|noexcept|nullptr|bool|short|long|signed|unsigned)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'java') {
        escaped = escaped
            .replace(/\b(class|public|private|protected|static|void|int|String|return|if|else|for|while|new|this|super|extends|implements|interface|abstract|final|try|catch|throw|throws|package|import|enum|instanceof|switch|case|break|continue|default|synchronized|volatile|transient|native|strictfp|assert|boolean|byte|char|double|float|long|short|null|true|false)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'html') {
        escaped = escaped
            .replace(/(&lt;\/?[a-zA-Z][^&gt;]*&gt;)/g, '<span class="keyword">$1</span>')
            .replace(/("[^"]*")/g, '<span class="string">$1</span>');
    } else if (language === 'css') {
        escaped = escaped
            .replace(/\b([a-zA-Z-]+)(?=\s*:)/g, '<span class="keyword">$1</span>')
            .replace(/("[^"]*")/g, '<span class="string">$1</span>')
            .replace(/('[^']*')/g, '<span class="string">$1</span>');
    } else if (language === 'php') {
        escaped = escaped
            .replace(/\b(echo|print|if|else|elseif|for|foreach|while|return|function|class|public|private|protected|static|new|this|parent|self|include|require|namespace|use|try|catch|throw|interface|abstract|final|const|var|isset|unset|empty|die|exit|eval|array|list|global|define|defined)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'sql') {
        escaped = escaped
            .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MAX|MIN|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|UNIQUE|CHECK)\b/gi, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>');
    } else if (language === 'ruby') {
        escaped = escaped
            .replace(/\b(def|class|module|if|else|elsif|unless|case|when|for|while|until|do|end|begin|rescue|ensure|return|include|extend|attr_accessor|attr_reader|attr_writer|initialize|self|super|yield|require|load|alias|undef|defined|and|or|not|in)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(#.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'go') {
        escaped = escaped
            .replace(/\b(package|import|func|if|else|for|range|return|type|struct|interface|map|chan|select|defer|go|break|continue|fallthrough|switch|case|default|const|var|nil|true|false)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    } else if (language === 'rust') {
        escaped = escaped
            .replace(/\b(fn|let|mut|if|else|for|while|loop|match|return|pub|struct|enum|impl|trait|use|mod|unsafe|async|await|move|ref|box|in|where|self|Self|super|crate|extern|static|const|type|typeof|break|continue|true|false|Some|None|Ok|Err)\b/g, '<span class="keyword">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    }
    
    return escaped;
}

// ================ HTTP СЕРВЕР ================

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // ---------- СТАТИКА ----------
    if (pathname === '/style.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(`
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: #1e1e1e;
                color: #d4d4d4;
                min-height: 100vh;
            }
            
            .header {
                background: #2d2d2d;
                padding: 15px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #007acc;
                position: sticky;
                top: 0;
                z-index: 100;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007acc;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .logo span { color: #ff6b6b; }
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .header-actions a {
                color: #d4d4d4;
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 6px;
                transition: all 0.3s;
            }
            
            .header-actions a:hover {
                background: #3d3d3d;
                color: #007acc;
            }
            
            .header-actions .new-paste-btn {
                background: #007acc;
                color: white;
                font-weight: bold;
            }
            
            .header-actions .new-paste-btn:hover {
                background: #005a9e;
                color: white;
            }
            
            .header-actions .login-btn {
                border: 1px solid #555;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 30px 20px;
                display: grid;
                grid-template-columns: 1fr 380px;
                gap: 30px;
            }
            
            .create-paste {
                background: #2d2d2d;
                border-radius: 10px;
                padding: 25px;
            }
            
            .create-paste h2 {
                font-size: 22px;
                margin-bottom: 20px;
                color: #fff;
            }
            
            .form-group {
                margin-bottom: 18px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 6px;
                font-size: 14px;
                color: #aaa;
                font-weight: 500;
            }
            
            .form-group input[type="text"],
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 10px 14px;
                background: #1e1e1e;
                border: 1px solid #444;
                border-radius: 6px;
                color: #d4d4d4;
                font-size: 14px;
                transition: border-color 0.3s;
            }
            
            .form-group input[type="text"]:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #007acc;
            }
            
            .form-group textarea {
                min-height: 300px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 14px;
                line-height: 1.6;
                resize: vertical;
            }
            
            .form-group textarea.code-editor {
                min-height: 350px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .form-group select {
                cursor: pointer;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='2' fill='none'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
            }
            
            .form-group select option {
                background: #2d2d2d;
            }
            
            .tags-input {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                padding: 8px;
                background: #1e1e1e;
                border: 1px solid #444;
                border-radius: 6px;
                min-height: 44px;
            }
            
            .tag {
                background: #007acc;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 13px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            
            .tag .remove {
                cursor: pointer;
                opacity: 0.7;
                font-size: 14px;
            }
            
            .tag .remove:hover { opacity: 1; }
            
            .tags-input input {
                border: none;
                background: transparent;
                color: #d4d4d4;
                padding: 4px 8px;
                flex: 1;
                min-width: 80px;
            }
            
            .tags-input input:focus { outline: none; }
            
            .submit-btn {
                width: 100%;
                padding: 14px;
                background: #007acc;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .submit-btn:hover {
                background: #005a9e;
            }
            
            .public-pastes {
                background: #2d2d2d;
                border-radius: 10px;
                padding: 25px;
            }
            
            .public-pastes h3 {
                font-size: 18px;
                color: #fff;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .public-pastes h3 .count {
                background: #3d3d3d;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 13px;
                color: #aaa;
            }
            
            .paste-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .paste-item {
                background: #1e1e1e;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 3px solid #007acc;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .paste-item:hover {
                background: #252525;
            }
            
            .paste-item .paste-title {
                color: #fff;
                font-weight: 500;
                font-size: 15px;
                margin-bottom: 4px;
            }
            
            .paste-item .paste-meta {
                font-size: 12px;
                color: #888;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .paste-item .paste-meta .lang {
                color: #007acc;
                font-weight: 500;
            }
            
            .paste-item .paste-meta .size {
                color: #888;
            }
            
            .paste-item .paste-meta .time {
                color: #666;
            }
            
            .paste-item .paste-meta .tag-badge {
                background: #3d3d3d;
                padding: 1px 8px;
                border-radius: 10px;
                font-size: 11px;
                color: #aaa;
            }
            
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }
            
            .empty-state .icon {
                font-size: 48px;
                display: block;
                margin-bottom: 12px;
            }
            
            .view-paste {
                background: #2d2d2d;
                border-radius: 10px;
                padding: 25px;
                max-width: 900px;
                margin: 0 auto;
                grid-column: 1 / -1;
            }
            
            .view-paste .paste-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #444;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .view-paste .paste-title {
                font-size: 24px;
                color: #fff;
            }
            
            .view-paste .paste-meta {
                color: #888;
                font-size: 14px;
            }
            
            .view-paste .paste-content {
                background: #1e1e1e;
                padding: 20px;
                border-radius: 8px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 14px;
                line-height: 1.8;
                overflow-x: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
                color: #d4d4d4;
            }
            
            .view-paste .paste-content .comment {
                color: #6a9955;
            }
            .view-paste .paste-content .string {
                color: #ce9178;
            }
            .view-paste .paste-content .keyword {
                color: #569cd6;
            }
            .view-paste .paste-content .function {
                color: #dcdcaa;
            }
            .view-paste .paste-content .number {
                color: #b5cea8;
            }
            .view-paste .paste-content .operator {
                color: #d4d4d4;
            }
            
            .back-link {
                display: inline-block;
                margin-top: 20px;
                color: #007acc;
                text-decoration: none;
                font-size: 14px;
            }
            
            .back-link:hover {
                text-decoration: underline;
            }
            
            .footer {
                background: #2d2d2d;
                padding: 20px 40px;
                text-align: center;
                border-top: 1px solid #444;
                margin-top: 40px;
                color: #666;
                font-size: 13px;
            }
            
            .footer a {
                color: #007acc;
                text-decoration: none;
            }
            
            .footer a:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 768px) {
                .container {
                    grid-template-columns: 1fr;
                }
                
                .header {
                    padding: 12px 20px;
                }
                
                .logo { font-size: 22px; }
                .header-actions { gap: 8px; }
                .header-actions a { padding: 6px 12px; font-size: 13px; }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .view-paste .paste-header {
                    flex-direction: column;
                }
            }
            
            .toast {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #2d2d2d;
                border: 1px solid #007acc;
                padding: 16px 24px;
                border-radius: 8px;
                color: #fff;
                box-shadow: 0 8px 30px rgba(0,0,0,0.5);
                z-index: 1000;
                animation: slideUp 0.3s ease;
                max-width: 400px;
            }
            
            .toast.success { border-color: #4caf50; }
            .toast.error { border-color: #ff6b6b; }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `);
        return;
    }
    
    // ---------- ГЛАВНАЯ СТРАНИЦА ----------
    if (pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        
        const publicPastes = getPublicPastes();
        const languagesOptions = languages.map(l => 
            `<option value="${l.id}">${l.icon} ${l.name}</option>`
        ).join('');
        
        const expirationsOptions = expirations.map(e => 
            `<option value="${e.id}">${e.label}</option>`
        ).join('');
        
        const visibilityOptions = visibilities.map(v => 
            `<option value="${v.id}">${v.label}</option>`
        ).join('');
        
        let pasteListHtml = '';
        if (publicPastes.length === 0) {
            pasteListHtml = `
                <div class="empty-state">
                    <span class="icon">📭</span>
                    <p>Нет публичных паст</p>
                    <p style="font-size:13px; margin-top:8px;">Создайте первую пасту!</p>
                </div>
            `;
        } else {
            pasteListHtml = publicPastes.map(p => {
                const lang = languages.find(l => l.id === p.language);
                const timeAgo = getTimeAgo(p.createdAt);
                const tagsHtml = p.tags.map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('');
                return `
                    <div class="paste-item" onclick="window.location.href='/paste/${p.code}'">
                        <div class="paste-title">${escapeHtml(p.title)}</div>
                        <div class="paste-meta">
                            <span class="lang">${lang ? lang.icon : ''} ${lang ? lang.name : 'Текст'}</span>
                            <span class="time">${timeAgo}</span>
                            <span class="size">${formatSize(p.size)}</span>
                            ${tagsHtml ? '<span>' + tagsHtml + '</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        res.end(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>FileBin - Обменник файлов и кода</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header class="header">
                    <div class="logo">
                        📦 File<span>Bin</span>
                    </div>
                    <div class="header-actions">
                        <a href="/">Главная</a>
                        <a href="/" class="new-paste-btn">➕ Новая паста</a>
                        <a href="#" class="login-btn">🔑 Войти</a>
                    </div>
                </header>
                
                <div class="container">
                    <div class="create-paste">
                        <h2>📝 Новая паста</h2>
                        <form id="pasteForm" onsubmit="submitPaste(event)">
                            <div class="form-group">
                                <label>Заголовок</label>
                                <input type="text" id="title" placeholder="Название пасты..." maxlength="100">
                            </div>
                            
                            <div class="form-group">
                                <label>Содержимое</label>
                                <textarea id="content" class="code-editor" placeholder="Введите текст или код..." required></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Подсветка синтаксиса</label>
                                    <select id="language">
                                        ${languagesOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Срок хранения</label>
                                    <select id="expiration">
                                        ${expirationsOptions}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Видимость</label>
                                    <select id="visibility">
                                        ${visibilityOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Теги</label>
                                    <div class="tags-input" id="tagsContainer">
                                        <input type="text" id="tagInput" placeholder="Напишите тег и нажмите Enter" 
                                               onkeydown="if(event.key==='Enter'){event.preventDefault();addTag();}">
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="submit-btn">🚀 Создать пасту</button>
                        </form>
                    </div>
                    
                    <div class="public-pastes">
                        <h3>
                            📋 Публичные пасты
                            <span class="count">${publicPastes.length}</span>
                        </h3>
                        <div class="paste-list">
                            ${pasteListHtml}
                        </div>
                    </div>
                </div>
                
                <footer class="footer">
                    <p>© 2026 FileBin — Обменник файлов и кода. Сделано с ❤️</p>
                    <p style="margin-top:4px; font-size:12px;">
                        <a href="#">Политика конфиденциальности</a> • 
                        <a href="#">О проекте</a> • 
                        <a href="#">API</a>
                    </p>
                </footer>
                
                <div id="toastContainer"></div>
                
                <script>
                    let tags = [];
                    
                    function addTag() {
                        const input = document.getElementById('tagInput');
                        const tag = input.value.trim();
                        if (tag && !tags.includes(tag)) {
                            tags.push(tag);
                            renderTags();
                        }
                        input.value = '';
                        input.focus();
                    }
                    
                    function removeTag(index) {
                        tags.splice(index, 1);
                        renderTags();
                    }
                    
                    function renderTags() {
                        const container = document.getElementById('tagsContainer');
                        container.innerHTML = tags.map((t, i) => 
                            '<span class="tag">' + escapeHtml(t) + '<span class="remove" onclick="removeTag(' + i + ')">×</span></span>'
                        ).join('') + '<input type="text" id="tagInput" placeholder="Напишите тег и нажмите Enter" onkeydown="if(event.key===\'Enter\'){event.preventDefault();addTag();}">';
                    }
                    
                    function escapeHtml(text) {
                        const div = document.createElement('div');
                        div.textContent = text;
                        return div.innerHTML;
                    }
                    
                    function showToast(message, type) {
                        type = type || 'success';
                        const container = document.getElementById('toastContainer');
                        const toast = document.createElement('div');
                        toast.className = 'toast ' + type;
                        toast.textContent = message;
                        container.appendChild(toast);
                        setTimeout(function() { toast.remove(); }, 4000);
                    }
                    
                    async function submitPaste(event) {
                        event.preventDefault();
                        
                        const title = document.getElementById('title').value || 'Без названия';
                        const content = document.getElementById('content').value;
                        const language = document.getElementById('language').value;
                        const expiration = document.getElementById('expiration').value;
                        const visibility = document.getElementById('visibility').value;
                        
                        if (!content.trim()) {
                            showToast('⚠️ Введите содержимое пасты', 'error');
                            return;
                        }
                        
                        try {
                            const response = await fetch('/api/pastes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    title: title,
                                    content: content,
                                    language: language,
                                    expiration: expiration,
                                    visibility: visibility,
                                    tags: tags
                                })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                showToast('✅ Паста создана! Код: ' + data.code, 'success');
                                document.getElementById('content').value = '';
                                document.getElementById('title').value = '';
                                tags = [];
                                renderTags();
                                setTimeout(function() { window.location.reload(); }, 1000);
                            } else {
                                showToast('❌ ' + data.error, 'error');
                            }
                        } catch (error) {
                            showToast('❌ Ошибка: ' + error.message, 'error');
                        }
                    }
                </script>
            </body>
            </html>
        `);
        return;
    }
    
    // ---------- API: СОЗДАНИЕ ПАСТЫ ----------
    if (pathname === '/api/pastes' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const paste = createPaste(
                    data.title,
                    data.content,
                    data.language || 'text',
                    data.expiration || 'never',
                    data.visibility || 'public',
                    data.tags || []
                );
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    id: paste.id,
                    code: paste.code,
                    url: '/paste/' + paste.code
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
        return;
    }
    
    // ---------- ПРОСМОТР ПАСТЫ ----------
    if (pathname.startsWith('/paste/')) {
        const code = pathname.split('/')[2];
        const paste = getPasteByCode(code);
        
        if (!paste) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Паста не найдена</title>
                <link rel="stylesheet" href="/style.css">
                </head>
                <body>
                    <header class="header">
                        <div class="logo">📦 File<span>Bin</span></div>
                        <div class="header-actions">
                            <a href="/">← На главную</a>
                        </div>
                    </header>
                    <div style="max-width:600px;margin:80px auto;text-align:center;color:#888;">
                        <h1 style="font-size:64px;">404</h1>
                        <p style="font-size:20px;margin:20px 0;">Паста не найдена</p>
                        <a href="/" style="color:#007acc;text-decoration:none;">Вернуться на главную</a>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        
        paste.views++;
        
        const lang = languages.find(l => l.id === paste.language);
        const timeAgo = getTimeAgo(paste.createdAt);
        const tagsHtml = paste.tags.map(t => 
            '<span class="tag-badge" style="background:#3d3d3d;padding:2px 10px;border-radius:10px;font-size:12px;">#' + escapeHtml(t) + '</span>'
        ).join(' ');
        
        const highlightedContent = highlightCode(paste.content, paste.language);
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${escapeHtml(paste.title)} - FileBin</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header class="header">
                    <div class="logo">📦 File<span>Bin</span></div>
                    <div class="header-actions">
                        <a href="/">← На главную</a>
                        <a href="/" class="new-paste-btn">➕ Новая паста</a>
                    </div>
                </header>
                
                <div class="container" style="display:block;max-width:900px;">
                    <div class="view-paste">
                        <div class="paste-header">
                            <div>
                                <h1 class="paste-title">${escapeHtml(paste.title)}</h1>
                                <div class="paste-meta">
                                    <span>${lang ? lang.icon : '📝'} ${lang ? lang.name : 'Текст'}</span>
                                    <span>• ${timeAgo}</span>
                                    <span>• ${formatSize(paste.size)}</span>
                                    <span>• 👁️ ${paste.views} просмотров</span>
                                    ${paste.visibility === 'public' ? '<span>• 🌍 Публичная</span>' : ''}
                                    ${paste.visibility === 'private' ? '<span>• 🔒 Приватная</span>' : ''}
                                    ${paste.visibility === 'unlisted' ? '<span>• 🔗 По ссылке</span>' : ''}
                                </div>
                                ${tagsHtml ? '<div style="margin-top:8px;">' + tagsHtml + '</div>' : ''}
                            </div>
                            <div style="text-align:right;font-size:13px;color:#666;">
                                Код: <strong style="color:#007acc;">${paste.code}</strong>
                            </div>
                        </div>
                        
                        <div class="paste-content">${highlightedContent}</div>
                        
                        <a href="/" class="back-link">← Вернуться на главную</a>
                    </div>
                </div>
                
                <footer class="footer">
                    <p>© 2026 FileBin — Обменник файлов и кода</p>
                </footer>
            </body>
            </html>
        `);
        return;
    }
    
    // ---------- 404 ----------
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>404</title>
        <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header class="header">
                <div class="logo">📦 File<span>Bin</span></div>
            </header>
            <div style="max-width:600px;margin:80px auto;text-align:center;color:#888;">
                <h1 style="font-size:64px;">404</h1>
                <p style="font-size:20px;margin:20px 0;">Страница не найдена</p>
                <a href="/" style="color:#007acc;text-decoration:none;">Вернуться на главную</a>
            </div>
        </body>
        </html>
    `);
});

// ================ ЗАПУСК ================

server.listen(3000, () => {
    console.log('🚀 FileBin запущен на http://localhost:3000');
    console.log('📝 Создавайте пасты с подсветкой синтаксиса!');
});