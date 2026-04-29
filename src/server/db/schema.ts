import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Таблица пользователей (добавляем поле password)
export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'), // Добавляем поле для пароля
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),
});

// Таблица сессий
export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),
});

// Города
export const cities = sqliteTable('cities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  population: integer('population').notNull(),
  climate: text('climate').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
});

// Избранное
export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cityId: integer('cityId').notNull().references(() => cities.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt').notNull(),
}, (table) => ({
  userCityUnique: uniqueIndex('user_city_unique').on(table.userId, table.cityId),
}));

// Отзывы
export const feedbacks = sqliteTable('feedbacks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cityId: integer('cityId').notNull().references(() => cities.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  rating: integer('rating').default(5),
  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),
});

export type User = typeof users.$inferSelect;
export type City = typeof cities.$inferSelect;