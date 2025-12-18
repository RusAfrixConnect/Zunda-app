const express = require('express');
const router = express.Router();
const { User } = require('../database/models');
const authenticate = require('../middleware/auth');

// Récupérer le profil utilisateur
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден',
        message: 'Пользователь не существует'
      });
    }
    
    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить профиль'
    });
  }
});

// Mettre à jour le profil
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const userId = req.user.userId;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    
    const query = `
      UPDATE users 
      SET ${Object.keys(updateData).map((key, index) => `${key} = $${index + 1}`).join(', ')},
          updated_at = NOW()
      WHERE id = $${Object.keys(updateData).length + 1}
      RETURNING id, phone, name, avatar, bio, zunda_coins, created_at
    `;
    
    const values = [...Object.values(updateData), userId];
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'Профиль обновлен',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось обновить профиль'
    });
  }
});

// Rechercher des utilisateurs
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        error: 'Неверный запрос',
        message: 'Введите хотя бы 2 символа для поиска'
      });
    }
    
    const searchQuery = `
      SELECT id, name, avatar, bio 
      FROM users 
      WHERE name ILIKE $1 OR phone ILIKE $1
      LIMIT $2
    `;
    
    const result = await pool.query(searchQuery, [`%${query}%`, parseInt(limit)]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось выполнить поиск'
    });
  }
});

module.exports = router;
