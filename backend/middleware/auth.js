const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Не авторизован',
        message: 'Требуется авторизация'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les infos utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Неверный токен',
        message: 'Токен авторизации недействителен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Токен истек',
        message: 'Срок действия токена истек. Пожалуйста, войдите снова.'
      });
    }
    
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Ошибка при проверке авторизации'
    });
  }
};

module.exports = authenticate;
