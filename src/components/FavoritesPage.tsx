'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';

const FavoritesContent: React.FC = () => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="city-page">
      <h1>Мои избранные города</h1>
      
      {favorites.length === 0 ? (
        <p>Вы пока не добавили ни одного города в избранное</p>
      ) : (
        <div className="city-grid">
          {favorites.map(cityName => (
            <div key={cityName} className="city-item">
              <h2>{cityName}</h2>
              <div className="button-group">
                <button 
                  className="action-button" 
                  onClick={() => router.push(`/city/${encodeURIComponent(cityName)}`)}
                >
                  Подробнее
                </button>
                <button 
                  className={`action-button ${isFavorite(cityName) ? 'favorite' : ''}`}
                  onClick={() => toggleFavorite(cityName)}
                >
                  {isFavorite(cityName) ? '★ Удалить' : '☆ Добавить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button className="action-button secondary" onClick={handleBack}>Назад</button>
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="city-page">Загрузка...</div>}>
      <FavoritesContent />
    </Suspense>
  );
};

export default FavoritesPage;