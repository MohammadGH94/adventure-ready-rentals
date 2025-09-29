import { useState, useEffect, useCallback, useRef } from 'react';
import { reverseGeocode } from '@/lib/geocoding';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coordinates: Coordinates | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    address: null,
    loading: false,
    error: null,
  });

  // Debouncing ref to prevent rapid successive calls
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isGettingLocation = useRef(false);

  const getCurrentLocation = useCallback(() => {
    // Prevent multiple simultaneous location requests
    if (isGettingLocation.current) {
      console.log('Location request already in progress');
      return;
    }

    // Clear any existing debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Debounce the location request to prevent rapid clicks
    debounceTimeout.current = setTimeout(() => {
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Geolocation is not supported by this browser.',
        }));
        return;
      }

      isGettingLocation.current = true;
      setState(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            // Get the address from coordinates
            const address = await reverseGeocode(coordinates.latitude, coordinates.longitude);

            setState({
              coordinates,
              address,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error('Error processing location:', error);
            setState(prev => ({
              ...prev,
              loading: false,
              error: 'Failed to process location data',
            }));
          } finally {
            isGettingLocation.current = false;
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Location access denied';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = error.message || 'Unknown location error';
              break;
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          isGettingLocation.current = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 300000, // 5 minutes cache
        }
      );
    }, 300); // 300ms debounce delay
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    ...state,
    getCurrentLocation,
  };
};