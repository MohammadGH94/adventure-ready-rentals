import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ErrorBoundary from './ErrorBoundary';

interface MapViewProps {
  listings: Array<{
    id: string;
    title: string;
    location_lat: number | null;
    location_lng: number | null;
    price_per_day: number;
    photos: string[] | null;
  }>;
  onListingClick?: (listingId: string) => void;
  userLocation?: { latitude: number; longitude: number };
  className?: string;
}

export function MapView({ listings, onListingClick, userLocation, className }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

  const cleanupMap = () => {
    try {
      // Remove all markers
      markers.current.forEach(marker => {
        try {
          marker.remove();
        } catch (error) {
          console.warn('Error removing marker:', error);
        }
      });
      markers.current = [];

      // Remove map instance
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        map.current = null;
      }
    } catch (error) {
      console.error('Error during map cleanup:', error);
    }
  };

  const initializeMap = () => {
    try {
      if (!mapContainer.current || !mapboxToken) {
        setMapError('Map container or token not available');
        return;
      }

      // Clean up existing map before creating new one
      cleanupMap();

      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-74.5, 40],
        zoom: userLocation ? 12 : 9,
      });

      // Handle map load errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map');
      });

      map.current.on('load', () => {
        setMapError(null);
        addMarkersToMap();
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  };

  const addMarkersToMap = () => {
    try {
      if (!map.current) return;

      // Add user location marker if available
      if (userLocation) {
        const userMarker = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .setPopup(new mapboxgl.Popup().setHTML('<div>Your Location</div>'));
        
        userMarker.addTo(map.current);
        markers.current.push(userMarker);
      }

      // Add listing markers
      listings.forEach((listing) => {
        if (listing.location_lat && listing.location_lng && map.current) {
          const popup = new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${listing.title}</h3>
              <p class="text-sm text-gray-600">$${listing.price_per_day}/day</p>
              <button onclick="window.dispatchEvent(new CustomEvent('mapListingClick', {detail: '${listing.id}'}))" 
                      class="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                View Details
              </button>
            </div>
          `);

          const listingMarker = new mapboxgl.Marker({ color: '#059669' })
            .setLngLat([listing.location_lng, listing.location_lat])
            .setPopup(popup);
          
          listingMarker.addTo(map.current);
          markers.current.push(listingMarker);
        }
      });
    } catch (error) {
      console.error('Error adding markers:', error);
      setMapError('Failed to add markers to map');
    }
  };

  useEffect(() => {
    if (mapboxToken && !map.current) {
      initializeMap();
    }

    // Listen for custom events from popup buttons
    const handleMapListingClick = (event: any) => {
      if (onListingClick) {
        onListingClick(event.detail);
      }
    };

    window.addEventListener('mapListingClick', handleMapListingClick);

    return () => {
      window.removeEventListener('mapListingClick', handleMapListingClick);
      cleanupMap();
    };
  }, [mapboxToken]);

  // Separate effect for updating markers when listings change
  useEffect(() => {
    if (map.current && !mapError) {
      // Clear existing markers first
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      addMarkersToMap();
      
      // Center map on user location when it's available
      if (userLocation) {
        map.current.flyTo({
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 12,
          duration: 2000
        });
      }
    }
  }, [listings, userLocation]);


  if (mapError) {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">Map Error</p>
          <p className="text-sm text-muted-foreground">{mapError}</p>
          <button 
            onClick={() => {
              setMapError(null);
              initializeMap();
            }}
            className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className={`relative ${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">Map Unavailable</p>
          <p className="text-sm text-muted-foreground">Please refresh the page to try again</p>
        </div>
      </div>
    }>
      <div className={`relative ${className}`}>
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      </div>
    </ErrorBoundary>
  );
}