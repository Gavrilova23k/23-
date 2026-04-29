'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

const cities = [
  { name: 'Москва', description: 'Столица России. 🚀', image: '/Москва.webp' },
  { name: 'Санкт-Петербург', description: 'Культурная столица. 🎭', image: '/Питер.jpg' },
  { name: 'Новосибирск', description: 'Третий по населению город России. 🏙', image: '/Новосиб.webp' },
  { name: 'Екатеринбург', description: 'Город на границе Европы и Азии. 🌍', image: '/Екатеринбург.jpg' },
  { name: 'Нижний Новгород', description: 'Исторический и культурный центр. 📖', image: '/Нижний.webp' },
  { name: 'Казань', description: 'Город с уникальным культурным наследием. 🕌', image: '/Казань.jpg' },
  { name: 'Челябинск', description: 'Известен своей металлообработкой. ⚙️', image: '/Челябинск.jpg' },
  { name: 'Омск', description: 'Крупный культурный центр Сибири. 🎨', image: '/Омск.jpg' },
  { name: 'Ростов-на-Дону', description: 'Южная столица России. 🌞', image: '/Ростов.jpg' },
];

interface CityPageProps {
  cityName: string;
}

const CityPage: React.FC<CityPageProps> = ({ cityName }) => {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const decodedCityName = decodeURIComponent(cityName);
  const city = cities.find(city => city.name === decodedCityName);

  if (!city) {
    return (
      <div className="city-page">
        <h1>Город не найден</h1>
        <p>Город "{decodedCityName}" не найден в списке.</p>
        <button className="action-button" onClick={() => router.push('/')}>На главную</button>
      </div>
    );
  }

  return (
    <div className="city-page">
      <h1 style={{ color: 'black' }}>{city.name}</h1>
      <img src={city.image} alt={city.name} className="city-image" />
      <p>{city.description}</p>
      <div className="button-group">
        <button 
          className={`action-button ${isFavorite(city.name) ? 'favorite' : ''}`}
          onClick={() => toggleFavorite(city.name)}
        >
          {isFavorite(city.name) ? '★ В избранном' : '☆ Добавить в избранное'}
        </button>
        <button className="action-button" onClick={() => router.push(`/citydetails/${encodeURIComponent(city.name)}`)}>Далее</button>
        <button className="action-button secondary" onClick={() => router.push('/')}>Назад</button>
      </div>
    </div>
  );
};

export default CityPage;