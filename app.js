const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Middleware
// TODO

// Routes
// TODO

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// TODO

// Головна сторінка
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
});

module.exports = app;