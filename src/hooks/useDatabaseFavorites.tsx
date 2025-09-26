import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDatabaseFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's favorites from database
  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get the user's record from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return;
      }

      // Then get their favorites
      const { data, error } = await supabase
        .from('user_favorites')
        .select('listing_id')
        .eq('user_id', userData.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      setFavorites(data?.map(fav => fav.listing_id) || []);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const addFavorite = async (listingId: string) => {
    if (!user) return false;

    try {
      // Get user's database ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) return false;

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userData.id,
          listing_id: listingId
        });

      if (error) {
        console.error('Error adding favorite:', error);
        return false;
      }

      setFavorites(prev => [...prev, listingId]);
      return true;
    } catch (error) {
      console.error('Error in addFavorite:', error);
      return false;
    }
  };

  const removeFavorite = async (listingId: string) => {
    if (!user) return false;

    try {
      // Get user's database ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) return false;

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userData.id)
        .eq('listing_id', listingId);

      if (error) {
        console.error('Error removing favorite:', error);
        return false;
      }

      setFavorites(prev => prev.filter(id => id !== listingId));
      return true;
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      return false;
    }
  };

  const isFavorited = (listingId: string) => {
    return favorites.includes(listingId);
  };

  const migrateFavoritesFromLocalStorage = async () => {
    if (!user) return;

    try {
      const localFavorites = localStorage.getItem('gear-favorites');
      if (!localFavorites) return;

      const favoritesObj = JSON.parse(localFavorites);
      const favoriteIds = Object.keys(favoritesObj).filter(id => favoritesObj[id]);

      if (favoriteIds.length === 0) return;

      // Get user's database ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) return;

      // Batch insert favorites
      const favoritesToInsert = favoriteIds.map(listingId => ({
        user_id: userData.id,
        listing_id: listingId
      }));

      const { error } = await supabase
        .from('user_favorites')
        .upsert(favoritesToInsert, {
          onConflict: 'user_id,listing_id',
          ignoreDuplicates: true
        });

      if (!error) {
        // Clear localStorage after successful migration
        localStorage.removeItem('gear-favorites');
        // Refresh favorites from database
        await fetchFavorites();
      }
    } catch (error) {
      console.error('Error migrating favorites:', error);
    }
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorited,
    migrateFavoritesFromLocalStorage,
    refetch: fetchFavorites
  };
};