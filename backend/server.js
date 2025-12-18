const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Configuration CORS pour Codespaces et développement
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'exp://localhost:8081',
  // Expo development
  /\.exp\.direct$/,
  /\.exp\.go\.expo\.dev$/,
  /\.exp\.dev$/,
  // Codespaces
  /\.github\.dev$/,
  /\.githubpreview\.dev$/,
  /\.app\.github\.dev$/,
  // Pour Expo Go sur mobile
  'http://192.168.*:*',
  'http://10.*.*:*',
  // Production (à configurer plus tard)
  'https://zunda.ru',
  'https://www.zunda.ru'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (comme les apps mobiles, postman)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est dans la liste blanche
    if (allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      console.log('CORS bloqué pour origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite chaque IP à 1000 requêtes par fenêtre
  message: {
    error: 'Слишком много запросов',
    message: 'Пожалуйста, попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// WebSocket pour live стримов
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Stocker io dans l'app pour y accéder dans les routes
app.set('io', io);

// Log des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Новое WebSocket соединение:', socket.id);
  
  // Rejoindre une room pour un live spécifique
  socket.on('join-live', (liveId) => {
    socket.join(`live_${liveId}`);
    console.log(`Socket ${socket.id} присоединился к live ${liveId}`);
    
    // Notifier les autres viewers
    socket.to(`live_${liveId}`).emit('viewer-joined', {
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });
  
  // Quitter une room
  socket.on('leave-live', (liveId) => {
    socket.leave(`live_${liveId}`);
    console.log(`Socket ${socket.id} покинул live ${liveId}`);
  });
  
  // Gestion des messages en direct
  socket.on('live-message', (data) => {
    const { liveId, message, user } = data;
    console.log(`Сообщение в live ${liveId}:`, message);
    
    // Diffuser le message à tous les viewers du live
    io.to(`live_${liveId}`).emit('new-message', {
      user,
      message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Gestion des déconnexions
  socket.on('disconnect', () => {
    console.log('WebSocket отключен:', socket.id);
  });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');
const giftRoutes = require('./routes/gift.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const userRoutes = require('./routes/user.routes');
const liveRoutes = require('./routes/live.routes');
const storyRoutes = require('./routes/story.routes');

// Route racine
app.get('/', (req, res) => {
  res.json({
    app: 'Zunda API',
    version: '1.0.0',
    status: 'работает',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      payment: '/api/payment',
      gifts: '/api/gifts',
      live: '/api/live',
      stories: '/api/stories'
    }
  });
});

// Route santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'работает', 
    message: 'Zunda API работает нормально',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/stories', storyRoutes);

// Route pour obtenir l'URL du backend (utile pour Expo)
app.get('/api/config', (req, res) => {
  res.json({
    api_url: process.env.API_URL || `http://${req.headers.host}`,
    environment: process.env.NODE_ENV,
    codespaces: process.env.CODESPACES === 'true',
    allowed_origins: allowedOrigins
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    message: 'Запрашиваемый ресурс не существует',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так. Пожалуйста, попробуйте позже.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Сервер запущен на порту ${PORT}
📡 WebSocket готов для live стримов
🌍 Режим: ${process.env.NODE_ENV || 'development'}
🇷🇺 Адаптировано для российского рынка
`);

  if (process.env.CODESPACES === 'true') {
    console.log(`
📱 Для подключения Expo Go:
1. Откройте Expo DevTools: https://${process.env.CODESPACE_NAME}-8081.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
2. Отсканируйте QR-код с приложением Expo Go
3. API доступен по: https://${process.env.CODESPACE_NAME}-5000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
`);
  } else {
    console.log(`
📱 Для подключения Expo Go:
1. Запустите: cd mobile && expo start
2. Отсканируйте QR-код с приложением Expo Go
3. API доступен по: http://localhost:${PORT}
`);
  }
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('Получен SIGTERM, завершение работы...');
  httpServer.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Получен SIGINT, завершение работы...');
  httpServer.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

module.exports = { app, io };
