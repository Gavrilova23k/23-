'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useAuth } from './providers/AuthProvider';

interface CityCardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  population: number;
  climate: string;
}

export function CityCard({ id, name, description, image, population, climate }: CityCardProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: isFavorite } = trpc.favorites.isFavorite.useQuery(
    { cityId: id },
    { enabled: !!user }
  );
  
  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.isFavorite.invalidate({ cityId: id });
      utils.favorites.getMyFavorites.invalidate();
    },
  });
  
  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.isFavorite.invalidate({ cityId: id });
      utils.favorites.getMyFavorites.invalidate();
    },
  });

  const handleFavoriteToggle = () => {
    if (!user) {
      alert('Войдите в систему, чтобы добавить город в избранное');
      return;
    }
    
    if (isFavorite) {
      removeFavorite.mutate({ cityId: id });
    } else {
      addFavorite.mutate({ cityId: id });
    }
  };

  return (
    <div className="city-card">
      <div className="city-card-image">
        <Image src={image} alt={name} width={300} height={200} />
      </div>
      <div className="city-card-content">
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="city-stats">
          <span>👥 {population.toLocaleString()}</span>
          <span>🌡️ {climate}</span>
        </div>
        <div className="city-card-actions">
          <Link href={`/city/${encodeURIComponent(name)}`} className="details-btn">
            Подробнее
          </Link>
          <button 
            onClick={handleFavoriteToggle}
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
}