import { inferAsyncReturnType } from '@trpc/server';
import { db } from '../db';
import { sessions, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface CreateContextOptions {
  headers: Headers;
}

export async function createContext(opts: CreateContextOptions) {
  let user = null;
  let session = null;
  
  try {
    // Получаем cookies из заголовков
    const cookieHeader = opts.headers.get('cookie') || '';
    console.log('Cookie header:', cookieHeader);
    
    // Ищем токен сессии
    const tokenMatch = cookieHeader.match(/session-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    console.log('Token found:', !!token);
    
    if (token) {
      // Ищем сессию в базе данных
      const sessionResult = await db.select().from(sessions).where(eq(sessions.token, token));
      
      if (sessionResult.length > 0) {
        const now = Math.floor(Date.now() / 1000);
        console.log('Session expires:', sessionResult[0].expiresAt, 'Now:', now);
        
        if (sessionResult[0].expiresAt > now) {
          session = sessionResult[0];
          // Получаем пользователя
          const userResult = await db.select().from(users).where(eq(users.id, session.userId));
          if (userResult.length > 0) {
            user = userResult[0];
            console.log('User found:', user.email);
          }
        } else {
          console.log('Session expired');
          // Удаляем просроченную сессию
          await db.delete(sessions).where(eq(sessions.token, token));
        }
      } else {
        console.log('Session not found in DB');
      }
    } else {
      console.log('No token found in cookies');
    }
  } catch (error) {
    console.error('Context error:', error);
  }

  return {
    db,
    session,
    user,
    headers: opts.headers,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;