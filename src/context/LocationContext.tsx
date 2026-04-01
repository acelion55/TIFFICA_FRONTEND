'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  previousLocation: Location | null;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);
export const useLocation = () => useContext(LocationContext);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [previousLocation, setPreviousLocation] = useState<Location | null>(null);
  const [kitchens, setKitchens] = useState<NearbyKitchen[]>([]);
  const [showModal, setShowModal] = useState(false);
  const askedRef = useRef(false); // only ask once per session

  // Load saved location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed);
        setPreviousLocation(parsed); // remember it as "previous"
      } catch {}
    }
  }, []);

  // Always ask on login/app open — once per session (skip for admin and kitchen-owner)
  useEffect(() => {
    if (token && user && !askedRef.current) {
      // Skip location modal for admin and kitchen-owner
      if (user.role === 'admin' || user.role === 'kitchen-owner') {
        askedRef.current = true;
        return;
      }
      
      askedRef.current = true;
      const t = setTimeout(() => setShowModal(true), 600);
      return () => clearTimeout(t);
    }
    // Reset when user logs out
    if (!token) {
      askedRef.current = false;
    }
  }, [token, user]);

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
    setPreviousLocation(loc);
    localStorage.setItem('userLocation', JSON.stringify(loc));
    setShowModal(false);
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
      previousLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
}
