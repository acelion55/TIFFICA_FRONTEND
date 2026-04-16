'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Search, Star, CheckCircle2, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  mealType: string;
  rating: number;
  isAvailable: boolean;
  isVeg?: boolean;
}

function ScheduleMenuContent() {
  const { token, user, updateUser } = useAuth();
  const { locationSet } = useLocation();
  const { addToast } = useToast();
  const router = useRouter();
  const params = useSearchParams();

  const date = params.get('date') || '';
  const mealType = params.get('mealType') || '';
  const timeParam = params.get('time') || '';
  const addressRaw = params.get('address') || '{}';
  const existingMealId = params.get('existingMealId') || null;
  const isEdit = params.get('isEdit') === 'true';
  const deliveryAddress = (() => { try { return JSON.parse(decodeURIComponent(addressRaw)); } catch { return {}; } })();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mealType || !token) return;
    const apiUrl = locationSet 
      ? `${API_URL}/menu/mealtype/${mealType}/by-location`
      : `${API_URL}/menu/mealtype/${mealType}`;
    
    fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
        // Pre-select existing meal if editing
        if (existingMealId) {
          setSelected(existingMealId);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mealType, existingMealId, token, locationSet]);

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleSave = async () => {
    if (!selected || !token) return;
    setSaving(true);
    setError('');
    
    const selectedItem = items.find(item => item._id === selected);
    const mealPrice = selectedItem?.price || 0;
    
    // Only deduct wallet if it's a new meal (not an edit)
    const deductAmount = isEdit ? 0 : mealPrice;
    
    const res = await fetch(`${API_URL}/schedule/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        date, 
        mealType, 
        menuItemId: selected, 
        deliveryAddress,
        deliveryTime: timeParam || (mealType === 'Breakfast' ? '08:00' : mealType === 'Lunch' ? '13:00' : '19:30'),
        mealPrice: mealPrice,
        deductAmount,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      // Update user wallet balance in context
      if (user && d.walletBalance !== undefined) {
        updateUser({ ...user, walletBalance: d.walletBalance });
      }
      
      if (isEdit) {
        addToast(`✅ Meal updated successfully`, 'success');
      } else {
        addToast(`✅ Menu locked! ₹${mealPrice} deducted from wallet`, 'success');
      }
      router.back();
    } else {
      setError(d.error || 'Failed to save');
      setSaving(false);
    }
  };

  const mealIcons: Record<string, string> = { Breakfast: '☕', Lunch: '🍽️', Dinner: '🍛' };

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-32">

      {/* Header */}
      <div className="bg-white px-4 pt-16 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">
              {mealIcons[mealType]} {mealType} Menu
            </h1>
            <p className="text-xs text-gray-400">{date} · Select one item</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 mb-3">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${mealType} items…`}
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400" />
        </div>


      </div>

      {error && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">{error}</div>
      )}

      <div className="px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-bold text-gray-600">No {mealType} items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(item => {
              const isSelected = selected === item._id;
              return (
                <button key={item._id} onClick={() => setSelected(isSelected ? null : item._id)}
                  className={`relative bg-white rounded-3xl overflow-hidden shadow-sm text-left transition-all active:scale-95 ${
                    isSelected ? 'ring-2 ring-orange-500 shadow-orange-100 shadow-lg' : ''
                  }`}>
                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="relative h-36 overflow-hidden">
                    <img src={item.image || FALLBACK} alt={item.name}
                      className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                      <span className="text-[10px] font-bold text-gray-800">{item.rating || '4.5'}</span>
                    </div>
                  </div>

                  <div className="p-3">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      item.category === 'Veg' ? 'bg-green-100 text-green-700'
                      : item.category === 'Non-Veg' ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>{item.category}</span>
                    <h3 className="font-extrabold text-sm text-gray-900 mt-1.5 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-orange-600 font-extrabold text-base">₹{item.price}</p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-gray-400 text-xs line-through">₹{item.originalPrice}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Save button */}
      {selected && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 bg-orange-500 text-white font-extrabold rounded-3xl shadow-xl shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-70">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {saving ? 'Saving…' : `Save ${mealType}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ScheduleMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>}>
      <ScheduleMenuContent />
    </Suspense>
  );
}
