'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Простая система истории
let historyStack: string[] = [];
let isInitialized = false;

export function useHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const isFirstRender = useRef(true);

  // Добавляем страницу в историю при переходе
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!isInitialized) {
        historyStack = [pathname];
        isInitialized = true;
      }
      return;
    }

    // Добавляем новую страницу, если она не последняя
    if (historyStack[historyStack.length - 1] !== pathname) {
      historyStack.push(pathname);
      // Ограничиваем историю 20 страницами
      if (historyStack.length > 20) {
        historyStack.shift();
      }
    }
  }, [pathname]);

  // Функция для перехода на предыдущую страницу
  const goBack = () => {
    if (historyStack.length > 1) {
      // Убираем текущую страницу
      historyStack.pop();
      // Получаем предыдущую
      const previousPage = historyStack[historyStack.length - 1];
      router.push(previousPage);
    } else {
      // Если нет истории, идем на главную
      router.push('/');
    }
  };

  // Функция для получения предыдущей страницы
  const getPreviousPage = (): string | null => {
    if (historyStack.length > 1) {
      return historyStack[historyStack.length - 2];
    }
    return null;
  };

  // Функция для очистки истории
  const clearHistory = () => {
    historyStack = [pathname];
  };

  return { goBack, getPreviousPage, clearHistory, historyStack };
}