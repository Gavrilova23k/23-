import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, sessions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Функция хеширования пароля
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Функция проверки пароля
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Функция для получения текущего timestamp в секундах
const now = () => Math.floor(Date.now() / 1000);

// POST /api/auth - регистрация и вход
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Auth request:', body.type);
    
    const { type, email, password, name } = body;

    // РЕГИСТРАЦИЯ
    if (type === 'signup') {
      const existing = await db.select().from(users).where(eq(users.email, email));
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
      }

      const userId = crypto.randomUUID();
      const currentTime = now();
      const hashedPassword = hashPassword(password);
      
      await db.insert(users).values({
        id: userId,
        name: name || email.split('@')[0],
        email: email,
        password: hashedPassword,
        emailVerified: false,
        image: null,
        createdAt: currentTime,
        updatedAt: currentTime,
      });

      const token = crypto.randomUUID();
      await db.insert(sessions).values({
        id: crypto.randomUUID(),
        userId: userId,
        token: token,
        expiresAt: currentTime + 30 * 24 * 60 * 60, // 30 дней
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        createdAt: currentTime,
        updatedAt: currentTime,
      });

      const response = NextResponse.json({ 
        success: true, 
        user: { id: userId, name: name || email.split('@')[0], email: email } 
      });
      
      // Устанавливаем куки с правильными параметрами
      response.cookies.set('session-token', token, {
        httpOnly: true,
        secure: false, // Для локальной разработки ставим false
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 дней
        path: '/',
      });

      return response;
    }

    // ВХОД
    if (type === 'signin') {
      const user = await db.select().from(users).where(eq(users.email, email));
      
      if (user.length === 0) {
        return NextResponse.json({ error: 'Пользователь не найден' }, { status: 400 });
      }

      // Проверяем пароль
      if (!verifyPassword(password, user[0].password || '')) {
        return NextResponse.json({ error: 'Неверный пароль' }, { status: 400 });
      }

      // Удаляем старые сессии
      await db.delete(sessions).where(eq(sessions.userId, user[0].id));

      // Создаем новую сессию
      const token = crypto.randomUUID();
      const currentTime = now();
      
      await db.insert(sessions).values({
        id: crypto.randomUUID(),
        userId: user[0].id,
        token: token,
        expiresAt: currentTime + 30 * 24 * 60 * 60, // 30 дней
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        createdAt: currentTime,
        updatedAt: currentTime,
      });

      const response = NextResponse.json({ 
        success: true, 
        user: { id: user[0].id, name: user[0].name, email: user[0].email } 
      });
      
      // Устанавливаем куки
      response.cookies.set('session-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Неверный тип запроса' }, { status: 400 });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// GET /api/auth - получение текущей сессии
export async function GET(request: NextRequest) {
  try {
    // Получаем токен из куки
    const token = request.cookies.get('session-token')?.value;
    
    console.log('GET /api/auth - Token found:', !!token);
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Ищем сессию в базе данных
    const session = await db.select().from(sessions).where(eq(sessions.token, token));
    
    if (session.length === 0) {
      console.log('Session not found in DB');
      return NextResponse.json({ user: null });
    }

    const currentTime = now();
    if (session[0].expiresAt < currentTime) {
      console.log('Session expired');
      await db.delete(sessions).where(eq(sessions.token, token));
      return NextResponse.json({ user: null });
    }

    // Получаем пользователя
    const user = await db.select().from(users).where(eq(users.id, session[0].userId));
    
    if (user.length === 0) {
      return NextResponse.json({ user: null });
    }

    // Не возвращаем пароль
    const { password, ...userWithoutPassword } = user[0];
    console.log('User found:', userWithoutPassword.email);
    
    return NextResponse.json({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}

// DELETE /api/auth - выход
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value;
    
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('session-token');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Ошибка выхода' }, { status: 500 });
  }
}