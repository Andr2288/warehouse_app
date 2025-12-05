const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

// Головна сторінка
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Dashboard
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Error handling middleware
function errorMiddleware(err, req, res, next) {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Внутрішня помилка сервера'
    });
}

app.use(errorMiddleware);

// Підключення до БД та запуск сервера
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Сервер запущено на порті ${PORT}`);
            console.log(`http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Помилка запуску сервера:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;