-- Создание таблиц
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  password TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  city_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  UNIQUE(user_id, city_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  city_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_city_id ON favorites(city_id);
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_city_id ON feedbacks(city_id);
CREATE INDEX idx_cities_name ON cities(name);

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