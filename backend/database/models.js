const { Pool } = require('pg');
const Redis = require('redis');

// PostgreSQL подключение
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis подключение
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('Ошибка Redis:', err);
});

redisClient.connect();

// Модель пользователя
class User {
  static async create({ phone, password, name, avatar }) {
    const query = `
      INSERT INTO users (phone, password, name, avatar, zunda_coins, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, phone, name, avatar, zunda_coins, created_at
    `;
    const values = [phone, password, name, avatar, 100]; // 100 бонусных коинов при регистрации
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const result = await pool.query(query, [phone]);
    return result.rows[0];
  }

  static async findById(id) {
    // Проверяем кэш Redis
    const cacheKey = `user:${id}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows[0]) {
      // Кэшируем на 5 минут
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result.rows[0]));
    }
    
    return result.rows[0];
  }

  static async updateCoins(userId, amount) {
    const query = `
      UPDATE users 
      SET zunda_coins = zunda_coins + $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING zunda_coins
    `;
    const result = await pool.query(query, [amount, userId]);
    return result.rows[0]?.zunda_coins;
  }
}

// Модель подарков
class Gift {
  static async getAll() {
    const query = `
      SELECT * FROM gifts 
      WHERE is_active = true 
      ORDER BY coin_cost ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM gifts WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

// Модель транзакций
class Transaction {
  static async create({ user_id, type, amount, status, payment_id }) {
    const query = `
      INSERT INTO transactions (user_id, type, amount, status, payment_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [user_id, type, amount, status, payment_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(paymentId, status) {
    const query = `
      UPDATE transactions 
      SET status = $1, updated_at = NOW()
      WHERE payment_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, paymentId]);
    return result.rows[0];
  }
}

module.exports = { User, Gift, Transaction, pool, redisClient };
