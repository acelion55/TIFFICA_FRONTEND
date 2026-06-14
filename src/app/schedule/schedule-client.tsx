'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Search, Star, 
  Loader2, UtensilsCrossed, ArrowRight,
  TrendingUp, Sparkles, MapPin, Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

const API_URL = 'https://tifficaapp-1.onrender.com/api';

const SECTIONS = [
  { id: 'regular', label: 'Regular', tag: 'Regular', desc: 'Everyday wholesome home-style meals' },
  { id: 'shahiThali', label: 'Shahi Thali', tag: 'Shahi Thali', desc: 'Premium celebration thalis with extra love' },
  { id: 'corporateOrder', label: 'Corporate Order', tag: 'Corporate Order', desc: 'Bulk meals for offices and events' },
  { id: 'schoolTiffins', label: 'School Tiffins', tag: 'School Tiffins', desc: 'Nutritious & fun meals for kids' }
];

export default function ScheduleClient() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [homestyle, setHomestyle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Homestyle data for banners and section images
  useEffect(() => {
    fetch(`${API_URL}/homestyles`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setHomestyle(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch items based on selected section tag
  useEffect(() => {
    if (!selectedSection) return;
    
    const section = SECTIONS.find(s => s.id === selectedSection);
    if (!section) return;

    setMenuLoading(true);
    // Assuming there's an endpoint to filter by tag or we fetch all and filter
    // For now, let's fetch all menu items or use a search/filter endpoint if available
    fetch(`${API_URL}/menu/search/${section.tag}`)
      .then(r => r.json())
      .then(d => {
        setMenuItems(d.menuItems || []);
      })
      .catch(() => setMenuItems([]))
      .finally(() => setMenuLoading(false));
  }, [selectedSection]);

  // Auto-slide banner
  useEffect(() => {
    if (!homestyle?.scheduleBannerImages?.length) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % homestyle.scheduleBannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [homestyle]);

  const banners = homestyle?.scheduleBannerImages || [
    'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547523916-7c73a6de352d?w=1200&h=400&fit=crop'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-32 pt-16">
      {/* 20vh sliding banner */}
      <div className="relative h-[20vh] w-full overflow-hidden shadow-lg">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBanner}
            src={banners[currentBanner]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 focus-within:z-10">
            {banners.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentBanner === i ? 'w-6 bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={() => setCurrentBanner(p => (p + 1) % banners.length)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="px-5 pt-8 space-y-8">
        {!selectedSection ? (
          <>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900">Explore Schedules</h2>
              <p className="text-slate-500 font-medium italic">Hand-crafted meals for every routine</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SECTIONS.map((section, idx) => {
                const imageUrl = homestyle?.scheduleSectionImages?.[section.id] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedSection(section.id)}
                    className="group relative h-52 rounded-[1.5rem] overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                      <div className="w-8 h-1 bg-orange-500 mb-2 group-hover:w-12 transition-all duration-500" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider leading-tight">{section.label}</h3>
                      <p className="text-white/60 text-[9px] font-medium mt-1 leading-relaxed line-clamp-2">{section.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedSection(null)}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 active:scale-90 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {SECTIONS.find(s => s.id === selectedSection)?.label}
                </h2>
                <div className="flex items-center gap-2 text-orange-500">
                  <Sparkles className="w-3 h-3 fill-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Available Now</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search favorite items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-full py-4 pl-12 pr-6 text-sm font-bold shadow-sm focus:border-orange-500 outline-none transition-all"
              />
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[2rem] h-64 animate-pulse" />
                ))
              ) : menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <UtensilsCrossed className="w-10 h-10 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">No items found</p>
                    <p className="text-slate-400 text-sm">We are cooking up something new!</p>
                  </div>
                </div>
              ) : (
                menuItems
                  .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-slate-50 flex flex-col"
                    >
                      <div className="relative h-48">
                        <img src={item.image} className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                          <span className="text-xs font-black text-slate-900">{item.rating || '4.8'}</span>
                        </div>
                        {item.isBestseller && (
                          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" /> Bestseller
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-slate-900 truncate">{item.name}</h3>
                            <p className="text-slate-400 text-xs font-medium line-clamp-1 mt-1">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-orange-500">₹{item.price}</p>
                            {item.originalPrice && (
                              <p className="text-[10px] text-slate-300 line-through font-bold">₹{item.originalPrice}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-6">
                          <div className="flex-1 flex flex-wrap gap-2">
                             <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-full">
                               <Clock className="w-3 h-3" /> {item.mealType || 'Daily'}
                             </div>
                          </div>
                          <button 
                            onClick={() => router.push(`/menu?id=${item._id}`)}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition"
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
