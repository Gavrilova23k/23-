'use client';

import { useAuth } from './providers/AuthProvider';
import { useRouter } from 'next/navigation';

export function AuthButtons() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <div className="auth-buttons">
        <span className="user-name" onClick={() => router.push('/profile')}>
          👤 {user.name}
        </span>
        <button onClick={() => signOut()} className="logout-btn">
          🚪 Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="auth-buttons">
      <button onClick={() => router.push('/auth')} className="login-btn">
        🔑 Войти
      </button>
    </div>
  );
}