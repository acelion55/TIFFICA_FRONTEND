'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSwipe } from '@/hooks/useSwipe';
import { Users, ShoppingBag, UtensilsCrossed, CreditCard, Store, BarChart2, LogOut, RefreshCw, Home, Bell, FileText } from 'lucide-react';
import {
  OverviewTab, UsersTab, OrdersTab, MenuTab, KitchensTab,
  SubscriptionsTab, NotificationsTab, LegalTab, HomestyleTab, CouponsTab, ScheduleOrdersTab,
} from './AdminContent';
import { CouponModal } from './CouponModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
type Tab = 'stats' | 'users' | 'orders' | 'menu' | 'kitchens' | 'subscriptions' | 'schedules' | 'homestyles' | 'notifications' | 'legal' | 'coupons';
interface Stats { users: number; orders: number; menuItems: number; subscriptions: number; totalWalletBalance?: number; }

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [scheduleOrders, setScheduleOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [today, setToday] = useState<any>(null);
  const [liveUsers, setLiveUsers] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', targetAll: true });
  const [notifSaving, setNotifSaving] = useState(false);
  const [legal, setLegal] = useState({ terms: '', privacy: '' });
  const [legalSaving, setLegalSaving] = useState(false);
  const [homestyle, setHomestyle] = useState<any>(null);
  const [hsVideos, setHsVideos] = useState<string[]>([]);
  const [hsVideoUploading, setHsVideoUploading] = useState(false);
  const [hsSaving, setHsSaving] = useState(false);
  const [kitchenModal, setKitchenModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [menuModal, setMenuModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [userModal, setUserModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [selectedUserRole, setSelectedUserRole] = useState('user');
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string>('');
  const [orderSearch, setOrderSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [performanceDateFrom, setPerformanceDateFrom] = useState('');
  const [performanceDateTo, setPerformanceDateTo] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [userPerformance, setUserPerformance] = useState<any[]>([]);
  const [couponModal, setCouponModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const [sRes, uRes, oRes, mRes, kRes, subRes, todayRes, dpRes, schedRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers }),
        fetch(`${API_URL}/admin/menu`, { headers }),
        fetch(`${API_URL}/admin/cloudkitchens`, { headers }),
        fetch(`${API_URL}/admin/subscriptions`, { headers }),
        fetch(`${API_URL}/admin/today`, { headers }),
        fetch(`${API_URL}/admin/delivery-partners`, { headers }),
        fetch(`${API_URL}/admin/schedules`, { headers }),
      ]);
      if (sRes.status === 403) { setError('Access denied. Admin only.'); setLoading(false); return; }
      const [s, u, o, m, k, sub, t, dp, sched] = await Promise.all([sRes.json(), uRes.json(), oRes.json(), mRes.json(), kRes.json(), subRes.json(), todayRes.json(), dpRes.json(), schedRes.json()]);
      if (s.stats) setStats(s.stats);
      if (u.users) setUsers(u.users);
      if (o.orders) setOrders(o.orders);
      if (m.items) setMenuItems(m.items);
      if (k.kitchens) setKitchens(k.kitchens);
      if (sub.subscriptions) setSubscriptions(sub.subscriptions);
      if (t.success) { setToday(t); setLiveUsers(t.liveUsers || 0); }
      if (dp.success) setDeliveryPartners(dp.partners || []);
      if (sched.success) setScheduleOrders(sched.schedules || []);
    } catch { setError('Failed to load data. Check server connection.'); }
    setLoading(false);
    try { const r = await fetch(`${API_URL}/homestyles`); const d = await r.json(); if (d.success && d.data) { setHomestyle(d.data); setHsVideos(d.data.videoLinks || []); } } catch {}
    try { const r = await fetch(`${API_URL}/notifications/admin`, { headers }); const d = await r.json(); if (d.success) setNotifications(d.notifications || []); } catch {}
    try { const r = await fetch(`${API_URL}/legalpages`); const d = await r.json(); if (d.success && d.data) { const te = d.data.find((p: any) => p.pageType === 'terms'); const pr = d.data.find((p: any) => p.pageType === 'privacy'); setLegal({ terms: te?.content || '', privacy: pr?.content || '' }); } } catch {}
    try { const r = await fetch(`${API_URL}/coupons`, { headers }); const d = await r.json(); if (d.success) setCoupons(d.coupons || []); } catch {}
    try { 
      let perfUrl = `${API_URL}/coupons/user-performance`;
      const params = new URLSearchParams();
      if (performanceDateFrom) params.append('startDate', performanceDateFrom);
      if (performanceDateTo) params.append('endDate', performanceDateTo);
      if (params.toString()) perfUrl += '?' + params.toString();
      const r = await fetch(perfUrl, { headers }); 
      const d = await r.json(); 
      if (d.success) setUserPerformance(d.users || []); 
    } catch {}
  }, [token, performanceDateFrom, performanceDateTo]);

  useEffect(() => { 
    if (!token) { 
      router.push('/login'); 
      return; 
    }
    
    if (user && user.role !== 'admin' && user.role !== 'kitchen-owner') {
      router.push('/home');
      return;
    }
    
    if (user && (user.role === 'admin' || user.role === 'kitchen-owner')) {
      fetchAll();
    }
  }, [token, user, router]);

  const uploadVideo = async (file: File): Promise<string> => {
    setHsVideoUploading(true);
    const fd = new FormData(); fd.append('video', file);
    const res = await fetch(`${API_URL}/upload/upload-video`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json(); setHsVideoUploading(false);
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const saveHomestyle = async () => {
    if (hsVideos.length === 0) { alert('At least one video required'); return; }
    setHsSaving(true);
    const payload = { videoLinks: hsVideos, substituteVideoLinks: homestyle?.substituteVideoLinks || [], bestseller: homestyle?.bestseller || [], categories: homestyle?.categories || [] };
    const res = await fetch(`${API_URL}/homestyles`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json(); setHsSaving(false);
    if (data.success) { setHomestyle(data.data); alert('Saved!'); } else alert(data.error || 'Failed');
  };

  const uploadImage = async (file: File): Promise<string> => {
    setImgUploading(true);
    const fd = new FormData(); fd.append('image', file);
    const res = await fetch(`${API_URL}/upload/upload-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json(); setImgUploading(false);
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const saveKitchen = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body: any = { name: fd.get('name'), latitude: fd.get('latitude'), longitude: fd.get('longitude') };
    const ownerId = fd.get('ownerId') as string;
    if (ownerId) {
      body.ownerId = ownerId;
    }
    const isEdit = !!kitchenModal.data?._id;
    const url = isEdit ? `${API_URL}/admin/cloudkitchens/${kitchenModal.data._id}` : `${API_URL}/admin/cloudkitchens`;
    const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json(); setSaving(false);
    if (data.success) { setKitchenModal({ open: false, data: null }); fetchAll(); } else alert(data.error || 'Failed');
  };

  const saveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const phone = fd.get('phone') as string;
    
    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      setSaving(false);
      return;
    }
    
    const body: any = { 
      name: fd.get('name'), 
      phone, 
      password: fd.get('password'), 
      walletBalance: Number(fd.get('walletBalance')), 
      role: fd.get('role') 
    };
    
    // Add email only if provided
    const email = fd.get('email') as string;
    if (email && email.trim()) {
      body.email = email;
    }
    
    // Add assignedKitchen if role is kitchen-owner
    if (body.role === 'kitchen-owner') {
      const kitchenId = fd.get('assignedKitchen') as string;
      if (kitchenId) {
        body.assignedKitchen = kitchenId;
      }
    }
    
    const isEdit = !!userModal.data?._id;
    const url = isEdit ? `${API_URL}/admin/users/${userModal.data._id}` : `${API_URL}/admin/users`;
    const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json(); setSaving(false);
    if (data.success) { setUserModal({ open: false, data: null }); fetchAll(); } else alert(data.error || 'Failed');
  };

  const saveMenu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    
    const availableUntilDate = fd.get('availableUntilDate') as string;
    const availableUntil = availableUntilDate ? new Date(availableUntilDate).toISOString() : null;
    
    const discountValue = fd.get('discount') as string;
    const discount = discountValue ? Number(discountValue) : 0;
    
    const originalPriceValue = fd.get('originalPrice') as string;
    const originalPrice = originalPriceValue ? Number(originalPriceValue) : null;
    
    const ratingValue = fd.get('rating') as string;
    const rating = ratingValue ? Number(ratingValue) : 0;
    
    // Get all selected meal types
    const mealTypes: string[] = [];
    ['Breakfast', 'Lunch', 'Dinner', 'Instant'].forEach(type => {
      if (fd.get(`mealType_${type}`) === 'on') {
        mealTypes.push(type);
      }
    });
    
    if (mealTypes.length === 0) {
      alert('Please select at least one meal type');
      setSaving(false);
      return;
    }
    
    const body: any = {
      name: fd.get('name'), 
      description: fd.get('description'), 
      price: Number(fd.get('price')),
      originalPrice: originalPrice,
      discount: discount,
      image: imgPreview || fd.get('imageUrl'), 
      category: fd.get('category'), 
      mealTypes: mealTypes,
      isVeg: true,
      cloudKitchen: fd.get('cloudKitchen') || null,
      isSpecial: fd.get('isSpecial') === 'on', 
      isTodaySpecial: fd.get('isTodaySpecial') === 'on',
      ingredients: (fd.get('ingredients') as string)?.split(',').map(s => s.trim()).filter(Boolean),
      availableQuantity: Number(fd.get('availableQuantity')) || null,
      availableUntil: availableUntil,
      rating: rating
    };
    
    console.log('Saving menu with data:', body);
    
    const isEdit = !!menuModal.data?._id;
    const url = isEdit ? `${API_URL}/admin/menu/${menuModal.data._id}` : `${API_URL}/admin/menu`;
    const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json(); 
    
    console.log('Server response:', data);
    
    setSaving(false);
    if (data.success) { 
      setMenuModal({ open: false, data: null }); 
      setImgPreview(''); 
      fetchAll(); 
    } else {
      alert(data.error || 'Failed to save menu item');
    }
  };

  const isKitchenOwner = user?.role === 'kitchen-owner';
  const isAdmin = user?.role === 'admin';

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = isKitchenOwner ? [
    { id: 'stats', label: 'Overview', icon: BarChart2 },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
  ] : [
    { id: 'stats', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'kitchens', label: 'Kitchens', icon: Store, count: kitchens.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { id: 'schedules', label: 'Schedules', icon: CreditCard, count: scheduleOrders.length },
    { id: 'coupons', label: 'Coupons', icon: CreditCard, count: coupons.length },
    { id: 'homestyles', label: 'Video', icon: Home },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.length },
    { id: 'legal', label: 't&c, privacypolicy', icon: FileText },
  ];

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setSearch('');
    setOrderSearch('');
    setDateFilter('');
    setExpandedRow(null);
    setShowMoreMenu(false);
  };

  // Swipe navigation for mobile
  useSwipe({
    onSwipeLeft: () => {
      const currentIndex = tabs.findIndex(t => t.id === tab);
      if (currentIndex >= 0 && currentIndex < tabs.length - 1) {
        handleTabChange(tabs[currentIndex + 1].id);
      }
    },
    onSwipeRight: () => {
      const currentIndex = tabs.findIndex(t => t.id === tab);
      if (currentIndex > 0) {
        handleTabChange(tabs[currentIndex - 1].id);
      }
    },
  }, 80);

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition';

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center bg-white rounded-2xl p-10 shadow-sm max-w-sm">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{error}</h2>
        <button onClick={() => router.push('/home')} className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Go Home</button>
      </div>
    </div>
  );

  const commonProps = { fetchAll, headers, API_URL };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-full" style={{ background: 'linear-gradient(180deg, #1c1917 0%, #292524 100%)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}>T</div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Tiffica</p>
              <p className="text-[11px]" style={{ color: '#a8a29e' }}>{isKitchenOwner ? 'Kitchen Panel' : 'Admin Panel'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${tab === t.id ? 'text-orange-400' : 'hover:text-white text-stone-400'}`}
              style={tab === t.id ? { background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' } : { background: 'transparent', border: '1px solid transparent' }}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-stone-400'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}>A</div>
            <div className="flex-1 min-w-0">
              <p className="text-stone-300 text-xs font-semibold">{isKitchenOwner ? 'Kitchen Owner' : 'Admin'}</p>
              <p className="text-[10px] truncate" style={{ color: '#78716c' }}>{user?.email}</p>
              {isKitchenOwner && (user as any)?.assignedKitchen && (
                <p className="text-[9px] text-orange-400 mt-0.5">🏠 Kitchen Assigned</p>
              )}
            </div>
            <button onClick={() => { logout(); router.push('/login'); }} title="Logout" className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 transition" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-3.5 flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile logo (hidden on desktop since sidebar has it) */}
            <div className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow" style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}>T</div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900">{tabs.find(t => t.id === tab)?.label}</h1>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 hidden md:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {liveUsers > 0 && (
              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] md:text-xs font-semibold text-emerald-700">{liveUsers} live</span>
              </div>
            )}
            <button onClick={fetchAll} disabled={loading} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 pb-24 md:pb-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading data…</p>
            </div>
          )}

          {!loading && tab === 'stats' && stats && (
            <OverviewTab stats={stats} today={today} liveUsers={liveUsers} kitchens={kitchens} menuItems={menuItems} orders={orders} performanceDateFrom={performanceDateFrom} setPerformanceDateFrom={setPerformanceDateFrom} performanceDateTo={performanceDateTo} setPerformanceDateTo={setPerformanceDateTo} />
          )}
          {!loading && tab === 'users' && isAdmin && (
            <UsersTab 
              users={users} 
              search={search} 
              setSearch={setSearch} 
              expandedRow={expandedRow} 
              setExpandedRow={setExpandedRow} 
              setUserModal={(data: any) => {
                if (data.open) {
                  setSelectedUserRole(data.data?.role || 'user');
                }
                setUserModal(data);
              }}
            />
          )}
          {!loading && tab === 'orders' && (
            <OrdersTab orders={orders} expandedRow={expandedRow} setExpandedRow={setExpandedRow} search={orderSearch} setSearch={setOrderSearch} dateFilter={dateFilter} setDateFilter={setDateFilter} deliveryPartners={deliveryPartners} {...commonProps} />
          )}
          {!loading && tab === 'menu' && (
            <MenuTab menuItems={menuItems} search={search} setSearch={setSearch} expandedRow={expandedRow} setExpandedRow={setExpandedRow} setMenuModal={setMenuModal} setImgPreview={setImgPreview} kitchens={kitchens} {...commonProps} />
          )}
          {!loading && tab === 'kitchens' && isAdmin && (
            <KitchensTab kitchens={kitchens} menuItems={menuItems} setKitchenModal={setKitchenModal} {...commonProps} />
          )}
          {!loading && tab === 'subscriptions' && isAdmin && (
            <SubscriptionsTab subscriptions={subscriptions} expandedRow={expandedRow} setExpandedRow={setExpandedRow} {...commonProps} />
          )}
          {!loading && tab === 'schedules' && isAdmin && (
            <ScheduleOrdersTab scheduleOrders={scheduleOrders} expandedRow={expandedRow} setExpandedRow={setExpandedRow} search={orderSearch} setSearch={setOrderSearch} dateFilter={dateFilter} setDateFilter={setDateFilter} {...commonProps} />
          )}
          {!loading && tab === 'notifications' && isAdmin && (
            <NotificationsTab notifications={notifications} setNotifications={setNotifications} notifForm={notifForm} setNotifForm={setNotifForm} notifSaving={notifSaving} setNotifSaving={setNotifSaving} {...commonProps} />
          )}
          {!loading && tab === 'legal' && isAdmin && (
            <LegalTab legal={legal} setLegal={setLegal} legalSaving={legalSaving} setLegalSaving={setLegalSaving} {...commonProps} />
          )}
          {!loading && tab === 'homestyles' && isAdmin && (
            <HomestyleTab hsVideos={hsVideos} setHsVideos={setHsVideos} hsVideoUploading={hsVideoUploading} hsSaving={hsSaving} saveHomestyle={saveHomestyle} uploadVideo={uploadVideo} />
          )}
          {!loading && tab === 'coupons' && isAdmin && (
            <CouponsTab coupons={coupons} userPerformance={userPerformance} setCouponModal={setCouponModal} performanceDateFrom={performanceDateFrom} setPerformanceDateFrom={setPerformanceDateFrom} performanceDateTo={performanceDateTo} setPerformanceDateTo={setPerformanceDateTo} {...commonProps} />
          )}
        </main> 
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Home */}
          <button onClick={() => handleTabChange('stats')} className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${tab === 'stats' ? 'text-orange-600 bg-orange-50' : 'text-slate-400'}`}>
            <BarChart2 className={`w-6 h-6 ${tab === 'stats' ? 'text-orange-500' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">Home</span>
            {tab === 'stats' && <span className="w-1 h-1 rounded-full bg-orange-500 mt-1" />}
          </button>
          
          {/* Orders */}
          <button onClick={() => handleTabChange('orders')} className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${tab === 'orders' ? 'text-orange-600 bg-orange-50' : 'text-slate-400'}`}>
            <ShoppingBag className={`w-6 h-6 ${tab === 'orders' ? 'text-orange-500' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">Orders</span>
            {tab === 'orders' && <span className="w-1 h-1 rounded-full bg-orange-500 mt-1" />}
          </button>
          
          {/* Menu */}
          <button onClick={() => handleTabChange('menu')} className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${tab === 'menu' ? 'text-orange-600 bg-orange-50' : 'text-slate-400'}`}>
            <UtensilsCrossed className={`w-6 h-6 ${tab === 'menu' ? 'text-orange-500' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">Menu</span>
            {tab === 'menu' && <span className="w-1 h-1 rounded-full bg-orange-500 mt-1" />}
          </button>
          
          {/* More */}
          <button onClick={() => setShowMoreMenu(true)} className="flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all text-slate-400">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 rounded-sm bg-slate-400" />
                <div className="w-1.5 h-1.5 rounded-sm bg-slate-400" />
                <div className="w-1.5 h-1.5 rounded-sm bg-slate-400" />
                <div className="w-1.5 h-1.5 rounded-sm bg-slate-400" />
              </div>
            </div>
            <span className="text-[10px] font-semibold mt-1">More</span>
          </button>
        </div>
      </div>

      {/* More Menu Modal */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowMoreMenu(false)}>
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">All Sections</h3>
              <button onClick={() => setShowMoreMenu(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-slate-600 text-xl">×</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {tabs.filter(t => !['stats', 'orders', 'menu'].includes(t.id)).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all ${
                    tab === t.id ? 'bg-orange-50 text-orange-600 border-2 border-orange-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tab === t.id ? 'bg-orange-100' : 'bg-white'
                  }`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{t.label}</p>
                    {t.count !== undefined && (
                      <p className="text-xs text-slate-400 mt-0.5">{t.count} items</p>
                    )}
                  </div>
                  {tab === t.id && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </button>
              ))}
              
              <div className="pt-4 border-t border-slate-100 mt-4">
                <button 
                  onClick={() => { logout(); router.push('/login'); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-sm">Logout</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USER MODAL ── */}
      {userModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setUserModal({ open: false, data: null }); setSelectedUserRole('user'); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-slate-900 text-lg mb-5">{userModal.data ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={saveUser} className="space-y-3">
              <input name="name" defaultValue={userModal.data?.name || ''} required placeholder="Full Name" className={inputCls} />
              <input name="phone" defaultValue={userModal.data?.phone || ''} required placeholder="Mobile Number (10 digits)" type="tel" pattern="[0-9]{10}" maxLength={10} className={inputCls} />
              <input name="email" defaultValue={userModal.data?.email || ''} placeholder="Email Address (Optional)" type="email" className={inputCls} />
              <input name="password" placeholder={userModal.data ? 'Password (leave blank to keep current)' : 'Password (default: 123456)'} type="password" className={inputCls} />
              <input name="walletBalance" defaultValue={userModal.data?.walletBalance || '0'} placeholder="Wallet Balance (₹)" type="number" className={inputCls} />
              <select 
                name="role" 
                value={selectedUserRole}
                onChange={(e) => setSelectedUserRole(e.target.value)} 
                className={inputCls}
              >
                <option value="user">User</option>
                <option value="delivery">Delivery</option>
                <option value="kitchen-owner">Cloud Kitchen Owner</option>
                <option value="admin">Admin</option>
              </select>
              {selectedUserRole === 'kitchen-owner' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Assign Kitchen</label>
                  <select name="assignedKitchen" defaultValue={userModal.data?.assignedKitchen?._id || userModal.data?.assignedKitchen || ''} className={inputCls}>
                    <option value="">Select Kitchen (Optional)</option>
                    {kitchens.map(k => <option key={k._id} value={k._id}>{k.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setUserModal({ open: false, data: null }); setSelectedUserRole('user'); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition">{saving ? 'Saving…' : userModal.data ? 'Update User' : 'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KITCHEN MODAL ── */}
      {kitchenModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="font-bold text-slate-900 text-lg mb-5">{kitchenModal.data ? 'Edit Kitchen' : 'Add Kitchen'}</h2>
            <form onSubmit={saveKitchen} className="space-y-3">
              <input name="name" defaultValue={kitchenModal.data?.name || ''} required placeholder="Kitchen Name" className={inputCls} />
              <input name="latitude" defaultValue={kitchenModal.data?.location?.coordinates?.[1] || ''} required placeholder="Latitude" type="number" step="any" className={inputCls} />
              <input name="longitude" defaultValue={kitchenModal.data?.location?.coordinates?.[0] || ''} required placeholder="Longitude" type="number" step="any" className={inputCls} />
              <select name="ownerId" defaultValue={kitchenModal.data?.owner?._id || kitchenModal.data?.owner || ''} className={inputCls}>
                <option value="">Select Kitchen Owner (Optional)</option>
                {users.filter(u => u.role === 'kitchen-owner').map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setKitchenModal({ open: false, data: null })} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MENU MODAL ── */}
      {menuModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 my-4 shadow-2xl">
            <h2 className="font-bold text-slate-900 text-lg mb-5">{menuModal.data ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <form onSubmit={saveMenu} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Image</label>
                <div className="flex items-center gap-3">
                  <img src={imgPreview || menuModal.data?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'} alt="preview" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }} />
                  <label className="cursor-pointer flex-1 py-3 border-2 border-dashed border-orange-300 rounded-xl text-center text-xs font-bold text-orange-500 hover:bg-orange-50 transition">
                    {imgUploading ? 'Uploading…' : '📷 Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const url = await uploadImage(f); setImgPreview(url); } catch { alert('Upload failed'); } }} disabled={imgUploading} />
                  </label>
                  {(imgPreview || menuModal.data?.image) && <input type="hidden" name="imageUrl" value={imgPreview || menuModal.data?.image || ''} />}
                </div>
              </div>
              <input name="name" defaultValue={menuModal.data?.name || ''} required placeholder="Item Name" className={inputCls} />
              <textarea name="description" defaultValue={menuModal.data?.description || ''} placeholder="Description" rows={2} className={`${inputCls} resize-none`} />
              <div className="grid grid-cols-3 gap-3">
                <input name="price" defaultValue={menuModal.data?.price || ''} required placeholder="Price (₹)" type="number" className={inputCls} />
                <input name="originalPrice" defaultValue={menuModal.data?.originalPrice || ''} placeholder="Original (₹)" type="number" min="0" className={inputCls} />
                <input name="discount" defaultValue={menuModal.data?.discount || ''} placeholder="Discount %" type="number" min="0" max="100" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Rating</label>
                <input 
                  name="rating" 
                  defaultValue={menuModal.data?.rating || '0'} 
                  placeholder="Rating (0-5)" 
                  type="number" 
                  min="0" 
                  max="5" 
                  step="0.1"
                  className={inputCls} 
                />
              </div>
              <input name="ingredients" defaultValue={menuModal.data?.ingredients?.join(', ') || ''} placeholder="Ingredients (comma separated)" className={inputCls} />
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Meal Types (Select Multiple)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Instant'].map(type => (
                    <label key={type} className="flex items-center gap-2 p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 transition">
                      <input 
                        type="checkbox" 
                        name={`mealType_${type}`}
                        defaultChecked={menuModal.data?.mealTypes?.includes(type) || menuModal.data?.mealType === type}
                        className="accent-orange-500 w-4 h-4" 
                      />
                      <span className="font-medium text-slate-700 text-sm">{type}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">💡 Select "Instant" to show in instant orders, "Lunch/Dinner" for schedule</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Category</label>
                <select name="category" defaultValue={menuModal.data?.category || 'dal'} className={inputCls}>
                  <option value="dal">Dal</option><option value="sabji">Sabji</option><option value="raita">Raita</option><option value="roti">Roti</option><option value="Veg">Veg</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Availability</label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    name="availableQuantity" 
                    defaultValue={menuModal.data?.availableQuantity || ''} 
                    placeholder="Quantity" 
                    type="number" 
                    min="0"
                    className={inputCls} 
                  />
                  <input 
                    name="availableUntilDate" 
                    defaultValue={menuModal.data?.availableUntil ? new Date(menuModal.data.availableUntil).toISOString().slice(0, 16) : ''} 
                    type="datetime-local" 
                    className={inputCls} 
                  />
                </div>
              </div>
              
              <div className="flex gap-5 text-sm py-1">
                {[
                  { name: 'isSpecial', label: 'Special', checked: !!menuModal.data?.isSpecial },
                  { name: 'isTodaySpecial', label: "Today's Special", checked: !!menuModal.data?.isTodaySpecial },
                ].map(opt => (
                  <label key={opt.name} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" name={opt.name} defaultChecked={opt.checked} className="accent-orange-500 w-4 h-4" />
                    <span className="font-medium text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setMenuModal({ open: false, data: null }); setImgPreview(''); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving || imgUploading} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COUPON MODAL ── */}
      {couponModal.open && (
        <CouponModal 
          couponModal={couponModal}
          setCouponModal={setCouponModal}
          userPerformance={userPerformance}
          fetchAll={fetchAll}
          headers={headers}
          API_URL={API_URL}
          saving={saving}
          setSaving={setSaving}
          inputCls={inputCls}
          uploadImage={uploadImage}
          imgUploading={imgUploading}
        />
      )}
    </div>
  );
}
