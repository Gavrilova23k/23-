// src/context/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (cityName: string) => void;
  isFavorite: (cityName: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCities');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (cityName: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(cityName)
        ? prev.filter(name => name !== cityName)
        : [...prev, cityName];
      localStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (cityName: string) => favorites.includes(cityName);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};