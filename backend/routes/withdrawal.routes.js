const express = require('express');
const router = express.Router();
const { User } = require('../database/models');
const authenticate = require('../middleware/auth');

// Запрос на вывод средств
router.post('/request', authenticate, async (req, res) => {
  try {
    const { amount, bank_details } = req.body;
    const userId = req.user.userId;

    // Проверяем минимальную сумму (500 рублей)
    const MIN_WITHDRAWAL = 500;
    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        error: 'Минимальная сумма',
        message: `Минимальная сумма для вывода: ${MIN_WITHDRAWAL} рублей`
      });
    }

    // Проверяем баланс пользователя (1 коин = 1 рубль)
    const user = await User.findById(userId);
    if (user.zunda_coins < amount) {
      return res.status(400).json({
        error: 'Недостаточно средств',
        message: 'На вашем счете недостаточно средств для вывода'
      });
    }

    // Проверяем реквизиты банка
    if (!bank_details || !bank_details.bank_name || !bank_details.account_number) {
      return res.status(400).json({
        error: 'Неверные реквизиты',
        message: 'Пожалуйста, укажите корректные банковские реквизиты'
      });
    }

    // Резервируем средства (обновляем баланс)
    await User.updateCoins(userId, -amount);

    // Создаем запрос на вывод
    const withdrawalQuery = `
      INSERT INTO withdrawals 
      (user_id, amount, bank_details, status, created_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      RETURNING *
    `;
    
    const result = await pool.query(withdrawalQuery, [
      userId, 
      amount, 
      JSON.stringify(bank_details)
    ]);

    // TODO: Интегрировать с API банка для автоматического перевода
    // Пока отправляем уведомление администратору

    res.json({
      success: true,
      message: 'Запрос на вывод средств принят',
      data: {
        withdrawal_id: result.rows[0].id,
        amount,
        estimated_time: '24-48 часов',
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Ошибка запроса вывода:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось обработать запрос на вывод средств'
    });
  }
});

// Получить историю выводов
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT * FROM withdrawals 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        amount: row.amount,
        status: row.status,
        bank_details: row.bank_details,
        created_at: row.created_at,
        processed_at: row.processed_at
      }))
    });
  } catch (error) {
    console.error('Ошибка получения истории выводов:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить историю выводов'
    });
  }
});

// Получить информацию о выводе по ID
router.get('/:withdrawalId', authenticate, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const userId = req.user.userId;

    const query = `
      SELECT * FROM withdrawals 
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [withdrawalId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Вывод не найден',
        message: 'Запрос на вывод средств не найден'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка получения вывода:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить информацию о выводе'
    });
  }
});

module.exports = router;
