'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const HISTORY_KEY = 'navigation_history';
const FILTERS_KEY = 'home_filters';
const MAX_HISTORY = 50;

// Проверка, что мы в браузере
const isBrowser = typeof window !== 'undefined';

interface HomeFilters {
  searchTerm: string;
  populationFilter: [number, number];
  climateFilter: string[];
  sortOrder: 'asc' | 'desc';
}

function getHistory(): string[] {
  if (!isBrowser) return [];
  
  try {
    const saved = sessionStorage.getItem(HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error reading sessionStorage:', error);
  }
  return [];
}

function saveHistory(history: string[]) {
  if (!isBrowser) return;
  
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
}

// Сохранение фильтров главной страницы
export function saveHomeFilters(filters: HomeFilters) {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters:', error);
  }
}

// Получение сохраненных фильтров
export function getHomeFilters(): HomeFilters | null {
  if (!isBrowser) return null;
  try {
    const saved = sessionStorage.getItem(FILTERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error reading filters:', error);
  }
  return null;
}

export function useNavigationHistory() {
  const pathname = usePathname();
  const router = useRouter();

  // Сохраняем текущий путь в историю при изменении страницы
  useEffect(() => {
    if (!isBrowser) return;
    
    const history = getHistory();
    const lastEntry = history[history.length - 1];
    
    // Добавляем только если это новый путь (не дубликат)
    if (lastEntry !== pathname) {
      history.push(pathname);
      if (history.length > MAX_HISTORY) {
        history.shift();
      }
      saveHistory(history);
    }
  }, [pathname]);

  // Функция для перехода назад
  const goBack = () => {
    if (!isBrowser) {
      router.push('/');
      return;
    }
    
    const history = getHistory();
    const currentPath = pathname;
    
    // Находим предыдущий путь (не текущий)
    let previousPage = null;
    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i] !== currentPath) {
        previousPage = history[i];
        break;
      }
    }
    
    if (previousPage) {
      const newHistory = history.slice(0, history.indexOf(previousPage) + 1);
      saveHistory(newHistory);
      router.push(previousPage);
    } else {
      router.push('/');
    }
  };

  // Функция для перехода на главную с сохранением фильтров
  const goToHomeWithFilters = () => {
    router.push('/');
  };

  // Получение предыдущего пути
  const getPreviousPath = (): string | null => {
    if (!isBrowser) return null;
    const history = getHistory();
    const currentPath = pathname;
    
    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i] !== currentPath) {
        return history[i];
      }
    }
    return null;
  };

  return { goBack, getPreviousPath, goToHomeWithFilters };
}