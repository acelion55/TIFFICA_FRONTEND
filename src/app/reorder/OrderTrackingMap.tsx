'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrderTrackingMapProps {
  customerLocation: [number, number];
  kitchenLocation: [number, number];
  destinationLocation: [number, number];
}

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export default function OrderTrackingMap({ 
  customerLocation, 
  kitchenLocation, 
  destinationLocation 
}: OrderTrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch route from OSRM
  const fetchRoute = async (from: [number, number], to: [number, number]) => {
    try {
      // OSRM expects coordinates as lng,lat
      const coords = `${from[1]},${from[0]};${to[1]},${to[0]}`;
      const response = await fetch(`${OSRM_URL}/${coords}?geometries=geojson&overview=full`);
      
      if (!response.ok) throw new Error('OSRM route fetch failed');
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates as [number, number][];
      }
    } catch (error) {
      console.warn('Error fetching OSRM route:', error);
    }
    
    // Fallback to straight line if OSRM fails
    return [from, to];
  };

  useEffect(() => {
    // Wait for DOM to be fully ready
    const timer = setTimeout(() => {
      if (!containerRef.current || mapRef.current || isInitialized) return;

      try {
        // Initialize map with proper options
        mapRef.current = L.map(containerRef.current, {
          attributionControl: false,
          zoomControl: false,
          preferCanvas: true,
        }).setView(customerLocation, 13);

        // Add tile layer without text and railways
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19,
        }).addTo(mapRef.current);

        // Custom icons
        const createIcon = (color: string, icon: string) =>
          L.divIcon({
            html: `<div style="width:40px;height:40px;border-radius:50%;background-color:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${icon}</div>`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
          });

        // Add markers
        const markers: L.Marker[] = [];
        
        const kitchenMarker = L.marker(kitchenLocation, {
          icon: createIcon('#F59E0B', '🍳'),
        })
          .addTo(mapRef.current)
          .bindPopup('<b>Kitchen</b>');
        markers.push(kitchenMarker);

        const customerMarker = L.marker(customerLocation, {
          icon: createIcon('#4F46E5', '👤'),
        })
          .addTo(mapRef.current)
          .bindPopup('<b>Your Location</b>');
        markers.push(customerMarker);

        const deliveryMarker = L.marker(destinationLocation, {
          icon: createIcon('#10B981', '📍'),
        })
          .addTo(mapRef.current)
          .bindPopup('<b>Delivery</b>');
        markers.push(deliveryMarker);

        // Fetch and draw routes from kitchen to customer
        (async () => {
          const routeCoords = await fetchRoute(kitchenLocation, customerLocation);
          
          // Convert to Leaflet format [lat, lng]
          const leafletRoute = routeCoords.map(coord => [coord[1], coord[0]] as [number, number]);
          
          L.polyline(leafletRoute, {
            color: '#FF6B35',
            weight: 3,
            opacity: 0.8,
          }).addTo(mapRef.current!);

          // Fit bounds after route is drawn
          if (mapRef.current) {
            try {
              const group = new L.FeatureGroup(markers);
              mapRef.current.fitBounds(group.getBounds().pad(0.15), { animate: false, maxZoom: 14 });
            } catch (e) {
              console.warn('Fit bounds error:', e);
            }
          }
        })();

        setIsInitialized(true);
        
      } catch (error) {
        console.error('Map error:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isInitialized, customerLocation, kitchenLocation, destinationLocation]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        minHeight: '224px',
      }}
      className="bg-gray-100 rounded-t-3xl"
    />
  );
}
