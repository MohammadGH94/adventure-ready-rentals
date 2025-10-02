import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ErrorBoundary from './ErrorBoundary';
import { fuzzCoordinates } from '@/lib/locationPrivacy';
import { getStorageImageUrl } from '@/lib/utils';

interface MapViewProps {
  listings: Array<{
    id: string;
    title: string;
    description?: string | null;
    location_lat: number | null;
    location_lng: number | null;
    price_per_day: number;
    photos: string[] | null;
    categories?: string[];
    min_rental_days?: number | null;
    delivery_available?: boolean | null;
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

      // Add listing markers with fuzzy coordinates for privacy
      listings.forEach((listing) => {
        if (listing.location_lat && listing.location_lng && map.current) {
          // Use fuzzy coordinates for privacy - shows approximate neighborhood location
          // Use listing ID as seed to ensure consistent fuzzing across re-renders
          const fuzzyCoords = fuzzCoordinates(listing.location_lat, listing.location_lng, listing.id);
          
          // Prepare photos
          const photos = listing.photos?.map(photo => getStorageImageUrl(photo)) || ['/placeholder.svg'];
          const photosJson = JSON.stringify(photos).replace(/"/g, '&quot;');
          
          // Prepare description
          const description = listing.description || 'No description available';
          const truncatedDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;
          
          // Prepare categories
          const categories = listing.categories?.join(', ') || 'General';
          
          const popup = new mapboxgl.Popup({ 
            maxWidth: '320px',
            className: 'map-listing-popup'
          }).setHTML(`
            <div class="p-0 w-80">
              <div class="relative">
                <div id="carousel-${listing.id}" class="relative w-full h-48 bg-gray-100">
                  <img src="${photos[0]}" alt="${listing.title}" class="w-full h-full object-cover" data-photos="${photosJson}" data-index="0" />
                  ${photos.length > 1 ? `
                    <button onclick="window.navigateCarousel('${listing.id}', -1)" 
                            class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button onclick="window.navigateCarousel('${listing.id}', 1)" 
                            class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      1 / ${photos.length}
                    </div>
                  ` : ''}
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-lg text-gray-900 flex-1">${listing.title}</h3>
                  <span class="text-lg font-bold text-emerald-600 ml-2">$${listing.price_per_day}/day</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${truncatedDesc}</p>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${categories}
                  </span>
                  ${listing.min_rental_days ? `
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Min ${listing.min_rental_days} day${listing.min_rental_days > 1 ? 's' : ''}
                    </span>
                  ` : ''}
                  ${listing.delivery_available ? `
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Delivery Available
                    </span>
                  ` : ''}
                </div>
                <p class="text-xs text-gray-500 mb-3">📍 Approximate location (for privacy)</p>
                <button onclick="window.dispatchEvent(new CustomEvent('mapListingClick', {detail: '${listing.id}'}))" 
                        class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                  View Full Details
                </button>
              </div>
            </div>
          `);

          const listingMarker = new mapboxgl.Marker({ color: '#059669' })
            .setLngLat([fuzzyCoords.longitude, fuzzyCoords.latitude])
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

    // Carousel navigation function
    (window as any).navigateCarousel = (listingId: string, direction: number) => {
      const carousel = document.getElementById(`carousel-${listingId}`);
      if (!carousel) return;
      
      const img = carousel.querySelector('img');
      if (!img) return;
      
      const photos = JSON.parse(img.getAttribute('data-photos')?.replace(/&quot;/g, '"') || '[]');
      const currentIndex = parseInt(img.getAttribute('data-index') || '0');
      const newIndex = (currentIndex + direction + photos.length) % photos.length;
      
      img.src = photos[newIndex];
      img.setAttribute('data-index', newIndex.toString());
      
      // Update counter
      const counter = carousel.querySelector('.absolute.bottom-2');
      if (counter) {
        counter.textContent = `${newIndex + 1} / ${photos.length}`;
      }
    };

    window.addEventListener('mapListingClick', handleMapListingClick);

    return () => {
      window.removeEventListener('mapListingClick', handleMapListingClick);
      delete (window as any).navigateCarousel;
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