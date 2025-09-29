import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-74.5, 40],
      zoom: userLocation ? 12 : 9,
    });

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Your Location</div>'))
        .addTo(map.current);
    }

    // Add listing markers
    listings.forEach((listing) => {
      if (listing.location_lat && listing.location_lng) {
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

        new mapboxgl.Marker({ color: '#059669' })
          .setLngLat([listing.location_lng, listing.location_lat])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
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
      map.current?.remove();
    };
  }, [mapboxToken, listings, userLocation, onListingClick]);


  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
}