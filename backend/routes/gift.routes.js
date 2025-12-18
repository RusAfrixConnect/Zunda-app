const express = require('express');
const router = express.Router();
const { Gift, User } = require('../database/models');
const authenticate = require('../middleware/auth');

// Получить все доступные подарки
router.get('/gifts', async (req, res) => {
  try {
    const gifts = await Gift.getAll();
    
    res.json({
      success: true,
      data: gifts.map(gift => ({
        id: gift.id,
        name: gift.name,
        display_name: gift.display_name,
        coin_cost: gift.coin_cost,
        animation_url: gift.animation_url,
        description: gift.description,
        category: gift.category
      }))
    });
  } catch (error) {
    console.error('Ошибка получения подарков:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить подарки'
    });
  }
});

// Отправить подарок
router.post('/send', authenticate, async (req, res) => {
  try {
    const { receiver_id, gift_id, live_id } = req.body;
    const sender_id = req.user.userId;

    // Проверяем, существует ли получатель
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        error: 'Получатель не найден',
        message: 'Пользователь, которому вы хотите отправить подарок, не существует'
      });
    }

    // Получаем информацию о подарке
    const gift = await Gift.findById(gift_id);
    if (!gift) {
      return res.status(404).json({
        error: 'Подарок не найден',
        message: 'Выбранный подарок недоступен'
      });
    }

    // Проверяем баланс отправителя
    const sender = await User.findById(sender_id);
    if (sender.zunda_coins < gift.coin_cost) {
      return res.status(400).json({
        error: 'Недостаточно коинов',
        message: 'У вас недостаточно Zunda Coins для отправки этого подарка'
      });
    }

    // Рассчитываем комиссию (30% платформе, 70% создателю)
    const creatorEarnings = Math.floor(gift.coin_cost * 0.7);
    const platformCommission = gift.coin_cost - creatorEarnings;

    // Выполняем транзакцию
    await pool.query('BEGIN');

    try {
      // Списание у отправителя
      await User.updateCoins(sender_id, -gift.coin_cost);
      
      // Зачисление создателю
      await User.updateCoins(receiver_id, creatorEarnings);
      
      // Запись в историю подарков
      const giftTransactionQuery = `
        INSERT INTO gift_transactions 
        (sender_id, receiver_id, gift_id, live_id, coins_value, commission, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;
      await pool.query(giftTransactionQuery, [
        sender_id, receiver_id, gift_id, live_id, 
        gift.coin_cost, platformCommission
      ]);

      // Обновляем статистику создателя
      const statsQuery = `
        INSERT INTO creator_stats (user_id, total_earned, total_gifts)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          total_earned = creator_stats.total_earned + $2,
          total_gifts = creator_stats.total_gifts + 1,
          updated_at = NOW()
      `;
      await pool.query(statsQuery, [receiver_id, creatorEarnings]);

      await pool.query('COMMIT');

      // Отправляем уведомление через WebSocket
      if (live_id) {
        req.io.to(`live_${live_id}`).emit('gift_sent', {
          sender: {
            id: sender_id,
            name: sender.name,
            avatar: sender.avatar
          },
          gift: {
            id: gift.id,
            name: gift.display_name,
            animation_url: gift.animation_url
          },
          value: gift.coin_cost,
          timestamp: new Date().toISOString()
        });
      }

      // Отправляем push-уведомление получателю
      // TODO: Реализовать FCM

      res.json({
        success: true,
        message: 'Подарок успешно отправлен!',
        data: {
          gift: gift.display_name,
          cost: gift.coin_cost,
          new_balance: sender.zunda_coins - gift.coin_cost
        }
      });

    } catch (transactionError) {
      await pool.query('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Ошибка отправки подарка:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось отправить подарок. Пожалуйста, попробуйте позже.'
    });
  }
});

// Получить историю отправленных подарков
router.get('/history/sent', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        gt.*,
        g.name as gift_name,
        g.display_name as gift_display_name,
        u.name as receiver_name,
        u.avatar as receiver_avatar
      FROM gift_transactions gt
      JOIN gifts g ON gt.gift_id = g.id
      JOIN users u ON gt.receiver_id = u.id
      WHERE gt.sender_id = $1
      ORDER BY gt.created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, parseInt(limit)]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить историю подарков'
    });
  }
});

// Получить историю полученных подарков
router.get('/history/received', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        gt.*,
        g.name as gift_name,
        g.display_name as gift_display_name,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM gift_transactions gt
      JOIN gifts g ON gt.gift_id = g.id
      JOIN users u ON gt.sender_id = u.id
      WHERE gt.receiver_id = $1
      ORDER BY gt.created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, parseInt(limit)]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить историю подарков'
    });
  }
});

module.exports = router;
