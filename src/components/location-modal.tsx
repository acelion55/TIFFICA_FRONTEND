'use client';
import { useState } from 'react';
import { MapPin, Navigation, Loader2, X } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse?format=json';

export default function LocationModal() {
  const { showModal, setShowModal, saveLocation } = useLocation();
  const [detecting, setDetecting] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  if (!showModal) return null;

  const handleDetect = () => {
    setError('');
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let name = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const r = await fetch(`${NOMINATIM}&lat=${latitude}&lon=${longitude}`);
          const d = await r.json();
          name = d.display_name?.split(',').slice(0, 3).join(',') || name;
        } catch {}
        await saveLocation(latitude, longitude, name);
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        setError('Could not detect location. Please search manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleSearch = async (q: string) => {
    setManualQuery(q);
    if (q.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
      const data = await r.json();
      setSuggestions(data);
    } catch {}
    setSearching(false);
  };

  const handleSelectSuggestion = async (s: any) => {
    await saveLocation(parseFloat(s.lat), parseFloat(s.lon), s.display_name.split(',').slice(0, 3).join(','));
    setSuggestions([]);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">📍 Set Your Location</h2>
            <p className="text-sm text-gray-500 mt-1">We'll show menus from cloud kitchens near you</p>
          </div>
          <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        {/* Detect current location */}
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition mb-4 disabled:opacity-70"
        >
          {detecting
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <Navigation className="w-5 h-5" />}
          <span>{detecting ? 'Detecting your location…' : 'Use my current location'}</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-semibold">OR SEARCH</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Manual search */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search your area, city, colony…"
              value={manualQuery}
              onChange={e => handleSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
            />
            {searching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 transition text-sm border-b border-gray-50 last:border-0"
                >
                  <p className="font-semibold text-gray-800 line-clamp-1">{s.display_name.split(',')[0]}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{s.display_name.split(',').slice(1, 3).join(',')}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">🔒 Your location is only used to find nearby kitchens</p>
      </div>
    </div>
  );
}
