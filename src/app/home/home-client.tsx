'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Flame,
  SlidersHorizontal, Plus, Star, Clock, Leaf,
  Sunrise, Sun, Sunset, Moon, MapPin, Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { openRazorpay } from '@/hooks/useRazorpay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
const FALLBACK_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-being-prepared-for-a-salad-40432-large.mp4';
const CATEGORIES = [
  { id: 'All',       label: 'All',        emoji: '🍽️' },
  { id: 'Under79',   label: 'Under ₹79',  emoji: '💸' },
  { id: 'Under99',   label: 'Under ₹99',  emoji: '🏷️' },
  { id: 'Breakfast', label: 'Breakfast',  emoji: '☕' },
  { id: 'Lunch',     label: 'Lunch',      emoji: '🍛' },
  { id: 'Dinner',    label: 'Dinner',     emoji: '🌙' },
  { id: 'Snack',     label: 'Snack',      emoji: '🥪' },
];

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  category?: string;
  mealType?: string;
  isVeg?: boolean;
  rating?: number;
}

// ── Time-based greeting ──────────────────────────────────
function getGreeting(name?: string) {
  const h = new Date().getHours();
  let Icon = Sunrise;
  let greeting = 'Good Morning';
  let color = 'text-amber-300';
  if (h >= 12 && h < 17) { Icon = Sun;    greeting = 'Good Afternoon'; color = 'text-yellow-300'; }
  else if (h >= 17 && h < 21) { Icon = Sunset; greeting = 'Good Evening';   color = 'text-orange-300'; }
  else if (h >= 21 || h < 5)  { Icon = Moon;   greeting = 'Good Night';     color = 'text-blue-300'; }
  return { Icon, greeting, color, firstName: name?.split(' ')[0] || '' };
}

export default function HomeClient() {
  const { user, token } = useAuth();
  const { location, kitchens, locationSet } = useLocation();
  const { unreadCount } = useNotifications();

  const router = useRouter();
  const [items, setItems]             = useState<MenuItem[]>([]);
  const [todaySpecial, setTodaySpecial] = useState<MenuItem[]>([]);
  const [activeCat, setActiveCat]     = useState('All');
  const [loading, setLoading]         = useState(true);
  const [videoUrl, setVideoUrl]       = useState(FALLBACK_VIDEO);
  const [greeting, setGreeting]       = useState(() => getGreeting());

  // Update greeting every minute
  useEffect(() => {
    setGreeting(getGreeting(user?.name));
    const t = setInterval(() => setGreeting(getGreeting(user?.name)), 60000);
    return () => clearInterval(t);
  }, [user?.name]);

  // Fetch video from DB (homestyles)
  useEffect(() => {
    fetch(`${API_URL}/homestyles`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const links: string[] = d?.data?.videoLinks || [];
        if (links.length > 0) setVideoUrl(links[0]);
      })
      .catch(() => {});
  }, []);

  // Fetch menu
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const menuUrl    = locationSet ? `${API_URL}/menu/by-location` : `${API_URL}/menu`;
      const specialUrl  = locationSet ? `${API_URL}/menu/today-special/by-location` : `${API_URL}/menu/today-special`;
      const [menuRes, specialRes] = await Promise.all([
        fetch(menuUrl,   { headers }),
        fetch(specialUrl, { headers }),
      ]);
      if (menuRes.ok)    { const d = await menuRes.json();    setItems(d.items || d.menuItems || []); }
      if (specialRes.ok) { const d = await specialRes.json(); setTodaySpecial(d.items || []); }
    } catch {}
    finally { setLoading(false); }
  }, [token, locationSet]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = useMemo(() => {
    if (activeCat === 'All') return items;
    if (activeCat === 'Under79') return items.filter(i => i.price < 79);
    if (activeCat === 'Under99') return items.filter(i => i.price < 99);
    return items.filter(item => item.mealType === activeCat || item.category === activeCat);
  }, [items, activeCat]);

  return (
    <div className="bg-[#F8F9FB] min-h-screen pb-24 font-sans antialiased">

      {/* ── HERO ── */}
      <header className="relative w-full overflow-hidden rounded-b-[40px] shadow-2xl" style={{ height: '42vh' }}>

        {/* Video background */}
        <video
          key={videoUrl}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50" />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 pt-14 pb-6">

          {/* Greeting */}
          <div>
            <motion.div
              key={greeting.greeting}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <greeting.Icon size={28} className={`${greeting.color} drop-shadow-lg shrink-0`} strokeWidth={1.8} />
                <p className="text-white/80 text-base font-bold tracking-wide">
                  {greeting.greeting}{greeting.firstName ? `, ${greeting.firstName}!` : '!'}
                </p>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                What&apos;s cooking today? 
              </h1>
              {locationSet && (
                <div className="flex items-center gap-1 mt-2">
                  <MapPin size={12} className="text-orange-300" />
                  <p className="text-white/60 text-xs font-medium">
                    {kitchens.length} kitchen{kitchens.length !== 1 ? 's' : ''} near you
                  </p>
                </div>
              )}
            </motion.div>

            {/* Search bar — tap to go to search page */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => router.push('/search')}
                className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl active:scale-95 transition"
              >
                <Search className="text-gray-400 flex-shrink-0" size={18} />
                <span className="flex-1 text-left text-sm font-medium text-gray-400">Search homemade dishes...</span>
                <SlidersHorizontal className="text-orange-500 shrink-0" size={18} />
              </button>
              
              <button
                onClick={() => router.push('/notifications')}
                className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center relative active:scale-95 transition"
              >
                <Bell className="text-gray-700" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── CATEGORY BAR — sticky below top bar ── */}
      <nav className="sticky top-[52px] z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 ${
                activeCat === c.id
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="px-5 mt-5 space-y-8">

        {/* ── TODAY'S SPECIALS ── */}
        {todaySpecial.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-100 p-1.5 rounded-xl">
                <Flame size={18} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Today's Hot Deals</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {todaySpecial.map(item => <SpecialCard key={item._id} item={item} />)}
            </div>
          </section>
        )}

        {/* ── MENU GRID ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">Cooked Near You</h2>
            <button className="text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-xl">View All</button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-60 bg-gray-200 rounded-3xl animate-pulse" />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredItems.map(item => <MenuCard key={item._id} item={item} token={token} user={user} />)}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState locationSet={locationSet} />
          )}
        </section>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function SpecialCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image });
  };

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="flex-shrink-0 w-56 bg-white rounded-3xl p-3 shadow-sm border border-gray-100"
    >
      <div className="relative h-36 w-full overflow-hidden rounded-2xl mb-3">
        <img src={item.image || FALLBACK_IMG} className="w-full h-full object-cover" alt={item.name} />
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
          <Star size={10} className="fill-orange-500 text-orange-500" />
          <span className="text-[10px] font-black text-gray-900">{item.rating || '4.9'}</span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-base font-black text-orange-600">₹{item.price}</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
          )}
        </div>
        <button 
          onClick={handleAdd} 
          className="bg-gray-900 text-white p-2 rounded-xl hover:bg-gray-800 transition active:scale-90"
        >
          <Plus size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function MenuCard({ item, token, user }: { item: MenuItem; token: string | null; user: any }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (!token) return;
    addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="bg-white rounded-3xl p-3 shadow-sm border border-gray-50"
    >
      <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
        <img src={item.image || FALLBACK_IMG} className="w-full h-full object-cover" alt={item.name} />
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1 text-[9px] font-black uppercase tracking-wide
          ${item.isVeg ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
          {item.isVeg ? <Leaf size={9} className="fill-current" /> : null}
          {item.isVeg ? 'Veg' : 'Non-Veg'}
        </div>
      </div>
      <div className="px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.category || 'Meal'}</span>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={9} />
            <span className="text-[9px] font-bold">25 min</span>
          </div>
        </div>
        <h3 className="text-sm font-black text-gray-900 line-clamp-1 mb-3">{item.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-black text-gray-900">₹{item.price}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl shadow-md shadow-orange-200 font-black text-xs hover:bg-orange-600 transition"
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ locationSet }: { locationSet: boolean }) {
  const { setShowModal } = useLocation();
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
      <div className="text-5xl mb-4 opacity-40">🍱</div>
      <h3 className="text-lg font-black text-gray-800 mb-2">
        {locationSet ? 'Nothing on the stove yet' : 'Where should we deliver?'}
      </h3>
      <p className="text-gray-400 text-sm max-w-[200px] mx-auto mb-6 leading-relaxed">
        {locationSet ? 'Try a different category.' : 'Set your location to find kitchens near you.'}
      </p>
      {!locationSet && (
        <button onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black shadow-lg">
          Set Location
        </button>
      )}
    </div>
  );
}
