'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useHistory } from '@/hooks/useHistory';
import { useState, useEffect } from 'react';
import { useAuth } from './providers/AuthProvider';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  color: string;
}

export function SmartNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { goBack, getPreviousPage } = useHistory();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Закрываем панель при изменении маршрута
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    { label: 'Все города', icon: '🏙️', href: '/', color: '#667eea' },
    { label: 'Избранное', icon: '❤️', href: '/favorites', color: '#f5576c' },
    { label: 'Отзывы', icon: '💬', href: '/feedback', color: '#f1c40f' },
  ];

  const profileItem = { 
    label: user ? (user.name || 'Профиль') : 'Войти', 
    icon: user ? '👤' : '🔑', 
    href: '/profile', 
    color: '#2ecc71' 
  };

  const getPreviousPageName = () => {
    const previousPage = getPreviousPage();
    if (!previousPage) return null;
    if (previousPage === '/') return 'Все города';
    if (previousPage.startsWith('/city/')) return 'Город';
    if (previousPage === '/favorites') return 'Избранное';
    if (previousPage === '/feedback') return 'Отзывы';
    if (previousPage === '/profile') return 'Профиль';
    if (previousPage.startsWith('/citydetails/')) return 'Детали';
    if (previousPage.startsWith('/calendar/')) return 'Календарь';
    return 'Назад';
  };

  const previousPageName = getPreviousPageName();
  const previousPage = getPreviousPage();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Кнопка гамбургера */}
      <button 
        className={`hamburger-btn ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
        aria-label="Меню"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Затемнение */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Боковая панель */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🌍</span>
            <span className="logo-text">Туризм России</span>
          </div>
          <button className="sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>

        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => {
                router.push(item.href);
                closeSidebar();
              }}
              style={{ '--hover-color': item.color } as React.CSSProperties}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className={`sidebar-link profile-link ${pathname === '/profile' ? 'active' : ''}`}
            onClick={() => {
              router.push('/profile');
              closeSidebar();
            }}
            style={{ '--hover-color': profileItem.color } as React.CSSProperties}
          >
            <span className="sidebar-icon">{profileItem.icon}</span>
            <span className="sidebar-label">{profileItem.label}</span>
            {user && <span className="online-dot"></span>}
          </button>
        </div>
      </aside>

      {/* Место для кнопки "Назад" */}
      <div className="back-button-placeholder">
        {previousPage && pathname !== '/' && (
          <button className="back-button-inside" onClick={goBack}>
            <span className="back-arrow">←</span>
            <span className="back-text">{previousPageName}</span>
          </button>
        )}
      </div>
    </>
  );
}