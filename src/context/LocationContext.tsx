'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Location {
  latitude: number;
  longitude: number;
  locationName: string;
}

interface NearbyKitchen {
  _id: string;
  name: string;
  distance: number;
}

interface LocationContextType {
  location: Location | null;
  kitchens: NearbyKitchen[];
  locationSet: boolean;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  saveLocation: (lat: number, lng: number, name: string) => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);
export const useLocation = () => useContext(LocationContext);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [kitchens, setKitchens] = useState<NearbyKitchen[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try { setLocation(JSON.parse(saved)); } catch {}
    }
  }, []);

  // After auth, show modal if location not yet set
  useEffect(() => {
    if (token && user && !location) {
      // small delay so the home page renders first
      const t = setTimeout(() => setShowModal(true), 800);
      return () => clearTimeout(t);
    }
  }, [token, user, location]);

  // Whenever location changes, fetch nearby kitchens
  useEffect(() => {
    if (!location || !token) return;
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/cloudkitchens/nearby?latitude=${location.latitude}&longitude=${location.longitude}&maxDistance=5000`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setKitchens(data.kitchens || []);
        }
      } catch {}
    })();
  }, [location, token]);

  const saveLocation = useCallback(async (lat: number, lng: number, name: string) => {
    const loc = { latitude: lat, longitude: lng, locationName: name };
    setLocation(loc);
    localStorage.setItem('userLocation', JSON.stringify(loc));
    setShowModal(false);
    // Save to backend
    if (token) {
      await fetch(`${API_URL}/auth/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(loc),
      }).catch(() => {});
    }
  }, [token]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setKitchens([]);
    localStorage.removeItem('userLocation');
    setShowModal(true);
  }, []);

  return (
    <LocationContext.Provider value={{
      location, kitchens, locationSet: !!location,
      showModal, setShowModal, saveLocation, clearLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
}
