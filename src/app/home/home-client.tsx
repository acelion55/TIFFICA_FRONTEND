'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, MapPin, Flame, Wallet, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  mealType?: string;
  isVeg?: boolean;
  cloudKitchen?: { _id: string; name: string };
}

const CATS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function HomeClient() {
  const { user, token } = useAuth();
  const { location, kitchens, setShowModal, locationSet } = useLocation();
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [todaySpecial, setTodaySpecial] = useState<MenuItem[]>([]);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMenu = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const h: Record<string, string> = { 'Authorization': `Bearer ${token}` };
    try {
      // If location set → use by-location endpoint; else fall back to all menu
      const menuUrl = locationSet
        ? `${API_URL}/menu/by-location`
        : `${API_URL}/menu`;

      const [menuRes, specialRes] = await Promise.all([
        fetch(menuUrl, { headers: h }),
        fetch(`${API_URL}/menu/today-special`, { headers: h }),
      ]);

      if (menuRes.ok) {
        const d = await menuRes.json();
        setItems(d.items || d.menuItems || []);
      }
      if (specialRes.ok) {
        const d = await specialRes.json();
        setTodaySpecial(d.items || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, locationSet]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const filtered = items.filter(item => {
    const matchCat = cat === 'All' || item.mealType === cat || item.category === cat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const img = (item: MenuItem) => item.image?.trim() ? item.image : FALLBACK;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 pt-10 pb-16 px-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative z-10">
          {/* Location bar */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-xl px-3 py-1.5 mb-4 hover:bg-white/30 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold truncate max-w-[200px]">
              {location?.locationName || 'Set your location'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          <h1 className="text-2xl font-extrabold text-white leading-tight">
            {user?.name ? `Hey ${user.name.split(' ')[0]}! 👋` : 'What are you craving?'}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {locationSet
              ? `${kitchens.length} cloud kitchen${kitchens.length !== 1 ? 's' : ''} near you`
              : 'Set location to see nearby kitchens'}
          </p>
        </div>

        {/* Wallet chip */}
        {user?.walletBalance !== undefined && (
          <div className="absolute top-10 right-5 bg-white/20 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-200" />
            <div>
              <p className="text-white/70 text-xs">Wallet</p>
              <p className="text-white font-bold text-sm">₹{user.walletBalance?.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mx-5 -mt-6 relative z-20 mb-5">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg px-4 py-3 border border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search meals…"
            className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
          />
          <SlidersHorizontal className="w-5 h-5 text-gray-300" />
        </div>
      </div>

      <div className="px-5">
        {/* Set location prompt */}
        {!locationSet && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3.5 mb-6 hover:bg-orange-100 transition"
          >
            <MapPin className="w-5 h-5 text-orange-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-orange-700">Set your delivery location</p>
              <p className="text-xs text-orange-500">See restaurant menus available near you</p>
            </div>
            <span className="ml-auto text-orange-500 text-sm font-bold">Set →</span>
          </button>
        )}

        {/* Today's Special */}
        {todaySpecial.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-extrabold text-gray-900">Today's Special</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {todaySpecial.map(item => (
                <div key={item._id} className="flex-shrink-0 w-44 bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="relative h-28">
                    <img src={img(item)} alt={item.name} className="w-full h-full object-cover" />
                    {item.isVeg !== undefined && (
                      <span className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isVeg ? '🌿' : '🍖'}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                    <p className="text-orange-500 font-extrabold text-sm mt-1.5">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Browse Menu</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  cat === c
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}>{c}
              </button>
            ))}
          </div>
        </section>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="font-bold text-gray-600">
              {locationSet ? 'No items found nearby' : 'Set location to browse the menu'}
            </p>
            <p className="text-sm mt-1">
              {locationSet
                ? 'Try a different category or broaden your search'
                : 'We\'ll show menus from kitchens within 5km of you'}
            </p>
            {!locationSet && (
              <button onClick={() => setShowModal(true)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow">
                Set Location
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(item => (
              <div key={item._id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative h-32 overflow-hidden">
                  <img src={img(item)} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {item.isVeg !== undefined && (
                    <span className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.isVeg ? '🌿' : '🍖'}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{item.name}</h3>
                  {item.cloudKitchen && (
                    <p className="text-xs text-orange-400 font-medium mt-0.5 truncate">🏠 {item.cloudKitchen.name}</p>
                  )}
                  <p className="text-xs text-gray-400 capitalize">{item.mealType || item.category || ''}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500 font-extrabold text-sm">₹{item.price}</span>
                    <button className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-lg hover:bg-orange-100 transition">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
