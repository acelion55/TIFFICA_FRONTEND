'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  ChevronLeft, ChevronRight, MapPin, ChevronDown,
  Lock, CheckCircle2, Pencil, Trash2, Loader2, Clock, Wallet
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths, isPast, startOfDay
} from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MEAL_SLOTS = [
  { label: 'Breakfast', defaultTime: '08:00', icon: '☕', iconBg: 'bg-orange-100', dark: false },
  { label: 'Lunch',     defaultTime: '13:00', icon: '🍽️', iconBg: 'bg-amber-50',   dark: false },
  { label: 'Dinner',    defaultTime: '19:30', icon: '🍛', iconBg: 'bg-gray-700',   dark: true  },
];

interface SavedMeal {
  mealType: string;
  menuItem: { _id: string; name: string; price: number; image?: string };
  deliveryAddress: { fullAddress?: string; houseNo?: string; area?: string; addressType?: string };
  lockedAt: string;
  mealPrice?: number; // Store the price for refund calculation
}
interface DaySchedule { date: string; meals: SavedMeal[]; }

function hoursLeft(lockedAt: string, deliveryTime: string, date: string) {
  // Calculate hours until delivery time, not hours since lock
  const [hours, minutes] = deliveryTime.split(':').map(Number);
  const deliveryDateTime = new Date(date);
  deliveryDateTime.setHours(hours, minutes, 0, 0);
  
  const hoursUntilDelivery = (deliveryDateTime.getTime() - Date.now()) / 3600000;
  return hoursUntilDelivery;
}

export default function ScheduleClient() {
  const { token, user, updateUser } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const calendarRef = useRef<HTMLDivElement>(null);
  const mealCardsRef = useRef<HTMLDivElement>(null);

  const [currentMonth, setCurrentMonth]   = useState(new Date());
  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [monthSchedules, setMonthSchedules] = useState<Record<string, DaySchedule>>({});
  const [daySchedule, setDaySchedule]     = useState<DaySchedule | null>(null);
  const [addresses, setAddresses]         = useState<any[]>([]);
  const [loadingDay, setLoadingDay]       = useState(false);
  const [removingMeal, setRemovingMeal]   = useState<string | null>(null);
  const [lockingMeal, setLockingMeal]     = useState<string | null>(null);
  const [savingTime, setSavingTime]       = useState<string | null>(null);
  const [error, setError]                 = useState('');

  // Per-slot state: chosen address + chosen time
  const [slotAddress, setSlotAddress] = useState<Record<string, any>>({});
  const [slotTime,    setSlotTime]    = useState<Record<string, string>>({
    Breakfast: '08:00', Lunch: '13:00', Dinner: '19:30'
  });
  const [addrOpen, setAddrOpen] = useState<string | null>(null);

  const dateKey  = format(selectedDate, 'yyyy-MM-dd');
  const monthKey = format(currentMonth, 'yyyy-MM');

  /* ── GSAP animations ── */
  useEffect(() => {
    if (calendarRef.current) {
      gsap.fromTo(calendarRef.current, 
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [currentMonth]);

  useEffect(() => {
    if (mealCardsRef.current && !loadingDay && daySchedule) {
      const cards = mealCardsRef.current.querySelectorAll('.meal-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [selectedDate]);

  /* ── fetch addresses ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const addrs = d.addresses || [];
        setAddresses(addrs);
        // pre-select default address for all slots
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        if (def) setSlotAddress({ Breakfast: def, Lunch: def, Dinner: def });
      })
      .catch(() => {});
  }, [token]);

  /* ── fetch month dots ── */
  const fetchMonth = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/schedule/month?month=${monthKey}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const d = await res.json();
      const map: Record<string, DaySchedule> = {};
      (d.schedules || []).forEach((s: DaySchedule) => { map[s.date] = s; });
      setMonthSchedules(map);
    }
  }, [token, monthKey]);
  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  /* ── fetch day schedule ── */
  const fetchDay = useCallback(async () => {
    if (!token) return;
    setLoadingDay(true); setError('');
    const res = await fetch(`${API_URL}/schedule?date=${dateKey}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { const d = await res.json(); setDaySchedule(d.schedule); }
    setLoadingDay(false);
  }, [token, dateKey]);
  useEffect(() => { fetchDay(); }, [fetchDay]);

  const isPastDate = isPast(startOfDay(selectedDate)) && !isToday(selectedDate);
  const getMeal    = (mt: string) => daySchedule?.meals?.find(m => m.mealType === mt) || null;
  const isLocked   = (meal: SavedMeal | null, mealType: string) => {
    if (!meal?.lockedAt) return false;
    const deliveryTime = meal.deliveryTime || (mealType === 'Breakfast' ? '08:00' : mealType === 'Lunch' ? '13:00' : '19:30');
    const hoursUntil = hoursLeft(meal.lockedAt, deliveryTime, dateKey);
    // Only lock if delivery time has passed
    return hoursUntil < 0;
  };

  const handleSelectDate = (day: Date) => {
    const past = isPast(startOfDay(day)) && !isToday(day);
    if (past && !monthSchedules[format(day, 'yyyy-MM-dd')]?.meals?.length) return;
    setSelectedDate(day);
    setAddrOpen(null);
  };

  const handleAddMeal = (mealType: string) => {
    const addr = slotAddress[mealType] || addresses[0];
    const time = slotTime[mealType] || MEAL_SLOTS.find(s => s.label === mealType)?.defaultTime || '';
    const meal = getMeal(mealType);
    const existingMealId = meal?.menuItem?._id || '';
    const isEdit = !!meal;
    router.push(
      `/schedule/menu?date=${dateKey}&mealType=${mealType}&time=${time}&address=${encodeURIComponent(JSON.stringify(addr || {}))}&existingMealId=${existingMealId}&isEdit=${isEdit}`
    );
  };

  const handleRemove = async (mealType: string) => {
    if (!token) return;
    setRemovingMeal(mealType); setError('');

    const res = await fetch(`${API_URL}/schedule/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: dateKey, mealType }),
    });

    const d = await res.json();
    if (res.ok) {
      if (user && d.walletBalance !== undefined) {
        updateUser({ ...user, walletBalance: d.walletBalance });
      }

      await fetchDay();
      await fetchMonth();

      addToast(d.message || 'Meal removed successfully', 'success');
    } else {
      setError(d.error || 'Failed to remove');
      addToast(d.error || 'Failed to remove', 'error');
    }

    setRemovingMeal(null);
  };

  const handleSaveTime = async (mealType: string) => {
    if (!token) return;
    setSavingTime(mealType);
    setError('');
    const newTime = slotTime[mealType];
    const res = await fetch(`${API_URL}/schedule/update-time`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: dateKey, mealType, deliveryTime: newTime }),
    });
    const d = await res.json();
    if (res.ok) {
      addToast(`✅ Delivery time updated to ${newTime}`, 'success');
    } else {
      setError(d.error || 'Failed to update time');
    }
    setSavingTime(null);
  };

  /* ── calendar grid ── */
  const monthStart = startOfMonth(currentMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
  const startPad   = getDay(monthStart);

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">

      <div className="px-5 sm:px-6 md:px-8 pt-20 pb-6 space-y-6">

        {/* Month Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-extrabold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Calendar */}
        <div ref={calendarRef} className="bg-white rounded-3xl shadow-md p-4 sm:p-5">
          <div className="grid grid-cols-7 mb-3">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
            {days.map(day => {
              const key        = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isCurrent  = isToday(day);
              const past       = isPast(startOfDay(day)) && !isToday(day);
              const hasSched   = !!monthSchedules[key]?.meals?.length;
              const disabled   = past && !hasSched;
              return (
                <motion.button 
                  key={key} 
                  onClick={() => handleSelectDate(day)} 
                  disabled={disabled}
                  whileHover={!disabled ? { scale: 1.1 } : {}}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  className="flex flex-col items-center justify-center py-1 relative"
                >
                  <motion.span 
                    animate={{
                      scale: isSelected ? 1 : 1,
                      backgroundColor: isSelected ? '#f97316' : 'transparent'
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold
                    ${isSelected  ? 'text-white shadow-lg shadow-orange-200'
                    : isCurrent   ? 'text-orange-500 font-extrabold'
                    : disabled    ? 'text-gray-300'
                    : 'text-gray-800'}`}
                  >
                    {format(day, 'd')}
                  </motion.span>
                  <AnimatePresence>
                    {hasSched && !isSelected && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-orange-400" 
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule */}
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <h3 className="text-xl font-extrabold text-gray-900">Daily Schedule</h3>
            <span className="text-xs text-gray-500 font-semibold bg-white px-3 py-1.5 rounded-full shadow-sm">
              {format(selectedDate, 'dd MMM yyyy')}
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-5 py-3 mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loadingDay ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-12"
            >
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </motion.div>
          ) : (
            <div ref={mealCardsRef} className="space-y-4">
              {MEAL_SLOTS.map((slot, index) => {
                const meal       = getMeal(slot.label);
                const locked     = isLocked(meal, slot.label);
                const isRemoving = removingMeal === slot.label;
                const addrPickerOpen = addrOpen === slot.label;
                const chosenAddr = slotAddress[slot.label];
                const chosenTime = slotTime[slot.label] || slot.defaultTime;
                const dark       = slot.dark;
                const deliveryTime = meal?.deliveryTime || chosenTime;
                const hoursUntil = meal?.lockedAt ? hoursLeft(meal.lockedAt, deliveryTime, dateKey) : 999;

                return (
                  <motion.div 
                    key={slot.label}
                    className={`meal-card rounded-3xl shadow-lg overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white'}`}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >

                    {/* ── Top row: icon + label + action ── */}
                    <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-gray-700' : slot.iconBg}`}
                      >
                        <span className="text-xl">{slot.icon}</span>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-extrabold text-lg leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{slot.label}</p>
                        {meal && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-xs truncate mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            {meal.menuItem?.name} · ₹{meal.menuItem?.price}
                          </motion.p>
                        )}
                      </div>

                      {/* Action */}
                      {isPastDate ? (
                        meal
                          ? <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs bg-green-100 text-green-700 font-bold px-3 py-2 rounded-2xl"
                            >
                              ✓ Saved
                            </motion.span>
                          : <span className={`text-xs font-bold ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No meal</span>
                      ) : locked ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-2xl"
                        >
                          <Lock className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-500 font-bold">Locked</span>
                        </motion.div>
                      ) : meal ? (
                        <div className="flex items-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddMeal(slot.label)}
                            className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"
                          >
                            <Pencil className="w-4 h-4 text-orange-600" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemove(slot.label)} 
                            disabled={isRemoving}
                            className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center"
                          >
                            {isRemoving
                              ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                              : <Trash2 className="w-4 h-4 text-red-500" />}
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddMeal(slot.label)}
                          className="border-2 border-orange-500 text-orange-500 text-xs font-extrabold px-4 py-2.5 rounded-2xl transition"
                        >
                          ADD MEAL
                        </motion.button>
                      )}
                    </div>

                    {/* ── Time input ── */}
                    {!isPastDate && !locked && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-3"
                      >
                        <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <Clock className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={`text-xs font-semibold mr-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Delivery time</span>
                          <input
                            type="time"
                            value={chosenTime}
                            onChange={e => setSlotTime(prev => ({ ...prev, [slot.label]: e.target.value }))}
                            className={`flex-1 text-sm font-bold bg-transparent focus:outline-none ${dark ? 'text-white' : 'text-gray-900'}`}
                          />
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => handleSaveTime(slot.label)} 
                            disabled={savingTime === slot.label}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center disabled:opacity-50"
                          >
                            {savingTime === slot.label
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <CheckCircle2 className="w-4 h-4" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Address picker ── */}
                    {!isPastDate && !locked && (
                      <div className="px-5 pb-4">
                        {/* Trigger */}
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAddrOpen(addrPickerOpen ? null : slot.label)}
                          className={`w-full flex items-center gap-2 rounded-2xl px-4 py-3 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}
                        >
                          <MapPin className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={`flex-1 text-xs text-left truncate ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {chosenAddr?.fullAddress || chosenAddr?.area || 'Select delivery address'}
                          </span>
                          <motion.div
                            animate={{ rotate: addrPickerOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className={`w-4 h-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                          </motion.div>
                        </motion.button>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {addrPickerOpen && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              className={`mt-2 rounded-2xl overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-100'}`}
                            >
                              {addresses.length === 0 ? (
                                <p className={`text-xs text-center py-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  No saved addresses. Add one in Profile.
                                </p>
                              ) : (
                                addresses.map((addr: any, i: number) => (
                                  <motion.button 
                                    key={i}
                                    whileHover={{ backgroundColor: dark ? '#374151' : '#FFF7ED' }}
                                    transition={{ duration: 0.15 }}
                                    onClick={() => {
                                      setSlotAddress(prev => ({ ...prev, [slot.label]: addr }));
                                      setAddrOpen(null);
                                    }}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b last:border-0
                                      ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'}
                                      ${chosenAddr === addr ? (dark ? 'bg-gray-700' : 'bg-orange-50') : ''}`}
                                  >
                                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                                        {addr.addressType || 'Address'} {addr.isDefault ? '· Default' : ''}
                                      </p>
                                      <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {addr.fullAddress || [addr.houseNo, addr.area].filter(Boolean).join(', ')}
                                      </p>
                                    </div>
                                    {chosenAddr === addr && <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />}
                                  </motion.button>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* ── Locked address display ── */}
                    {(isPastDate || locked) && meal?.deliveryAddress?.fullAddress && (
                      <div className={`px-5 pb-3 flex items-center gap-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span className="text-xs truncate">{meal.deliveryAddress.fullAddress}</span>
                      </div>
                    )}

                    {/* ── Edit countdown ── */}
                    {meal?.lockedAt && !locked && !isPastDate && (
                      <p className={`text-[10px] text-center pb-3 font-medium ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {hoursUntil > 3 
                          ? `⏱ Editable anytime (Full refund available)`
                          : `⚠️ Within 3 hrs - Only 60% refund on change`
                        }
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
