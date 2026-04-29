'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showWelcome, setShowWelcome] = useState(false);

  const publicRoutes = ['/auth'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        router.replace('/auth');
      } else if (user && pathname === '/auth') {
        router.replace('/');
      } else if (user && !showWelcome && pathname === '/') {
        const hasSeenWelcome = sessionStorage.getItem('welcome_shown');
        if (!hasSeenWelcome) {
          setShowWelcome(true);
          sessionStorage.setItem('welcome_shown', 'true');
          setTimeout(() => setShowWelcome(false), 3000);
        }
      }
    }
  }, [user, loading, pathname, isPublicRoute, router, showWelcome]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован и это не публичный маршрут - не показываем ничего
  if (!user && !isPublicRoute) {
    return null;
  }

  return (
    <>
      {showWelcome && user && (
        <div className="welcome-popup">
          <div className="welcome-content">
            <span className="welcome-emoji">🎉</span>
            <h3>Добро пожаловать, {user.name}!</h3>
            <p>Рады видеть вас снова!</p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}