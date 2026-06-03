'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  ChevronLeft, ChevronRight, MapPin, ChevronDown,
  Lock, CheckCircle2, Trash2, Loader2, Search, Star,
  Coffee, UtensilsCrossed, Moon, AlertTriangle
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths, isPast, startOfDay
} from 'date-fns';

const API_URL = 'https://tifficaapp-1.onrender.com/api';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MEAL_SLOTS = [
  { label: 'Breakfast', slabs: ['08:00-10:00', '09:00-11:00', '10:00-12:00'], displaySlabs: ['8:00 AM - 10:00 AM', '9:00 AM - 11:00 AM', '10:00 AM - 12:00 PM'], Icon: Coffee },
  { label: 'Lunch',     slabs: ['12:00-14:00', '13:00-15:00', '14:00-16:00'], displaySlabs: ['12:00 PM - 2:00 PM', '1:00 PM - 3:00 PM', '2:00 PM - 4:00 PM'], Icon: UtensilsCrossed },
  { label: 'Dinner',    slabs: ['18:00-20:00', '19:00-21:00', '20:00-22:00'], displaySlabs: ['6:00 PM - 8:00 PM', '7:00 PM - 9:00 PM', '8:00 PM - 10:00 PM'], Icon: Moon },
] as const;

type MealType = typeof MEAL_SLOTS[number]['label'];

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
}

interface SavedMeal {
  mealType: string;
  menuItem: { _id: string; name: string; price: number; image?: string };
  deliveryAddress: { fullAddress?: string; houseNo?: string; area?: string; addressType?: string };
  deliveryTime?: string;
  lockedAt: string;
  mealPrice?: number;
}
interface DaySchedule { date: string; meals: SavedMeal[]; }

function hoursLeft(lockedAt: string, deliveryTime: string, date: string) {
  const [hours, minutes] = deliveryTime.split(':').map(Number);
  const deliveryDateTime = new Date(date);
  deliveryDateTime.setHours(hours, minutes, 0, 0);
  return (deliveryDateTime.getTime() - Date.now()) / 3600000;
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

export default function ScheduleClient() {
  const { token, user, updateUser } = useAuth();
  const { locationSet } = useLocation();
  const { addToast } = useToast();
  const searchParams = useSearchParams();

  const calendarRef = useRef<HTMLDivElement>(null);

  const [currentMonth, setCurrentMonth]     = useState(new Date());
  const [selectedDate, setSelectedDate]     = useState(new Date());
  const [monthSchedules, setMonthSchedules] = useState<Record<string, DaySchedule>>({});
  const [daySchedule, setDaySchedule]       = useState<DaySchedule | null>(null);
  const [addresses, setAddresses]           = useState<any[]>([]);
  const [loadingDay, setLoadingDay]         = useState(false);
  const [removingMeal, setRemovingMeal]     = useState<string | null>(null);
  const [savingTime, setSavingTime]         = useState<string | null>(null);
  const [error, setError]                   = useState('');

  const [activeMealTab, setActiveMealTab]   = useState<MealType>('Breakfast');
  const [menuItems, setMenuItems]           = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading]       = useState(false);
  const [menuSearch, setMenuSearch]         = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [showWarning, setShowWarning]       = useState(false);
  const [warningData, setWarningData]       = useState<any>(null);

  const [slotAddress, setSlotAddress] = useState<Record<string, any>>({});
  const [slotSlab, setSlotSlab] = useState<Record<string, string>>({
    Breakfast: '08:00-10:00', Lunch: '12:00-14:00', Dinner: '18:00-20:00'
  });
  const [addrOpen, setAddrOpen] = useState(false);

  const dateKey  = format(selectedDate, 'yyyy-MM-dd');
  const monthKey = format(currentMonth, 'yyyy-MM');
  const activeSlot = MEAL_SLOTS.find(s => s.label === activeMealTab)!;

  useEffect(() => {
    const meal = searchParams.get('meal') || searchParams.get('mealType');
    if (meal && MEAL_TYPES.includes(meal as MealType)) {
      setActiveMealTab(meal as MealType);
    }
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setCurrentMonth(parsed);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (calendarRef.current) {
      gsap.fromTo(calendarRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [currentMonth]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const addrs = d.addresses || [];
        setAddresses(addrs);
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        if (def) setSlotAddress({ Breakfast: def, Lunch: def, Dinner: def });
      })
      .catch(() => {});
  }, [token]);

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

  useEffect(() => {
    if (!token || !activeMealTab) return;
    setMenuLoading(true);
    const apiUrl = locationSet
      ? `${API_URL}/menu/mealtype/${activeMealTab}/by-location`
      : `${API_URL}/menu/mealtype/${activeMealTab}`;
    fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMenuItems(d.items || []))
      .catch(() => setMenuItems([]))
      .finally(() => setMenuLoading(false));
  }, [activeMealTab, token, locationSet]);

  const getMeal = (mt: string) => daySchedule?.meals?.find(m => m.mealType === mt) || null;
  const activeMeal = getMeal(activeMealTab);

  useEffect(() => {
    setSelectedMenuId(activeMeal?.menuItem?._id || null);
    setMenuSearch('');
    setAddrOpen(false);
  }, [activeMealTab, activeMeal?.menuItem?._id, dateKey]);

  const isPastDate = isPast(startOfDay(selectedDate)) && !isToday(selectedDate);
  const isLocked = (meal: SavedMeal | null, mealType: string) => {
    if (!meal?.lockedAt) return false;
    const deliveryTime = meal.deliveryTime || (mealType === 'Breakfast' ? '08:00' : mealType === 'Lunch' ? '12:00' : '18:00');
    return hoursLeft(meal.lockedAt, deliveryTime, dateKey) < 0;
  };
  const locked = isLocked(activeMeal, activeMealTab);
  const canEdit = !isPastDate && !locked;

  const filteredMenu = useMemo(() =>
    menuItems.filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase())),
    [menuItems, menuSearch]
  );

  const handleSelectDate = (day: Date) => {
    const past = isPast(startOfDay(day)) && !isToday(day);
    if (past && !monthSchedules[format(day, 'yyyy-MM-dd')]?.meals?.length) return;
    setSelectedDate(day);
    setAddrOpen(false);
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
      if (user && d.walletBalance !== undefined) updateUser({ ...user, walletBalance: d.walletBalance });
      await fetchDay();
      await fetchMonth();
      setSelectedMenuId(null);
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
    const slab = slotSlab[mealType];
    const newTime = slab.split('-')[0];
    const res = await fetch(`${API_URL}/schedule/update-time`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: dateKey, mealType, deliveryTime: newTime }),
    });
    const d = await res.json();
    if (res.ok) addToast(`Delivery slab updated to ${slab}`, 'success');
    else setError(d.error || 'Failed to update slab');
    setSavingTime(null);
  };

  const performSave = async () => {
    if (!selectedMenuId || !token) return;
    setSaving(true);
    setError('');
    const selectedItem = menuItems.find(item => item._id === selectedMenuId);
    const mealPrice = selectedItem?.price || 0;
    const isEdit = !!activeMeal;
    const chosenAddr = slotAddress[activeMealTab] || addresses[0];
    const slab = slotSlab[activeMealTab] || '08:00-10:00';
    const timeParam = slab.split('-')[0];

    const res = await fetch(`${API_URL}/schedule/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        date: dateKey,
        mealType: activeMealTab,
        menuItemId: selectedMenuId,
        deliveryAddress: chosenAddr,
        deliveryTime: timeParam,
        mealPrice,
        deductAmount: isEdit ? 0 : mealPrice,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      if (user && d.walletBalance !== undefined) updateUser({ ...user, walletBalance: d.walletBalance });
      addToast(isEdit ? 'Meal updated successfully' : `Menu locked! ₹${mealPrice} deducted from wallet`, 'success');
      await fetchDay();
      await fetchMonth();
    } else {
      setError(d.error || 'Failed to save');
    }
    setSaving(false);
  };

  const handleSave = async () => {
    if (!selectedMenuId || !token) return;
    if (activeMeal) {
      try {
        const checkRes = await fetch(`${API_URL}/schedule/check-lock?date=${dateKey}&mealType=${activeMealTab}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const checkData = await checkRes.json();
        if (checkData.withinThreeHours) {
          setWarningData(checkData);
          setShowWarning(true);
          return;
        }
      } catch { /* proceed */ }
    }
    await performSave();
  };

  const monthStart = startOfMonth(currentMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
  const startPad   = getDay(monthStart);
  const chosenAddr = slotAddress[activeMealTab];
  const chosenSlab = slotSlab[activeMealTab] || activeSlot.slabs[0];
  const deliveryTime = activeMeal?.deliveryTime || chosenSlab.split('-')[0];
  const hoursUntil = activeMeal?.lockedAt ? hoursLeft(activeMeal.lockedAt, deliveryTime, dateKey) : 999;

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-32">

      <div className="px-5 sm:px-6 md:px-8 pt-20 pb-6 space-y-5">

        {/* Month Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-extrabold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
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
                <button key={key} onClick={() => handleSelectDate(day)} disabled={disabled}
                  className="flex flex-col items-center justify-center py-1 relative">
                  <span className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold
                    ${isSelected ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : isCurrent ? 'text-orange-500 font-extrabold'
                    : disabled ? 'text-gray-300' : 'text-gray-800'}`}>
                    {format(day, 'd')}
                  </span>
                  {hasSched && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date label */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900">Plan Meals</h3>
          <span className="text-xs text-gray-500 font-semibold bg-white px-3 py-1.5 rounded-full shadow-sm">
            {format(selectedDate, 'dd MMM yyyy')}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-5 py-3">{error}</div>
        )}

        {loadingDay ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Horizontal meal tabs */}
            <div className="sticky top-[52px] z-20 -mx-5 px-5 py-2 bg-[#FAF7F5]/95 backdrop-blur-md">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {MEAL_SLOTS.map(slot => {
                  const meal = getMeal(slot.label);
                  const scheduled = !!meal;
                  const isActive = activeMealTab === slot.label;
                  return (
                    <button
                      key={slot.label}
                      onClick={() => setActiveMealTab(slot.label)}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                        isActive ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 shadow-sm'
                      }`}
                    >
                      <slot.Icon className="w-4 h-4" strokeWidth={2} />
                      <span>{slot.label}</span>
                      {scheduled && (
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-300' : 'bg-orange-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Saved meal / locked status */}
            {activeMeal && (
              <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{activeMeal.menuItem?.name}</p>
                  <p className="text-xs text-gray-500">₹{activeMeal.menuItem?.price} · scheduled</p>
                </div>
                {locked ? (
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-xl">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                ) : canEdit ? (
                  <button
                    onClick={() => handleRemove(activeMealTab)}
                    disabled={removingMeal === activeMealTab}
                    className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center"
                  >
                    {removingMeal === activeMealTab
                      ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      : <Trash2 className="w-4 h-4 text-red-500" />}
                  </button>
                ) : (
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl">Saved</span>
                )}
              </div>
            )}

            {/* Slab + address (editable) */}
            {canEdit && (
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                <p className="text-xs font-semibold text-gray-500">Delivery slab</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {activeSlot.slabs.map((slab, idx) => (
                    <button
                      key={slab}
                      onClick={() => setSlotSlab(prev => ({ ...prev, [activeMealTab]: slab }))}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        chosenSlab === slab
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {activeSlot.displaySlabs[idx]}
                    </button>
                  ))}
                </div>
                {activeMeal && (
                  <button
                    onClick={() => handleSaveTime(activeMealTab)}
                    disabled={savingTime === activeMealTab}
                    className="w-full py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    {savingTime === activeMealTab ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update saved slab'}
                  </button>
                )}

                <button
                  onClick={() => setAddrOpen(!addrOpen)}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 bg-gray-50"
                >
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="flex-1 text-xs text-left truncate text-gray-600">
                    {chosenAddr?.fullAddress || chosenAddr?.area || 'Select delivery address'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition ${addrOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {addrOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl overflow-hidden border border-gray-100"
                    >
                      {addresses.length === 0 ? (
                        <p className="text-xs text-center py-4 text-gray-400">No saved addresses. Add one in Profile.</p>
                      ) : addresses.map((addr: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => { setSlotAddress(prev => ({ ...prev, [activeMealTab]: addr })); setAddrOpen(false); }}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 text-left border-b last:border-0 bg-white hover:bg-orange-50 ${
                            chosenAddr === addr ? 'bg-orange-50' : ''
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800">{addr.addressType || 'Address'}</p>
                            <p className="text-xs truncate text-gray-500">
                              {addr.fullAddress || [addr.houseNo, addr.area].filter(Boolean).join(', ')}
                            </p>
                          </div>
                          {chosenAddr === addr && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeMeal?.lockedAt && canEdit && (
              <p className="text-[10px] text-center font-medium text-gray-400">
                {hoursUntil > 3
                  ? 'Editable anytime (full refund available)'
                  : 'Within 3 hrs — only 60% refund on change'}
              </p>
            )}

            {/* Search */}
            {canEdit && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  placeholder={`Search ${activeMealTab} menu…`}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Menu list — vertical scroll */}
            <section>
              {!canEdit ? (
                <div className="text-center py-12 text-gray-400">
                  <activeSlot.Icon className="w-12 h-12 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-bold text-gray-600">
                    {isPastDate ? 'Past date — view only' : 'This meal is locked'}
                  </p>
                </div>
              ) : menuLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-52 bg-white rounded-3xl animate-pulse" />)}
                </div>
              ) : filteredMenu.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-bold text-gray-600">No {activeMealTab} items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredMenu.map(item => {
                    const isSelected = selectedMenuId === item._id;
                    return (
                      <button
                        key={item._id}
                        onClick={() => setSelectedMenuId(isSelected ? null : item._id)}
                        disabled={!canEdit}
                        className={`relative bg-white rounded-3xl overflow-hidden shadow-sm text-left transition-all active:scale-95 ${
                          isSelected ? 'ring-2 ring-orange-500 shadow-orange-100 shadow-lg' : ''
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="relative h-36 overflow-hidden">
                          <img src={item.image || FALLBACK_IMG} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                            <span className="text-[10px] font-bold text-gray-800">{item.rating || '4.5'}</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            item.category === 'Veg' ? 'bg-green-100 text-green-700'
                            : item.category === 'Non-Veg' ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>{item.category}</span>
                          <h3 className="font-extrabold text-sm text-gray-900 mt-1.5 line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                          <p className="text-orange-600 font-extrabold text-base mt-2">₹{item.price}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Save button */}
      {canEdit && selectedMenuId && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-orange-500 text-white font-extrabold rounded-3xl shadow-xl shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {saving ? 'Saving…' : activeMeal ? `Update ${activeMealTab}` : `Save ${activeMealTab}`}
          </button>
        </div>
      )}

      {/* Refund warning */}
      {showWarning && warningData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWarning(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Refund Warning</h3>
              <p className="text-sm text-gray-600">
                Changing within <span className="font-bold text-orange-600">{warningData.hoursUntilDelivery} hours</span> of delivery.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 text-sm">
              <p>Refund: ₹{warningData.refundAmount} ({warningData.refundPercentage}%)</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWarning(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">Cancel</button>
              <button onClick={() => { setShowWarning(false); performSave(); }} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
