'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/components/providers/AuthProvider';
import '@/styles/App1.css';

export default function CityPage() {
  const params = useParams();
  const router = useRouter();
  const { goBack } = useHistory();
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const cityName = decodeURIComponent(params.name as string);
  
  const { data: city, isLoading } = trpc.city.getByName.useQuery(cityName);
  const utils = trpc.useUtils();
  
  const { data: isFavorite } = trpc.favorites.isFavorite.useQuery(
    { cityId: city?.id || 0 },
    { enabled: !!user && !!city }
  );
  
  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.isFavorite.invalidate({ cityId: city!.id });
      utils.favorites.getMyFavorites.invalidate();
    },
  });
  
  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.isFavorite.invalidate({ cityId: city!.id });
      utils.favorites.getMyFavorites.invalidate();
    },
  });

  const handleFavoriteToggle = () => {
    if (!user) {
      alert('Войдите в систему, чтобы добавить город в избранное');
      router.push('/auth');
      return;
    }
    
    if (isFavorite && city) {
      removeFavorite.mutate({ cityId: city.id });
    } else if (city) {
      addFavorite.mutate({ cityId: city.id });
    }
  };

  const fallbackImage = `https://placehold.co/800x500/667eea/white?text=${encodeURIComponent(cityName)}`;

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!city) {
    return <h2>Город не найден</h2>;
  }

  return (
    <div className="city-page">
      <h1>{city.name}</h1>
      <Image
        src={imgError ? fallbackImage : city.image}
        alt={city.name}
        width={600}
        height={400}
        className="city-image"
        onError={() => setImgError(true)}
        unoptimized
      />
      <p>{city.description}</p>
      <p className="city-stats">
        📊 Население: {city.population.toLocaleString()} | 🌡️ Климат: {city.climate}
      </p>
      
      <div className="city-actions">
        <button 
          className={`action-button ${isFavorite ? 'favorite' : ''}`}
          onClick={handleFavoriteToggle}
        >
          {isFavorite ? '★ В избранном' : '☆ Добавить в избранное'}
        </button>
        
        <button 
          className="action-button next-btn" 
          onClick={() => router.push(`/citydetails/${encodeURIComponent(city.name)}`)}
        >
          Далее →
        </button>
      </div>
    </div>
  );
}