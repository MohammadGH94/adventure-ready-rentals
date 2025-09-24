import { useState, useEffect } from 'react';

interface FavoritesState {
  [gearId: string]: boolean;
}

const FAVORITES_STORAGE_KEY = 'gear-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritesState>({});

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  const toggleFavorite = (gearId: string) => {
    setFavorites(prev => ({
      ...prev,
      [gearId]: !prev[gearId]
    }));
  };

  const isFavorited = (gearId: string) => {
    return !!favorites[gearId];
  };

  const getFavoriteIds = () => {
    return Object.keys(favorites).filter(id => favorites[id]);
  };

  return {
    toggleFavorite,
    isFavorited,
    getFavoriteIds,
  };
};