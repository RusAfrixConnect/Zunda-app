-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    avatar VARCHAR(500),
    bio TEXT,
    zunda_coins INTEGER DEFAULT 100,
    total_earned INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица подарков
CREATE TABLE gifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    coin_cost INTEGER NOT NULL,
    animation_url VARCHAR(500),
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица транзакций (покупка коинов)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'coin_purchase', 'withdrawal', 'gift_sent'
    amount INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'canceled'
    payment_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица отправки подарков
CREATE TABLE gift_transactions (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    gift_id INTEGER REFERENCES gifts(id),
    live_id INTEGER, -- ссылка на live стрим (если есть)
    coins_value INTEGER NOT NULL,
    commission INTEGER NOT NULL, -- комиссия платформы
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица выводов средств
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    bank_details JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    rejection_reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица статистики создателей
CREATE TABLE creator_stats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    total_earned INTEGER DEFAULT 0,
    total_gifts INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица историй (Stories)
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    media_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(20), -- 'image', 'video'
    duration INTEGER, -- в секундах для видео
    views_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица просмотров историй
CREATE TABLE story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id),
    viewer_id INTEGER REFERENCES users(id),
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- Таблица live стримов
CREATE TABLE live_streams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200),
    description TEXT,
    stream_key VARCHAR(100) UNIQUE NOT NULL,
    is_live BOOLEAN DEFAULT false,
    viewers_count INTEGER DEFAULT 0,
    gifts_total INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_gift_transactions_sender ON gift_transactions(sender_id);
CREATE INDEX idx_gift_transactions_receiver ON gift_transactions(receiver_id);
CREATE INDEX idx_gift_transactions_created ON gift_transactions(created_at);
CREATE INDEX idx_stories_expires ON stories(expires_at);
CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_live_streams_user ON live_streams(user_id);
CREATE INDEX idx_live_streams_is_live ON live_streams(is_live);

-- Вставляем базовые подарки
INSERT INTO gifts (name, display_name, coin_cost, description, category) VALUES
('heart', 'Сердечко ❤️', 10, 'Простое сердечко', 'common'),
('kiss', 'Поцелуй 😘', 25, 'Воздушный поцелуй', 'common'),
('star', 'Звезда ⭐', 50, 'Сияющая звезда', 'common'),
('rocket', 'Ракета 🚀', 100, 'Быстрая ракета', 'rare'),
('crown', 'Корона 👑', 500, 'Королевская корона', 'epic'),
('fire', 'Огонь 🔥', 1000, 'Горячий огонь', 'legendary'),
('zunda', 'Zunda Token 🪙', 5000, 'Эксклюзивный токен Zunda', 'exclusive');

-- Создаем триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
