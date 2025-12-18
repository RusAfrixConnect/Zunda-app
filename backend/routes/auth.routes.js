const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
const axios = require('axios');

// Регистрация по телефону
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь существует',
        message: 'Пользователь с этим номером телефона уже зарегистрирован'
      });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await User.create({
      phone,
      password: hashedPassword,
      name
    });

    // Генерируем токен
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          zunda_coins: user.zunda_coins
        },
        token
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось зарегистрироваться. Пожалуйста, попробуйте позже.'
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Находим пользователя
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(401).json({
        error: 'Неверные данные',
        message: 'Неверный номер телефона или пароль'
      });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Неверные данные',
        message: 'Неверный номер телефона или пароль'
      });
    }

    // Генерируем токен
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          avatar: user.avatar,
          zunda_coins: user.zunda_coins
        },
        token
      }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось войти. Пожалуйста, попробуйте позже.'
    });
  }
});

// Вход через VK
router.post('/auth/vk', async (req, res) => {
  try {
    const { vk_token, vk_user_id } = req.body;

    // Валидируем токен VK
    const vkResponse = await axios.get('https://api.vk.com/method/users.get', {
      params: {
        access_token: vk_token,
        user_ids: vk_user_id,
        v: '5.131',
        fields: 'photo_200,first_name,last_name'
      }
    });

    if (!vkResponse.data.response) {
      return res.status(401).json({
        error: 'Неверный токен',
        message: 'Токен VK недействителен'
      });
    }

    const vkUser = vkResponse.data.response[0];
    
    // Ищем или создаём пользователя
    let user = await User.findByPhone(`vk_${vk_user_id}`);
    
    if (!user) {
      user = await User.create({
        phone: `vk_${vk_user_id}`,
        password: await bcrypt.hash(`vk_${vk_user_id}_${Date.now()}`, 10),
        name: `${vkUser.first_name} ${vkUser.last_name}`,
        avatar: vkUser.photo_200
      });
    }

    // Генерируем наш токен
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Вход через VK выполнен',
      data: {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          zunda_coins: user.zunda_coins
        },
        token
      }
    });

  } catch (error) {
    console.error('Ошибка VK auth:', error);
    res.status(500).json({
      error: 'Ошибка авторизации',
      message: 'Не удалось войти через VK'
    });
  }
});

// Запрос кода для сброса пароля
router.post('/password/reset-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Проверяем существование пользователя
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден',
        message: 'Пользователь с таким номером телефона не зарегистрирован'
      });
    }

    // Генерируем код (в реальном приложении отправить SMS)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохраняем код в Redis (действителен 10 минут)
    const redisKey = `reset_code:${phone}`;
    await redisClient.setEx(redisKey, 600, resetCode);

    // TODO: Интегрировать с SMS-сервисом (sms.ru, twilio)
    console.log(`Код сброса для ${phone}: ${resetCode}`);

    res.json({
      success: true,
      message: 'Код для сброса пароля отправлен на ваш телефон'
    });

  } catch (error) {
    console.error('Ошибка запроса сброса:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось отправить код'
    });
  }
});

module.exports = router;
