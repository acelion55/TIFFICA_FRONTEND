'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isPast, isToday, addDays } from 'date-fns';
import { Lock, Wallet, ShoppingCart, Trash2, ChevronLeft, ChevronRight, Sun, Sunset, Moon, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import AddressSelector from '../../components/address-selector';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MEAL_TYPES = [
  { label: 'Breakfast', icon: Sun, gradient: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-700' },
  { label: 'Lunch', icon: Sunset, gradient: 'from-orange-400 to-red-500', lightBg: 'bg-orange-50', border: 'border-orange-200', textColor: 'text-orange-700' },
  { label: 'Dinner', icon: Moon, gradient: 'from-indigo-400 to-purple-600', lightBg: 'bg-indigo-50', border: 'border-indigo-200', textColor: 'text-indigo-700' },
];

export default function ScheduleClient() {
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<Record<string, any[]>>({});
  const [addressSelectorVisible, setAddressSelectorVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [cart, setCart] = useState<Record<string, Record<string, any[]>>>({});
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();

  // Fetch wallet balance from DB via profile API
  const fetchWalletBalance = useCallback(async () => {
    if (!token) return;
    setWalletLoading(true);
    setWalletError(false);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.walletBalance ?? 0);
      } else {
        setWalletError(true);
      }
    } catch {
      setWalletError(true);
    } finally {
      setWalletLoading(false);
    }
  }, [token]);

  // Use user from context (already fetched) as primary source
  useEffect(() => {
    if (user?.walletBalance !== undefined) {
      setWalletBalance(user.walletBalance);
      setWalletLoading(false);
    } else {
      fetchWalletBalance();
    }
  }, [user, fetchWalletBalance]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('scheduleCart');
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleCart', JSON.stringify(cart));
  }, [cart]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isPastDate = isPast(selectedDate) && !isToday(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const handleOpenAddressSelector = (mealType: string) => {
    setSelectedMealType(mealType);
    setAddressSelectorVisible(true);
  };

  const handleRemoveFromCart = (itemId: string, mealType: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[selectedDateStr]?.[mealType]) {
        next[selectedDateStr] = {
          ...next[selectedDateStr],
          [mealType]: next[selectedDateStr][mealType].filter((i: any) => i.id !== itemId),
        };
      }
      return next;
    });
  };

  const handleLockMeal = (address: any) => {
    const cartForMeal = cart[selectedDateStr]?.[selectedMealType] || [];
    const totalAmount = cartForMeal.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    if (walletBalance < totalAmount) {
      alert('Insufficient wallet balance!');
      return;
    }

    setWalletBalance(prev => prev - totalAmount);

    setScheduleData(prev => {
      const next = { ...prev };
      if (!next[selectedDateStr]) next[selectedDateStr] = [];
      next[selectedDateStr].push({
        type: 'locked',
        mealType: selectedMealType,
        lockedMeal: {
          _id: new Date().toISOString(),
          items: cartForMeal.map((item: any) => ({ menuItem: { name: item.name }, quantity: item.quantity })),
          totalAmount,
          address,
        },
      });
      return next;
    });

    setCart(prev => {
      const next = { ...prev };
      if (next[selectedDateStr]) {
        const day = { ...next[selectedDateStr] };
        delete day[selectedMealType];
        next[selectedDateStr] = day;
      }
      return next;
    });

    setAddressSelectorVisible(false);
  };

  // Navigation helpers
  const prevDay = () => setSelectedDate(d => addDays(d, -1));
  const nextDay = () => setSelectedDate(d => addDays(d, 1));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fde8d8 100%)' }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Meal Schedule</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Plan your meals, lock & go 🍱</p>
          </div>

          {/* Wallet Chip */}
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2 shadow-md cursor-pointer active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            onClick={fetchWalletBalance}
            title="Click to refresh wallet"
          >
            <Wallet className="w-4 h-4 text-white" />
            <div className="text-right">
              <p className="text-[10px] text-green-100 leading-none font-medium">Wallet</p>
              {walletLoading ? (
                <div className="w-12 h-3 mt-0.5 bg-green-400/50 rounded animate-pulse" />
              ) : walletError ? (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-200" />
                  <span className="text-xs text-white font-bold">Error</span>
                </div>
              ) : (
                <p className="text-sm text-white font-bold leading-none">₹{walletBalance.toFixed(2)}</p>
              )}
            </div>
            <RefreshCw className={`w-3 h-3 text-green-200 ${walletLoading ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-28 pt-4 space-y-5">

        {/* ── Date Navigator ── */}
        <div className="bg-white/90 rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-orange-50">
            <button
              onClick={prevDay}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-orange-500" />
            </button>

            <button
              onClick={() => setShowCalendar(v => !v)}
              className="flex flex-col items-center group"
            >
              <p className="text-lg font-extrabold text-gray-900 group-hover:text-orange-500 transition-colors">
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
              </p>
              <p className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">
                {format(selectedDate, 'dd MMM yyyy')}
              </p>
            </button>

            <button
              onClick={nextDay}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-orange-500" />
            </button>
          </div>

          {showCalendar && (
            <div className="p-2 border-t border-orange-50">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                classNames={{
                  root: 'w-full',
                  caption: 'flex justify-center items-center relative mb-4',
                  day_selected: 'bg-orange-500 text-white rounded-full font-bold',
                  day_today: 'font-bold text-orange-500',
                  nav_button: 'text-orange-500 hover:bg-orange-50 rounded-lg p-1',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Past Date Banner ── */}
        {isPastDate && (
          <div className="flex items-center gap-3 bg-gray-100 text-gray-500 rounded-2xl px-4 py-3 border border-gray-200">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Past date — scheduling unavailable</p>
              <p className="text-xs mt-0.5">Showing previously booked meals only.</p>
            </div>
          </div>
        )}

        {/* ── Meal Cards ── */}
        <div className="space-y-4">
          {MEAL_TYPES.map(meal => (
            <MealTypeCard
              key={meal.label}
              meal={meal}
              selectedDateStr={selectedDateStr}
              isPastDate={isPastDate}
              cart={cart}
              scheduleData={scheduleData}
              walletBalance={walletBalance}
              onOpenAddressSelector={handleOpenAddressSelector}
              onRemoveFromCart={handleRemoveFromCart}
              onBrowseMenu={(mealType: string) => router.push(`/menu?date=${selectedDateStr}&mealType=${mealType}`)}
            />
          ))}
        </div>
      </main>

      <AddressSelector
        visible={addressSelectorVisible}
        onClose={() => setAddressSelectorVisible(false)}
        onSelectAddress={handleLockMeal}
      />
    </div>
  );
}

/* ─────────────────── Meal Type Card ─────────────────── */
function MealTypeCard({
  meal,
  selectedDateStr,
  isPastDate,
  cart,
  scheduleData,
  walletBalance,
  onOpenAddressSelector,
  onRemoveFromCart,
  onBrowseMenu,
}: any) {
  const { label, icon: Icon, gradient, lightBg, border, textColor } = meal;
  const cartForMeal: any[] = cart[selectedDateStr]?.[label] || [];
  const lockedMeal = scheduleData[selectedDateStr]?.find((m: any) => m.mealType === label && m.type === 'locked');
  const totalAmount = cartForMeal.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  const canAfford = walletBalance >= totalAmount;

  // ── Locked State ──
  if (lockedMeal) {
    const ld = lockedMeal.lockedMeal;
    return (
      <div className={`rounded-2xl border ${border} overflow-hidden shadow-sm`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">{label}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">Locked</span>
          </div>
        </div>

        {/* Body */}
        <div className={`${lightBg} px-4 py-4 space-y-3`}>
          <div className="space-y-1.5">
            {ld.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm text-gray-700">
                <span className="font-medium">{item.menuItem.name}</span>
                <span className="text-gray-500">×{item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <p className="text-xs text-gray-500 flex items-center gap-1">📍 {ld.address?.fullAddress || 'Address saved'}</p>
            <p className={`font-extrabold text-base ${textColor}`}>₹{ld.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty or Cart State ──
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center gap-2`}>
        <Icon className="w-5 h-5 text-white" />
        <h3 className="font-bold text-white">{label}</h3>
        {cartForMeal.length > 0 && (
          <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5">
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">{cartForMeal.length}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {cartForMeal.length > 0 ? (
          <>
            <div className="space-y-2.5">
              {cartForMeal.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                    {!isPastDate && (
                      <button
                        onClick={() => onRemoveFromCart(item.id, label)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Total</span>
              <span className="text-lg font-extrabold text-gray-900">₹{totalAmount.toFixed(2)}</span>
            </div>

            {!isPastDate && (
              <>
                {!canAfford && (
                  <div className="mt-2 flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Insufficient wallet balance (₹{walletBalance.toFixed(2)} available)</span>
                  </div>
                )}
                <button
                  onClick={() => canAfford && onOpenAddressSelector(label)}
                  disabled={!canAfford}
                  className={`mt-3 w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2
                    ${canAfford
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <Lock className="w-4 h-4" />
                  Lock Meal
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            {isPastDate ? (
              <p className="text-gray-400 text-sm">No meal booked for this slot.</p>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm mb-3">No items added yet</p>
                <button
                  onClick={() => onBrowseMenu(label)}
                  className={`bg-gradient-to-r ${gradient} text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:opacity-90 active:scale-95 transition-all`}
                >
                  + Browse Menu
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
