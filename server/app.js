const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'docbridge_secret_2026';

// ============================================================
// ХРАНИЛИЩА
// ============================================================
let users = [];
let pastes = [];
let idCounter = 1;
let userIdCounter = 1;

// ============================================================
// КАТЕГОРИИ (для паст)
// ============================================================
const categories = [
    { id: 'work', name: '💼 Работа' },
    { id: 'personal', name: '👤 Личная жизнь' },
    { id: 'food', name: '🍕 Еда' },
    { id: 'study', name: '📚 Учеба' },
    { id: 'travel', name: '✈️ Путешествия' },
    { id: 'health', name: '💪 Здоровье' },
    { id: 'entertainment', name: '🎬 Развлечения' },
    { id: 'other', name: '📌 Другое' },
];

// ============================================================
// ЯЗЫКИ (для паст)
// ============================================================
const languages = [
    { id: 'text', name: 'Без подсветки', icon: '📝' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'ruby', name: 'Ruby', icon: '💎' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'sql', name: 'SQL', icon: '🗄️' },
];

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function generateCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ============================================================
// МАРШРУТЫ АВТОРИЗАЦИИ
// ============================================================

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Имя и пароль обязательны' });
        }
        
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: userIdCounter++,
            username,
            password: hashedPassword,
            email: email || '',
            createdAt: new Date().toISOString()
        };
        users.push(user);
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ВХОД
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Имя и пароль обязательны' });
        }
        
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Неверное имя или пароль' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверное имя или пароль' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ПРОФИЛЬ (получить данные пользователя по токену)
app.get('/api/auth/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
});

// ============================================================
// МАРШРУТЫ ПАСТ
// ============================================================

// ПОЛУЧИТЬ ВСЕ ПАСТЫ (для страницы "Пасты")
app.get('/api/pastes', (req, res) => {
    res.json(pastes.slice(0, 30));
});

// СОЗДАТЬ ПАСТУ
app.post('/api/pastes', (req, res) => {
    try {
        const { title, content, language, category, tags } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Содержимое обязательно' });
        }
        
        let username = 'Гость';
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = users.find(u => u.id === decoded.userId);
                if (user) username = user.username;
            } catch (e) {}
        }
        
        const paste = {
            id: idCounter++,
            title: title || 'Без названия',
            content: content,
            language: language || 'text',
            category: category || 'other',
            tags: tags || [],
            username: username,
            createdAt: new Date().toISOString(),
            views: 0,
            code: generateCode(),
            size: content.length,
        };
        
        pastes.unshift(paste);
        res.json({ success: true, id: paste.id, code: paste.code });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания пасты' });
    }
});

// УДАЛИТЬ ПАСТУ
app.delete('/api/pastes/:code', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Нужно авторизоваться' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const index = pastes.findIndex(p => p.code === req.params.code);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Паста не найдена' });
        }
        
        const paste = pastes[index];
        const user = users.find(u => u.id === decoded.userId);
        
        if (paste.username !== 'Гость' && paste.username !== user?.username) {
            return res.status(403).json({ error: 'Нет прав на удаление' });
        }
        
        pastes.splice(index, 1);
        res.json({ success: true, message: 'Паста удалена' });
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
});

// ============================================================
// ДРУГИЕ МАРШРУТЫ
// ============================================================

// ПРОВЕРКА СЕРВЕРА
app.get('/api/message', (req, res) => {
    res.json({ message: '🚀 DocBridge API работает!' });
});

// КАТЕГОРИИ (для формы создания пасты)
app.get('/api/categories', (req, res) => {
    res.json(categories);
});

// ЯЗЫКИ (для формы создания пасты)
app.get('/api/languages', (req, res) => {
    res.json(languages);
});

// ОБРАТНАЯ СВЯЗЬ
app.post('/api/feedback', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Текст не может быть пустым' });
    }
    console.log('📩 Отзыв:', text);
    res.json({ success: true, message: 'Спасибо!' });
});

// ============================================================
// ЗАПУСК
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 DocBridge API запущен на http://localhost:${PORT}`);
    console.log(`👤 Пользователей: ${users.length}`);
    console.log(`📝 Паст: ${pastes.length}`);
});
// ============================================================
// ПОЛУЧИТЬ ПАСТЫ ПОЛЬЗОВАТЕЛЯ (ДЛЯ ЛИЧНОГО КАБИНЕТА)
// ============================================================
app.get('/api/pastes/user', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        const userPastes = pastes.filter(p => p.username === user.username);
        res.json(userPastes);
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
});