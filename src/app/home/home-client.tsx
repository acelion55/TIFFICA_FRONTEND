'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Flame,
  SlidersHorizontal, Plus, Star, Clock,
  Sunrise, Sun, Sunset, Moon, MapPin, Bell,
  UtensilsCrossed, IndianRupee, Tag, Coffee, Sandwich, LayoutGrid, X
} from 'lucide-react';
import { Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/context/ToastContext';
import { openRazorpay } from '@/hooks/useRazorpay';
import { API_URL } from '@/config/api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
const FALLBACK_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-being-prepared-for-a-salad-40432-large.mp4';
const CATEGORIES: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'All', label: 'All', Icon: LayoutGrid },
  { id: 'Lunch', label: 'Lunch', Icon: UtensilsCrossed },
  { id: 'Dinner', label: 'Dinner', Icon: Moon },
  { id: 'Healthy', label: 'Healthy', Icon: Leaf },
  { id: 'Shahi Thali', label: 'Shahi Thali', Icon: Star },
  { id: 'Breakfast', label: 'Breakfast', Icon: Coffee },
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
  mealTypes?: string[];
  isVeg?: boolean;
  rating?: number;
  addOns?: Array<{ name: string; price: number; image?: string }>;
  deliveryTime?: string;
  tags?: string[];
}

// ── Time-based greeting ──────────────────────────────────
function getGreeting(name?: string) {
  const h = new Date().getHours();
  let Icon = Sunrise;
  let greeting = 'Good Morning';
  let color = 'text-amber-300';
  if (h >= 12 && h < 17) { Icon = Sun; greeting = 'Good Afternoon'; color = 'text-yellow-300'; }
  else if (h >= 17 && h < 21) { Icon = Sunset; greeting = 'Good Evening'; color = 'text-orange-300'; }
  else if (h >= 21 || h < 5) { Icon = Moon; greeting = 'Good Night'; color = 'text-blue-300'; }
  return { Icon, greeting, color, firstName: name?.split(' ')[0] || '' };
}

export default function HomeClient() {
  const { user, token } = useAuth();
  const { location, kitchens, locationSet } = useLocation();
  const { unreadCount } = useNotifications();

  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [todaySpecial, setTodaySpecial] = useState<MenuItem[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(FALLBACK_VIDEO);
  const [greeting, setGreeting] = useState(() => getGreeting());
  const [selectedMeal, setSelectedMeal] = useState<MenuItem | null>(null);

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
      .catch(() => { });
  }, []);

  // Fetch menu
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      // Always use location-based endpoints if location is set
      const menuUrl = locationSet ? `${API_URL}/menu/by-location` : `${API_URL}/menu`;
      const specialUrl = locationSet ? `${API_URL}/menu/today-special/by-location` : `${API_URL}/menu/today-special`;

      console.log('📍 Fetching menus...');
      console.log('Location set:', locationSet);
      console.log('Menu URL:', menuUrl);

      const [menuRes, specialRes] = await Promise.all([
        fetch(menuUrl, { headers }),
        fetch(specialUrl, { headers }),
      ]);

      if (menuRes.ok) {
        const d = await menuRes.json();
        console.log('📦 Menu response:', d);
        const menuItems = d.items || d.menuItems || [];
        console.log('📦 Menu items loaded:', menuItems.length);
        setItems(menuItems);
      } else {
        console.error('❌ Menu fetch failed:', menuRes.status, menuRes.statusText);
      }

      if (specialRes.ok) {
        const d = await specialRes.json();
        console.log('🔥 Special response:', d);
        const specialItems = d.items || [];
        console.log('🔥 Today\'s special items loaded:', specialItems.length);
        setTodaySpecial(specialItems);
      } else {
        console.error('❌ Special fetch failed:', specialRes.status, specialRes.statusText);
      }
    } catch (err) {
      console.error('❌ Error fetching menus:', err);
    }
    finally { setLoading(false); }
  }, [token, locationSet]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = useMemo(() => {
    // Only show items that have been tagged as Instant by admin
    const base = items.filter(i => (i as any).isInstant || (i.mealTypes && i.mealTypes.includes('Instant')));

    if (activeCat === 'All') return base;
    if (activeCat === 'Under79') return base.filter(i => i.price < 79);
    if (activeCat === 'Under99') return base.filter(i => i.price < 99);

    // Filter by the selected category (mealType/category/mealTypes)
    return base.filter(item =>
      item.mealType === activeCat ||
      item.category === activeCat ||
      (item.mealTypes && item.mealTypes.includes(activeCat)) ||
      ((item as any).homeCategories && (item as any).homeCategories.includes(activeCat))
    );
  }, [items, activeCat]);

  // Derive today's specials for display: prefer API result, fallback to flags in `items`
  const displayTodaySpecial = useMemo(() => {
    if (todaySpecial && todaySpecial.length > 0) return todaySpecial;
    return items.filter(i => (i as any).isTodaySpecial || (i as any).isSpecial);
  }, [todaySpecial, items]);

  // Order filtered items so today's specials (that match the filter) appear first
  const orderedItems = useMemo(() => {
    const specialIds = new Set((displayTodaySpecial || []).map((i: any) => i._id));
    const inSpecial = filteredItems.filter(i => specialIds.has(i._id));
    const notSpecial = filteredItems.filter(i => !specialIds.has(i._id));
    return [...inSpecial, ...notSpecial];
  }, [filteredItems, displayTodaySpecial]);

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
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 ${activeCat === c.id
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-500'
                }`}
            >
              <c.Icon size={16} strokeWidth={2} />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="px-5 mt-5 space-y-8">

        {/* ── MENU GRID ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">Cooked Near You</h2>
            <button className="text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-xl">View All</button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : orderedItems.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {orderedItems.map(item => <MenuCard key={item._id} item={item} token={token} user={user} onOpenDetail={() => setSelectedMeal(item)} />)}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState locationSet={locationSet} />
          )}
        </section>
      </main>

      <MealDetailModal 
        item={selectedMeal} 
        onClose={() => setSelectedMeal(null)} 
      />
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
          onClick={() => addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image })}
          className="bg-gray-900 text-white p-2 rounded-xl hover:bg-gray-800 transition active:scale-90"
        >
          <Plus size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function MenuCard({ item, token, user, onOpenDetail }: { item: MenuItem; token: string | null; user: any; onOpenDetail: () => void }) {
  const { addToCart } = useCart();
  const { addToast } = useToast() || { addToast: (msg: string) => console.log(msg) };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail();
  };

  // Check if item is Today's Special
  const isTodaySpecial = (item as any)?.isTodaySpecial || (item as any)?.isSpecial;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-50 flex items-center gap-4 p-4"
    >
      {/* Description Left */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[1.4vh] font-bold text-gray-400 uppercase tracking-wide">{item.category || 'Meal'}</span>
          {isTodaySpecial && (
            <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1">
              <Flame size={8} /> Special
            </div>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 truncate">{item.description}</h3>

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-lg font-black text-orange-500">₹{item.price}</span>
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

      {/* Image Right */}
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img src={item.image || FALLBACK_IMG} className="w-full h-full object-cover" alt={item.name} />
      </div>
    </motion.div>
  );
}

function EmptyState({ locationSet }: { locationSet: boolean }) {
  const { setShowModal } = useLocation();
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
      <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
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

function MealDetailModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { addToCart } = useCart();
  const { addToast } = useToast() || { addToast: (msg: string) => console.log(msg) };
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);

  useEffect(() => {
    setSelectedAddOns([]);
  }, [item]);

  if (!item) return null;

  const toggleAddOn = (addon: any) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.name === addon.name);
      if (exists) return prev.filter(a => a.name !== addon.name);
      return [...prev, addon];
    });
  };

  const totalPrice = item.price + selectedAddOns.reduce((s, a) => s + (a.price || 0), 0);

  const handleConfirmAdd = () => {
    try {
      addToCart({
        _id: item._id,
        name: item.name,
        price: totalPrice,
        image: item.image,
        selectedAddOns: selectedAddOns
      });
      if (addToast) addToast(`Added item to cart`, 'success');
      onClose();
    } catch (err) {
      if (addToast) addToast('Failed to add to cart', 'error');
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header Image */}
            <div className="relative h-64 shrink-0">
              <img src={item.image || FALLBACK_IMG} className="w-full h-full object-cover" alt={item.name} />
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2.5 py-1 bg-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                      {item.category || 'Meal'}
                   </span>
                   {item.deliveryTime && (
                     <span className="flex items-center gap-1 text-[10px] font-bold opacity-80 bg-black/20 backdrop-blur px-2 py-1 rounded-full">
                        <Clock size={10} /> {item.deliveryTime}
                     </span>
                   )}
                </div>
                <h2 className="text-2xl font-black">{item.description}</h2>
              </div>
            </div>
  
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      <Tag size={12} className="text-orange-500" /> {tag}
                    </span>
                  ))}
                </div>
              )}
  
              {/* Price Detail */}
              <div className="bg-orange-50 rounded-3xl p-4 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Base Price</p>
                    <p className="text-2xl font-black text-orange-600">₹{item.price}</p>
                 </div>
                 {item.originalPrice && item.originalPrice > item.price && (
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">MRP</p>
                      <p className="text-sm font-bold text-gray-400 line-through">₹{item.originalPrice}</p>
                   </div>
                 )}
              </div>
  
              {/* Add-ons */}
              {item.addOns && item.addOns.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">Customize Meal</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {item.addOns.map((addon) => {
                      const isSelected = selectedAddOns.some(a => a.name === addon.name);
                      return (
                        <button
                          key={addon.name}
                          onClick={() => toggleAddOn(addon)}
                          className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all group ${
                            isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-200'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                            {addon.image ? (
                              <img src={addon.image} className="w-full h-full object-cover" alt={addon.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                 <Plus size={20} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-bold text-sm ${isSelected ? 'text-orange-900' : 'text-slate-900'}`}>
                              {addon.name}
                            </p>
                            <p className="font-extrabold text-orange-500 text-xs">+ ₹{addon.price}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                            isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-200'
                          }`}>
                            {isSelected && <Plus size={14} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
  
            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4 sticky bottom-0">
               <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Amount</p>
                  <p className="text-2xl font-black text-slate-900">₹{totalPrice}</p>
               </div>
               <button
                 onClick={handleConfirmAdd}
                 className="flex-[2] bg-orange-500 text-white rounded-2xl py-4 font-black shadow-xl shadow-orange-200 active:scale-95 transition-all hover:bg-orange-600"
               >
                 Add to Bag
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

