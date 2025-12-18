const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// Настройка CORS для России
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://zunda.ru',
    'https://www.zunda.ru',
    'https://app.zunda.ru'
  ],
  credentials: true
};

// Лимит запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // лимит для каждого IP
  message: 'Слишком много запросов с вашего IP, попробуйте позже'
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket для live стримов
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Роуты
const routes = require('./routes');
app.use('/api', routes);

// Эндпоинт здоровья
app.get('/health', (req, res) => {
  res.json({ 
    status: 'работает', 
    message: 'Zunda API работает нормально',
    timestamp: new Date().toISOString()
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    message: 'Запрашиваемый ресурс не существует'
  });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: 'Что-то пошло не так. Пожалуйста, попробуйте позже.'
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 WebSocket готов для live стримов`);
  console.log(`🇷🇺 Адаптировано для российского рынка`);
});

module.exports = { app, io };
