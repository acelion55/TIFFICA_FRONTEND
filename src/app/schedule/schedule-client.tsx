'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X,
  Loader2, Calendar, ShoppingCart,
  Clock
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

  // Dialog state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch Homestyle data for banners and section images
  useEffect(() => {
    fetch(`${API_URL}/homestyles`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setHomestyle(d.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Fetch items based on selected section tag
  useEffect(() => {
    if (!selectedSection) return;

    const section = SECTIONS.find(s => s.id === selectedSection);
    if (!section) return;

    setMenuLoading(true);
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

  // Initialize date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const banners = homestyle?.scheduleBannerImages || [
    'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547523916-7c73a6de352d?w=1200&h=400&fit=crop'
  ];

  const handleDirectCheckout = (item: any) => {
    if (!token) {
      addToast('Please login to schedule meals', 'error');
      router.push('/login');
      return;
    }

    const params = new URLSearchParams({
      itemId: item._id,
      mealType: selectedMealType,
      date: selectedDate
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const handleCheckout = () => {
    if (!selectedItem) return;
    handleDirectCheckout(selectedItem);
  };

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
                className={`w-1.5 h-1.5 rounded-full transition-all ${currentBanner === i ? 'w-6 bg-white' : 'bg-white/40'
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
                <p className="text-sm text-slate-500 font-medium">
                  {SECTIONS.find(s => s.id === selectedSection)?.desc}
                </p>
              </div>
            </div>

            {/* Menu List - Description Left, Image Right */}
            <div className="space-y-4">
              {menuLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
                ))
              ) : menuItems.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-10 h-10 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">No items found</p>
                    <p className="text-slate-400 text-sm">We are cooking up something new!</p>
                  </div>
                </div>
              ) : (
                menuItems.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleDirectCheckout(item)}
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-50 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    {/* Description Left */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{item.description}</h3>

                      <p className="text-orange-500 font-black text-lg mt-2">₹{item.price}</p>
                    </div>

                    {/* Image Right */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog - Bottom to Top Animation */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Dialog */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[2rem] z-50 max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center z-10"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>

              {/* Image */}
              <div className="relative h-64 w-full">
                <img src={selectedItem.image} className="w-full h-full object-cover" alt={selectedItem.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title & Description */}
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedItem.name}</h2>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">{selectedItem.description}</p>
                  <p className="text-orange-500 font-black text-2xl mt-3">₹{selectedItem.price}</p>
                </div>

                {/* Date Selector */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Starting Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Meal Type Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Select Meal Time</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Lunch */}
                    <button
                      onClick={() => setSelectedMealType('lunch')}
                      className={`p-4 rounded-xl border-2 transition-all ${selectedMealType === 'lunch'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className={`w-4 h-4 ${selectedMealType === 'lunch' ? 'text-orange-500' : 'text-slate-400'}`} />
                        <span className={`font-bold text-sm ${selectedMealType === 'lunch' ? 'text-orange-500' : 'text-slate-900'}`}>
                          Lunch
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">12:00 PM - 2:00 PM</p>
                    </button>

                    {/* Dinner */}
                    <button
                      onClick={() => setSelectedMealType('dinner')}
                      className={`p-4 rounded-xl border-2 transition-all ${selectedMealType === 'dinner'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className={`w-4 h-4 ${selectedMealType === 'dinner' ? 'text-orange-500' : 'text-slate-400'}`} />
                        <span className={`font-bold text-sm ${selectedMealType === 'dinner' ? 'text-orange-500' : 'text-slate-900'}`}>
                          Dinner
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">7:00 PM - 9:00 PM</p>
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
