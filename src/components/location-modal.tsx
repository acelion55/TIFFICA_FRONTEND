'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, X, Search, Home, Briefcase, Hotel, MoreHorizontal, ChevronRight, Plus } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse?format=json';
const NOMINATIM_SEARCH  = 'https://nominatim.openstreetmap.org/search?format=json&limit=5';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TYPE_ICONS: Record<string, any> = {
  Home, Work: Briefcase, Hotel, Other: MoreHorizontal,
};

export default function LocationModal() {
  const { showModal, setShowModal, saveLocation, location, locationSet, previousLocation } = useLocation();
  const { token } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses]     = useState<any[]>([]);
  const [detecting, setDetecting]     = useState(false);
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching]     = useState(false);
  const [error, setError]             = useState('');
  const [tab, setTab]                 = useState<'saved' | 'search'>('saved');

  // Load saved addresses
  useEffect(() => {
    if (!token || !showModal) return;
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setAddresses(d.addresses || []))
      .catch(() => {});
  }, [token, showModal]);

  if (!showModal) return null;

  // Select a saved address as delivery location
  const handleSelectAddress = async (addr: any) => {
    const coords = addr.location?.coordinates; // [lng, lat]
    if (coords?.length === 2) {
      await saveLocation(coords[1], coords[0], addr.fullAddress || addr.area || addr.addressType);
    } else {
      // No coords saved — use address name as location name, try geocoding
      const name = addr.fullAddress || [addr.houseNo, addr.area].filter(Boolean).join(', ');
      try {
        const r = await fetch(`${NOMINATIM_SEARCH}&q=${encodeURIComponent(name)}`);
        const d = await r.json();
        if (d[0]) {
          await saveLocation(parseFloat(d[0].lat), parseFloat(d[0].lon), name);
          return;
        }
      } catch {}
      // fallback: save with 0,0 coords but correct name
      await saveLocation(0, 0, name);
    }
  };

  // Detect GPS location
  const handleDetect = () => {
    setError('');
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        let name = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const r = await fetch(`${NOMINATIM_REVERSE}&lat=${latitude}&lon=${longitude}`);
          const d = await r.json();
          name = d.display_name?.split(',').slice(0, 3).join(',') || name;
        } catch {}
        await saveLocation(latitude, longitude, name);
        setDetecting(false);
      },
      () => { setDetecting(false); setError('Could not detect location.'); },
      { timeout: 10000 }
    );
  };

  // Search location
  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const r = await fetch(`${NOMINATIM_SEARCH}&q=${encodeURIComponent(q)}`);
      setSuggestions(await r.json());
    } catch {}
    setSearching(false);
  };

  const handleSelectSuggestion = async (s: any) => {
    await saveLocation(
      parseFloat(s.lat), parseFloat(s.lon),
      s.display_name.split(',').slice(0, 3).join(',')
    );
    setSuggestions([]);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-4 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">📍 Delivery Location</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {previousLocation ? 'Confirm or change your delivery location' : 'Choose where to deliver'}
            </p>
          </div>
          {locationSet && (
            <button onClick={() => setShowModal(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Previous location quick-confirm */}
        {previousLocation && (
          <div className="mx-5 mb-3 flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Previous location</p>
            <button
              onClick={() => saveLocation(previousLocation.latitude, previousLocation.longitude, previousLocation.locationName)}
              className="w-full flex items-center gap-3 p-3.5 bg-orange-50 border-2 border-orange-400 rounded-2xl text-left active:scale-95 transition"
            >
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-gray-900 truncate">{previousLocation.locationName.split(',')[0]}</p>
                <p className="text-xs text-gray-500 truncate">{previousLocation.locationName.split(',').slice(1, 3).join(',')}</p>
              </div>
              <span className="text-xs font-black text-orange-500 flex-shrink-0">USE ✓</span>
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex mx-5 bg-gray-100 rounded-2xl p-1 mb-3 flex-shrink-0">
          <button onClick={() => setTab('saved')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${tab === 'saved' ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}>
            Saved Addresses
          </button>
          <button onClick={() => setTab('search')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${tab === 'search' ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}>
            Search Location
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">

          {error && (
            <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>
          )}

          {/* ── SAVED ADDRESSES TAB ── */}
          {tab === 'saved' && (
            <div className="space-y-2">

              {/* Use current GPS */}
              <button onClick={handleDetect} disabled={detecting}
                className="w-full flex items-center gap-3 p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-md active:scale-95 transition disabled:opacity-70 mb-3">
                {detecting
                  ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  : <Navigation className="w-5 h-5 flex-shrink-0" />}
                <span className="text-sm">{detecting ? 'Detecting…' : 'Use current location'}</span>
              </button>

              {/* Saved address list */}
              {addresses.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Your addresses</p>
                  {addresses.map((addr: any, i: number) => {
                    const Icon = TYPE_ICONS[addr.addressType] || MapPin;
                    const isActive = location?.locationName?.includes(addr.area) ||
                      location?.locationName?.includes(addr.houseNo);
                    return (
                      <button key={i} onClick={() => handleSelectAddress(addr)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition active:scale-95 ${
                          isActive
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-extrabold text-gray-900">{addr.addressType}</p>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {addr.fullAddress || [addr.houseNo, addr.landmark, addr.area].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-6">
                  <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No saved addresses yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add addresses in your profile</p>
                </div>
              )}

              {/* Add new address */}
              <button
                onClick={() => { setShowModal(false); router.push('/addresses'); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 transition active:scale-95 mt-2">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">Add new address</span>
              </button>
            </div>
          )}

          {/* ── SEARCH TAB ── */}
          {tab === 'search' && (
            <div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-3">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search area, colony, city…"
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
                />
                {searching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              </div>

              {suggestions.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b border-gray-50 last:border-0 active:scale-95">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{s.display_name.split(',')[0]}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{s.display_name.split(',').slice(1, 3).join(',')}</p>
                    </button>
                  ))}
                </div>
              )}

              {query.length > 0 && suggestions.length === 0 && !searching && (
                <p className="text-center text-sm text-gray-400 py-6">No results found</p>
              )}

              {query.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">Type at least 3 characters to search</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
