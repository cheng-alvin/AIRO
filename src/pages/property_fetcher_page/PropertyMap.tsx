import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons missing in Webpack builds
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  onMapClick?: (lat: number, lng: number) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ latitude, longitude, onMapClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([-33.8688, 151.2093], 13); // Default to Sydney
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker when latitude/longitude props change
  useEffect(() => {
    if (mapRef.current && latitude !== undefined && longitude !== undefined) {
      const latlng: [number, number] = [latitude, longitude];
      
      mapRef.current.setView(latlng, 15);

      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng, { draggable: true }).addTo(mapRef.current);
        
        // Listen for dragend to update coordinates when dragged
        markerRef.current.on('dragend', (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          if (onMapClick) {
             onMapClick(position.lat, position.lng);
          }
        });
      }
    }
  }, [latitude, longitude, onMapClick]);

  return <div ref={mapContainerRef} style={{ height: "300px", width: "100%", borderRadius: "8px", zIndex: 0 }} />;
};
