import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useDatabaseFavorites } from './useDatabaseFavorites';
import { useToast } from './use-toast';

interface FavoritesState {
  [gearId: string]: boolean;
}

const FAVORITES_STORAGE_KEY = 'gear-favorites';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localFavorites, setLocalFavorites] = useState<FavoritesState>({});
  
  const {
    favorites: dbFavorites,
    loading: dbLoading,
    addFavorite: dbAddFavorite,
    removeFavorite: dbRemoveFavorite,
    isFavorited: dbIsFavorited,
    migrateFavoritesFromLocalStorage
  } = useDatabaseFavorites();

  // Load favorites from localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          setLocalFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
      }
    }
  }, [user]);

  // Save local favorites to localStorage whenever they change (unauthenticated users)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(localFavorites));
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
    }
  }, [localFavorites, user]);

  // Migrate localStorage favorites to database when user logs in
  useEffect(() => {
    if (user && !dbLoading) {
      migrateFavoritesFromLocalStorage();
    }
  }, [user, dbLoading]);

  const toggleFavorite = async (gearId: string) => {
    if (user) {
      // Use database for authenticated users
      const isCurrentlyFavorited = dbIsFavorited(gearId);
      
      let success;
      if (isCurrentlyFavorited) {
        success = await dbRemoveFavorite(gearId);
        if (success) {
          toast({
            description: "Removed from favorites",
          });
        }
      } else {
        success = await dbAddFavorite(gearId);
        if (success) {
          toast({
            description: "Added to favorites",
          });
        }
      }
      
      if (!success) {
        toast({
          description: "Failed to update favorites",
          variant: "destructive",
        });
      }
    } else {
      // Use localStorage for unauthenticated users
      setLocalFavorites(prev => ({
        ...prev,
        [gearId]: !prev[gearId]
      }));
      
      const isNowFavorited = !localFavorites[gearId];
      toast({
        description: isNowFavorited ? "Added to favorites" : "Removed from favorites",
      });
    }
  };

  const isFavorited = (gearId: string) => {
    if (user) {
      return dbIsFavorited(gearId);
    }
    return !!localFavorites[gearId];
  };

  const getFavoriteIds = () => {
    if (user) {
      return dbFavorites;
    }
    return Object.keys(localFavorites).filter(id => localFavorites[id]);
  };

  return {
    toggleFavorite,
    isFavorited,
    getFavoriteIds,
    loading: user ? dbLoading : false,
  };
};