'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const API_URL = 'https://tifficaapp-1.onrender.com/api';

export default function SubscriptionsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [subMenus, setSubMenus] = useState<any[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/homestyles`)
      .then(r => r.json())
      .then(d => {
        if (d?.data?.subscriptionBanners?.length > 0) {
          setBanners(d.data.subscriptionBanners);
        } else {
          setBanners([
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070',
            'https://images.unsplash.com/photo-1490818387583-1b5fb224fc9c?q=80&w=2070'
          ]);
        }
      })
      .catch(() => { });

    fetch(`${API_URL}/menu`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const items = d.items || d.menuItems || [];
        setSubMenus(items.filter((i: any) =>
          i.isSubscription ||
          i.category === 'Subscription' ||
          (i.mealTypes && i.mealTypes.includes('Subscription'))
        ));
      })
      .catch(() => { });
  }, [token]);

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">
      {/* Sliding Banner - Full Width */}
      <div className="relative w-full h-[30vh] bg-gray-200 overflow-hidden">
        <AnimatePresence mode="wait">
          {banners.map((url, index) => (
            index === currentBanner && (
              <motion.div
                key={url}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img src={url} alt={`Banner ${index}`} className="w-full h-full object-cover" />

              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="absolute bottom-6 right-6 flex gap-1.5">
          {banners.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">

        {/* Subscription Menus */}
        <div className="pt-2">
          <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            Subscription Meals
          </h3>

          {subMenus.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No subscription meals available right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subMenus.map(item => (
                <motion.div
                  key={item._id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                    className="w-24 h-24 object-cover rounded-xl shrink-0 border border-gray-100"
                    alt={item.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-gray-900 leading-tight mb-1">{item.name}</h4>
                    {item.description && (
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug">{item.description}</p>
                    )}
                    {item.isVeg !== undefined && (
                      <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black text-base text-gray-900">₹{item.price}</span>
                      <button
                        onClick={() => {
                          addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image });
                          addToast(`Added ${item.name}`, 'success');
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2.5 transition shadow-sm hover:shadow active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
