'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useNavigationHistory, getHomeFilters } from '@/hooks/useNavigationHistory';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/components/providers/AuthProvider';
import '@/styles/App1.css';

export default function FavoritesPage() {
  const router = useRouter();
  const { goBack } = useNavigationHistory();
  const { user } = useAuth();
  
  const { data: favorites, refetch } = trpc.favorites.getMyFavorites.useQuery(undefined, {
    enabled: !!user,
  });
  
  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => refetch(),
  });

  if (!user) {
    return (
      <div className="city-page">
        <h1>⭐ Мои избранные города</h1>
        <p>Войдите в систему, чтобы увидеть избранные города</p>
        <button onClick={() => router.push('/auth')} className="action-button">
          Войти
        </button>
      </div>
    );
  }

  // Функция для возврата на главную
  const handleBackToHome = () => {
    // Просто переходим на главную, фильтры восстановятся из sessionStorage
    router.push('/');
  };

  return (
    <div className="city-page">
      <h1>⭐ Мои избранные города</h1>
      
      {!favorites || favorites.length === 0 ? (
        <p>Вы пока не добавили ни одного города в избранное</p>
      ) : (
        <div className="city-grid">
          {favorites.map((item) => (
            <div key={item.id} className="city-item">
              <Image 
                src={item.image} 
                alt={item.name} 
                width={200} 
                height={150} 
                className="city-image"
                unoptimized
              />
              <h2>{item.name}</h2>
              <p>👥 {item.population.toLocaleString()}</p>
              <p>🌡️ {item.climate}</p>
              <div className="button-group">
                <button 
                  className="action-button"
                  onClick={() => router.push(`/city/${encodeURIComponent(item.name)}`)}
                >
                  Подробнее
                </button>
                <button 
                  className="action-button favorite"
                  onClick={() => removeFavorite.mutate({ cityId: item.cityId })}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}