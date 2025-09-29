import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

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

  if (showTokenInput) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map View Requires Setup</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Mapbox public token to view listings on the map.
            Get your token at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={() => setShowTokenInput(false)} disabled={!mapboxToken}>
              Load Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
}