'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();

  // Если пользователь уже вошел, перенаправляем на главную
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError('Введите имя');
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Пароль должен быть не менее 8 символов');
          setIsLoading(false);
          return;
        }
        await signUp(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка аутентификации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container-modern">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🌍</div>
            <h1>Туризм по России</h1>
            <p>Откройте для себя удивительные города России</p>
          </div>
          <div className="auth-features">
            <div className="feature">
              <span>🏙️</span>
              <span>9+ крупных городов</span>
            </div>
            <div className="feature">
              <span>🌡️</span>
              <span>Точный прогноз погоды</span>
            </div>
            <div className="feature">
              <span>⭐</span>
              <span>Избранные места</span>
            </div>
            <div className="feature">
              <span>💬</span>
              <span>Отзывы путешественников</span>
            </div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-card-modern">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Вход
              </button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Регистрация
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group-modern">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="input-group-modern">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group-modern">
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {!isLogin && (
                  <small className="password-hint">Минимум 8 символов</small>
                )}
              </div>
              
              {error && <div className="auth-error">{error}</div>}
              
              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}