'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useNotifications } from '@/context/NotificationContext';
import { ArrowLeft, Search, X, Star, Clock, Leaf, SlidersHorizontal, Loader2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

const MEAL_FILTERS  = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CAT_FILTERS   = ['All', 'Veg', 'Egg', 'Vegan'];

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  mealType?: string;
  rating?: number;
  isAvailable?: boolean;
  cloudKitchen?: { name: string };
}

const RECENT_KEY = 'tiffica_recent_searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(q: string) {
  const prev = getRecent().filter(r => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 8)));
}

export default function SearchPage() {
  const { token } = useAuth();
  const { locationSet = false } = useLocation();
  const { unreadCount } = useNotifications();
  const router    = useRouter();
  const inputRef  = useRef<HTMLInputElement>(null);

  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<MenuItem[]>([]);
  const [allItems, setAllItems]   = useState<MenuItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [mealFilter, setMealFilter] = useState('All');
  const [catFilter, setCatFilter]   = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [recent, setRecent]       = useState<string[]>([]);
  const [searched, setSearched]   = useState(false);

  useEffect(() => {
    setRecent(getRecent());
    inputRef.current?.focus();
    // Pre-load menu items based on location
    const apiUrl = locationSet ? `${API_URL}/menu/by-location` : `${API_URL}/menu`;
    fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setAllItems(d.items || []))
      .catch(() => {});
  }, [token, locationSet]);

  // Live search with debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const searchUrl = locationSet 
          ? `${API_URL}/menu/search/${encodeURIComponent(query.trim())}/by-location`
          : `${API_URL}/menu/search/${encodeURIComponent(query.trim())}`;
        const res = await fetch(searchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await res.json();
          setResults(d.menuItems || []);
        }
      } catch {}
      setLoading(false);
      setSearched(true);
    }, 350);
    return () => clearTimeout(t);
  }, [query, token, locationSet]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) saveRecent(q.trim());
  };

  const clearQuery = () => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); };

  // Apply filters to results
  const filtered = (query ? results : allItems).filter(item => {
    const matchMeal = mealFilter === 'All' || item.mealType === mealFilter;
    const matchCat  = catFilter  === 'All' || item.category === catFilter;
    return matchMeal && matchCat;
  });

  const activeFilterCount = (mealFilter !== 'All' ? 1 : 0) + (catFilter !== 'All' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-24">

      {/* ── Search Header ── */}
      <div className="bg-white px-4 pt-14 pb-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search dishes, ingredients…"
              className="flex-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-400"
            />
            {loading && <Loader2 className="w-4 h-4 text-orange-400 animate-spin flex-shrink-0" />}
            {query && !loading && (
              <button onClick={clearQuery} className="flex-shrink-0">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <button onClick={() => router.push('/notifications')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 relative active:scale-95">
            <Bell className="w-4 h-4 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button onClick={() => setShowFilters(v => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative active:scale-95 ${showFilters ? 'bg-orange-500' : 'bg-gray-100'}`}>
            <SlidersHorizontal className={`w-4 h-4 ${showFilters ? 'text-white' : 'text-gray-600'}`} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter pills */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {MEAL_FILTERS.map(f => (
                    <button key={f} onClick={() => setMealFilter(f)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        mealFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>{f}</button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {CAT_FILTERS.map(f => (
                    <button key={f} onClick={() => setCatFilter(f)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        catFilter === f
                          ? f === 'Veg' ? 'bg-green-500 text-white'
                          : 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{f}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 pt-4">

        {/* ── No query: show recent + popular ── */}
        {!query && (
          <>
            {recent.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-gray-900">Recent Searches</h3>
                  <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                    className="text-xs text-gray-400 font-semibold">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map(r => (
                    <button key={r} onClick={() => handleSearch(r)}
                      className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-700 font-medium shadow-sm active:scale-95 transition">
                      <Search className="w-3 h-3 text-gray-400" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular / all items */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-3">
                {activeFilterCount > 0 ? 'Filtered Menu' : 'All Menu Items'}
                <span className="text-gray-400 font-medium ml-2">({filtered.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {filtered.slice(0, 20).map(item => <MenuCard key={item._id} item={item} />)}
              </div>
            </div>
          </>
        )}

        {/* ── Searching ── */}
        {query && loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Searching for "{query}"…</p>
          </div>
        )}

        {/* ── Results ── */}
        {query && !loading && filtered.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 font-medium mb-3">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for <span className="font-bold text-gray-900">"{query}"</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {filtered.map(item => <MenuCard key={item._id} item={item} />)}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── No results ── */}
        {query && !loading && searched && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-black text-gray-800 mb-2">No results found</h3>
            <p className="text-sm text-gray-400">Try a different keyword or remove filters</p>
            {activeFilterCount > 0 && (
              <button onClick={() => { setMealFilter('All'); setCatFilter('All'); }}
                className="mt-4 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="bg-white rounded-3xl p-3 shadow-sm border border-gray-50 active:scale-95 transition"
    >
      <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
        <img src={item.image || FALLBACK} className="w-full h-full object-cover" alt={item.name} />
        {item.rating && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star size={9} className="fill-orange-400 text-orange-400" />
            <span className="text-[10px] font-black text-gray-900">{item.rating}</span>
          </div>
        )}
      </div>
      <div className="px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.mealType || item.category}</span>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={9} /><span className="text-[9px] font-bold">25 min</span>
          </div>
        </div>
        <h3 className="text-sm font-black text-gray-900 line-clamp-1 mb-2">{item.name}</h3>
        {item.cloudKitchen?.name && (
          <p className="text-[10px] text-orange-400 font-semibold truncate mb-2">🏠 {item.cloudKitchen.name}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-gray-900">₹{item.price}</span>
          <motion.button whileTap={{ scale: 0.9 }}
            className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm shadow-orange-200">
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
