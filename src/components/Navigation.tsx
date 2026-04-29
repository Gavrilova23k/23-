'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButtons } from './AuthButtons';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';

export function Navigation() {
  const pathname = usePathname();
  const { goBack, getPreviousPath } = useNavigationHistory();

  const links = [
    { href: '/', label: '🏠 Главная' },
    { href: '/favorites', label: '❤️ Избранное' },
    { href: '/feedback', label: '💬 Отзывы' },
    { href: '/profile', label: '👤 Профиль' },
  ];

  // Показываем кнопку "Назад" только если есть история и это не главная страница
  const showBackButton = pathname !== '/' && getPreviousPath() !== null;

  return (
    <nav className="navigation">
      <div className="nav-left">
        {showBackButton && (
          <button onClick={goBack} className="nav-back-btn" title="Назад">
            ← Назад
          </button>
        )}
      </div>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <AuthButtons />
    </nav>
  );
}