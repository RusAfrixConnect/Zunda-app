const express = require('express');
const router = express.Router();
const yooKassa = require('yookassa');
const { User, Transaction } = require('../database/models');

const yoo = yooKassa({
  shopId: process.env.YOO_SHOP_ID,
  secretKey: process.env.YOO_SECRET_KEY
});

// Мидлварь для проверки авторизации
const authenticate = require('../middleware/auth');

// Получить доступные пакеты коинов
router.get('/packages', (req, res) => {
  const packages = [
    { id: 'mini', rub: 99, coins: 100, description: 'Начальный пакет', popular: false },
    { id: 'basic', rub: 299, coins: 320, description: 'Базовый пакет (+20 бонус)', popular: false },
    { id: 'standard', rub: 599, coins: 700, description: 'Стандартный пакет (+100 бонус)', popular: true },
    { id: 'premium', rub: 1199, coins: 1500, description: 'Премиум пакет (+300 бонус)', popular: false },
    { id: 'vip', rub: 2999, coins: 4000, description: 'VIP пакет (+1000 бонус)', popular: false }
  ];
  
  res.json({
    success: true,
    data: packages
  });
});

// Создать платеж для покупки коинов
router.post('/create-payment', authenticate, async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.userId;

    // Находим пакет
    const packages = {
      'mini': { rub: 99, coins: 100 },
      'basic': { rub: 299, coins: 320 },
      'standard': { rub: 599, coins: 700 },
      'premium': { rub: 1199, coins: 1500 },
      'vip': { rub: 2999, coins: 4000 }
    };

    const selectedPackage = packages[packageId];
    if (!selectedPackage) {
      return res.status(400).json({
        error: 'Неверный пакет',
        message: 'Выбранный пакет не существует'
      });
    }

    // Создаем платеж в ЮKassa
    const payment = await yoo.createPayment({
      amount: {
        value: selectedPackage.rub.toFixed(2),
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'bank_card'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.FRONTEND_URL}/payment/success`
      },
      description: `Покупка ${selectedPackage.coins} Zunda Coins`,
      metadata: {
        userId,
        packageId,
        coins: selectedPackage.coins,
        type: 'coin_purchase'
      }
    });

    // Сохраняем транзакцию в БД
    await Transaction.create({
      user_id: userId,
      type: 'coin_purchase',
      amount: selectedPackage.coins,
      status: 'pending',
      payment_id: payment.id
    });

    res.json({
      success: true,
      message: 'Платеж создан',
      data: {
        paymentId: payment.id,
        confirmationUrl: payment.confirmation.confirmation_url,
        amount: selectedPackage.rub,
        coins: selectedPackage.coins
      }
    });

  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({
      error: 'Ошибка платежа',
      message: 'Не удалось создать платеж. Пожалуйста, попробуйте позже.'
    });
  }
});

// Вебхук от ЮKassa
router.post('/yookassa-webhook', async (req, res) => {
  try {
    const { event, object } = req.body;

    if (event === 'payment.succeeded') {
      const { userId, coins } = object.metadata;

      // Находим транзакцию
      const transaction = await Transaction.updateStatus(object.id, 'completed');
      
      if (transaction) {
        // Зачисляем коины пользователю
        await User.updateCoins(userId, parseInt(coins));

        // Отправляем push-уведомление
        // TODO: Интегрировать с FCM/APNS
        
        console.log(`Зачислено ${coins} коинов пользователю ${userId}`);
      }
    } else if (event === 'payment.canceled') {
      await Transaction.updateStatus(object.id, 'canceled');
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Ошибка вебхука:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Получить историю транзакций
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT * FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось получить историю транзакций'
    });
  }
});

module.exports = router;
