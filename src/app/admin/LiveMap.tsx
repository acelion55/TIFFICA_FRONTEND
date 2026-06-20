'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, ShieldCheck, Loader2, MapPin, Navigation, Ruler } from 'lucide-react';

// Fix for default Leaflet icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Click Handler Component
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LiveMapProps {
  mapCenter: [number, number];
  routes: any[];
  kitchensWithLocation: any[];
  customersWithLocation: any[];
  deliveryPartnersWithLocation: any[];
  orders: any[];
}

const LiveMap: React.FC<LiveMapProps> = ({
  mapCenter,
  routes,
  kitchensWithLocation,
  customersWithLocation,
  deliveryPartnersWithLocation,
  orders
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [clickedPos, setClickedPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Memoize icons
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return {
      kitchen: L.divIcon({
        html: `<div class="bg-indigo-600 p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
        className: 'custom-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      customer: L.divIcon({
        html: `<div class="bg-orange-500 p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
        className: 'custom-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      delivery: L.divIcon({
        html: `<div class="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
        className: 'custom-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      click: L.divIcon({
        html: `<div class="bg-slate-900 p-1.5 rounded-full border-2 border-white shadow-xl animate-bounce"><svg viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="3" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
        className: 'custom-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })
    };
  }, []);

  // Use Leaflet's native Circle for precise ground distance (meters)
  // Leaflet handles projection distortion, Turf polygons do not automatically account for it in Leaflet render
  const kitchensWithService = useMemo(() => {
    return kitchensWithLocation.map(k => {
      const rawValue = k.deliveryRadius || 5;
      // If 5km diameter is the goal (2.5km radius)
      // We use meters for Leaflet's native Circle
      const radiusInMeters = (rawValue === 10 || rawValue === 5) ? 2500 : (rawValue * 1000 / 2);
      
      return { 
        ...k, 
        serviceRadius: radiusInMeters,
        displayDiameter: (radiusInMeters * 2) / 1000
      };
    });
  }, [kitchensWithLocation]);

  if (!isMounted || !icons) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-slate-50/50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting Map Matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ClickHandler onMapClick={(lat, lng) => setClickedPos([lat, lng])} />

        {clickedPos && (
          <Marker position={clickedPos} icon={icons.click}>
            <Popup onClose={() => setClickedPos(null)}>
              <div className="p-2 min-w-[140px]">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Coordinates</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">LAT</span>
                    <span className="text-indigo-600 font-mono">{clickedPos[0].toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">LNG</span>
                    <span className="text-indigo-600 font-mono">{clickedPos[1].toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {kitchensWithService.map(k => (
          <Circle 
            key={`${k._id}-circle`}
            center={[k.location.coordinates[1], k.location.coordinates[0]]}
            radius={k.serviceRadius}
            pathOptions={{
              color: '#4f46e5',
              fillColor: '#4f46e5',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '5, 8'
            }}
          />
        ))}

        {routes.map(route => (
          <Polyline 
            key={route.id} 
            positions={route.coordinates} 
            color="#4f46e5" 
            weight={3} 
            opacity={0.6} 
            dashArray="1, 8"
          />
        ))}

        {kitchensWithService.map((k: any) => {
          const lat = k.location.coordinates[1];
          const lng = k.location.coordinates[0];
          
          return (
            <Marker 
              key={k._id} 
              position={[lat, lng]}
              icon={icons.kitchen}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Kitchen Analytics</p>
                  </div>
                  <p className="font-extrabold text-slate-900 text-xs mb-1">{k.name}</p>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1"><Navigation className="w-2 h-2" /> Latitude</span>
                      <span className="text-slate-900 font-mono">{lat.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1"><Navigation className="w-2 h-2" /> Longitude</span>
                      <span className="text-slate-900 font-mono">{lng.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold pt-1 border-t border-slate-50 mt-1">
                      <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1"><Ruler className="w-2 h-2" /> Service Area</span>
                      <span className="text-indigo-600 font-black">{k.displayDiameter}km (Ground Dia)</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {customersWithLocation.map((u: any) => (
          <Marker 
            key={u._id} 
            position={[u.currentLocation.latitude, u.currentLocation.longitude]}
            icon={icons.customer}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-slate-900 text-[10px]">{u.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {deliveryPartnersWithLocation.map((u: any) => (
          <Marker 
            key={u._id} 
            position={[u.currentLocation.latitude, u.currentLocation.longitude]}
            icon={icons.delivery}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-slate-900 text-[10px]">{u.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
