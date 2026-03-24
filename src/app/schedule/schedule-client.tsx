'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
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

function hoursLeft(lockedAt: string) {
  return 3 - (Date.now() - new Date(lockedAt).getTime()) / 3600000;
}

export default function ScheduleClient() {
  const { token, user, updateUser } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

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
  const isLocked   = (meal: SavedMeal | null) => !!meal?.lockedAt && hoursLeft(meal.lockedAt) <= 0;

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

      <div className="px-4 pt-16 space-y-5">

        {/* Month Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl shadow-sm p-3">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
            {days.map(day => {
              const key        = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isCurrent  = isToday(day);
              const past       = isPast(startOfDay(day)) && !isToday(day);
              const hasSched   = !!monthSchedules[key]?.meals?.length;
              const disabled   = past && !hasSched;
              return (
                <button key={key} onClick={() => handleSelectDate(day)} disabled={disabled}
                  className="flex flex-col items-center justify-center py-0.5 relative">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all
                    ${isSelected  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : isCurrent   ? 'text-orange-500 font-extrabold'
                    : disabled    ? 'text-gray-300'
                    : 'text-gray-800'}`}>
                    {format(day, 'd')}
                  </span>
                  {hasSched && !isSelected && (
                    <span className="absolute bottom-0 w-1 h-1 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-extrabold text-gray-900">Daily Schedule</h3>
            <span className="text-xs text-gray-400 font-medium">{format(selectedDate, 'dd MMM yyyy')}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-3">{error}</div>
          )}

          {loadingDay ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {MEAL_SLOTS.map(slot => {
                const meal       = getMeal(slot.label);
                const locked     = isLocked(meal);
                const isRemoving = removingMeal === slot.label;
                const addrPickerOpen = addrOpen === slot.label;
                const chosenAddr = slotAddress[slot.label];
                const chosenTime = slotTime[slot.label] || slot.defaultTime;
                const dark       = slot.dark;

                return (
                  <div key={slot.label}
                    className={`rounded-3xl shadow-sm overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white'}`}>

                    {/* ── Top row: icon + label + action ── */}
                    <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-gray-700' : slot.iconBg}`}>
                        <span className="text-lg">{slot.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-extrabold text-base leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{slot.label}</p>
                        {meal && (
                          <p className={`text-xs truncate mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {meal.menuItem?.name} · ₹{meal.menuItem?.price}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      {isPastDate ? (
                        meal
                          ? <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-2xl">✓ Saved</span>
                          : <span className={`text-xs font-bold ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No meal</span>
                      ) : locked ? (
                        <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-2xl">
                          <Lock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500 font-bold">Locked</span>
                        </div>
                      ) : meal ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAddMeal(slot.label)}
                            className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center active:scale-95">
                            <Pencil className="w-3.5 h-3.5 text-orange-600" />
                          </button>
                          <button onClick={() => handleRemove(slot.label)} disabled={isRemoving}
                            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center active:scale-95">
                            {isRemoving
                              ? <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5 text-red-500" />}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleAddMeal(slot.label)}
                          className="border-2 border-orange-500 text-orange-500 text-xs font-extrabold px-3 py-2 rounded-2xl active:scale-95 transition">
                          ADD MEAL
                        </button>
                      )}
                    </div>

                    {/* ── Time input ── */}
                    {!isPastDate && !locked && (
                      <div className="px-4 pb-2">
                        <div className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <Clock className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={`text-xs font-semibold mr-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Delivery time</span>
                          <input
                            type="time"
                            value={chosenTime}
                            onChange={e => setSlotTime(prev => ({ ...prev, [slot.label]: e.target.value }))}
                            className={`flex-1 text-sm font-bold bg-transparent focus:outline-none ${dark ? 'text-white' : 'text-gray-900'}`}
                          />
                          <button onClick={() => handleSaveTime(slot.label)} disabled={savingTime === slot.label}
                            className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center active:scale-95 transition disabled:opacity-50">
                            {savingTime === slot.label
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Address picker ── */}
                    {!isPastDate && !locked && (
                      <div className="px-4 pb-3">
                        {/* Trigger */}
                        <button
                          onClick={() => setAddrOpen(addrPickerOpen ? null : slot.label)}
                          className={`w-full flex items-center gap-2 rounded-2xl px-3 py-2.5 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <MapPin className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={`flex-1 text-xs text-left truncate ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {chosenAddr?.fullAddress || chosenAddr?.area || 'Select delivery address'}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${addrPickerOpen ? 'rotate-180' : ''} ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
                        </button>

                        {/* Dropdown */}
                        {addrPickerOpen && (
                          <div className={`mt-2 rounded-2xl overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                            {addresses.length === 0 ? (
                              <p className={`text-xs text-center py-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                                No saved addresses. Add one in Profile.
                              </p>
                            ) : (
                              addresses.map((addr: any, i: number) => (
                                <button key={i}
                                  onClick={() => {
                                    setSlotAddress(prev => ({ ...prev, [slot.label]: addr }));
                                    setAddrOpen(null);
                                  }}
                                  className={`w-full flex items-start gap-3 px-3 py-3 text-left border-b last:border-0 transition active:scale-95
                                    ${dark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-50 hover:bg-orange-50'}
                                    ${chosenAddr === addr ? (dark ? 'bg-gray-700' : 'bg-orange-50') : ''}`}>
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
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Locked address display ── */}
                    {(isPastDate || locked) && meal?.deliveryAddress?.fullAddress && (
                      <div className={`px-4 pb-3 flex items-center gap-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span className="text-xs truncate">{meal.deliveryAddress.fullAddress}</span>
                      </div>
                    )}

                    {/* ── Edit countdown ── */}
                    {meal?.lockedAt && !locked && !isPastDate && (
                      <p className={`text-[10px] text-center pb-3 font-medium ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                        ⏱ Editable for {Math.max(0, hoursLeft(meal.lockedAt)).toFixed(1)} more hrs
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
