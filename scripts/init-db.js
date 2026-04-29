const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'sqlite.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Старая база данных удалена');
}

const db = new Database(dbPath);
console.log('📁 Создана новая база данных');

const sql = `
-- Таблица пользователей (с полем password)
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Таблица сессий
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Таблица городов
CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  population INTEGER NOT NULL,
  climate TEXT NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL
);

-- Таблица избранного
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  cityId INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  UNIQUE(userId, cityId),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (cityId) REFERENCES cities(id) ON DELETE CASCADE
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  cityId INTEGER NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (cityId) REFERENCES cities(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId);
CREATE INDEX IF NOT EXISTS idx_favorites_cityId ON favorites(cityId);
CREATE INDEX IF NOT EXISTS idx_feedbacks_userId ON feedbacks(userId);
CREATE INDEX IF NOT EXISTS idx_feedbacks_cityId ON feedbacks(cityId);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Вставка городов
INSERT OR IGNORE INTO cities (name, description, image, population, climate, latitude, longitude) VALUES
('Москва', 'Столица России. 🚀', '/Москва.webp', 12655050, 'Умеренный', '55.7558', '37.6173'),
('Санкт-Петербург', 'Культурная столица. 🎭', '/Питер.jpg', 5392992, 'Умеренный', '59.9343', '30.3351'),
('Новосибирск', 'Третий по населению город России. 🏙️', '/Новосиб.webp', 1625631, 'Резко континентальный', '55.0084', '82.9357'),
('Екатеринбург', 'Город на границе Европы и Азии. 🌍', '/Екатеринбург.jpg', 1493749, 'Континентальный', '56.8389', '60.6057'),
('Нижний Новгород', 'Исторический и культурный центр. 📖', '/Нижний.webp', 1244251, 'Умеренный', '56.2965', '43.9361'),
('Казань', 'Город с уникальным культурным наследием. 🕌', '/Казань.jpg', 1257391, 'Умеренный', '55.7887', '49.1221'),
('Челябинск', 'Известен своей металлообработкой. ⚙️', '/Челябинск.jpg', 1202371, 'Континентальный', '55.1644', '61.4368'),
('Омск', 'Крупный культурный центр Сибири. 🎨', '/Омск.jpg', 1125695, 'Резко континентальный', '54.9885', '73.3242'),
('Ростов-на-Дону', 'Южная столица России. 🌞', '/Ростов.jpg', 1137704, 'Субтропический', '47.2357', '39.7015');
`;

db.exec(sql);

console.log('✅ База данных инициализирована');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Таблицы:', tables.map(t => t.name).join(', '));

const cities = db.prepare('SELECT COUNT(*) as count FROM cities').get();
console.log(`📊 В базе ${cities.count} городов`);

db.close();
console.log('🎉 Готово! Запустите npm run dev');