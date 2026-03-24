'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Users, ShoppingBag, UtensilsCrossed, CreditCard,
  Store, BarChart2, LogOut, RefreshCw, Search, ChevronDown, ChevronUp, Home, Trash2, Bell
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Tab = 'stats' | 'users' | 'orders' | 'menu' | 'kitchens' | 'subscriptions' | 'homestyles' | 'notifications';

interface Stats {
  users: number;
  orders: number;
  menuItems: number;
  subscriptions: number;
}

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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [today, setToday] = useState<any>(null);
  const [liveUsers, setLiveUsers] = useState<number>(0);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', targetAll: true });
  const [notifSaving, setNotifSaving] = useState(false);

  // Homestyles state
  const [homestyle, setHomestyle] = useState<any>(null);
  const [hsVideos, setHsVideos] = useState<string[]>([]);
  const [hsVideoUploading, setHsVideoUploading] = useState(false);
  const [hsSaving, setHsSaving] = useState(false);

  // Modal state
  const [kitchenModal, setKitchenModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [menuModal, setMenuModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string>('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [sRes, uRes, oRes, mRes, kRes, subRes, todayRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers }),
        fetch(`${API_URL}/admin/menu`, { headers }),
        fetch(`${API_URL}/admin/cloudkitchens`, { headers }),
        fetch(`${API_URL}/admin/subscriptions`, { headers }),
        fetch(`${API_URL}/admin/today`, { headers }),
      ]);

      if (sRes.status === 403) { setError('Access denied. Admin only.'); setLoading(false); return; }

      const [s, u, o, m, k, sub, t] = await Promise.all([
        sRes.json(), uRes.json(), oRes.json(), mRes.json(), kRes.json(), subRes.json(), todayRes.json()
      ]);

      if (s.stats) setStats(s.stats);
      if (u.users) setUsers(u.users);
      if (o.orders) setOrders(o.orders);
      if (m.items) setMenuItems(m.items);
      if (k.kitchens) setKitchens(k.kitchens);
      if (sub.subscriptions) setSubscriptions(sub.subscriptions);
      if (t.success) { setToday(t); setLiveUsers(t.liveUsers || 0); }
    } catch {
      setError('Failed to load data. Check server connection.');
    }
    setLoading(false);
    // fetch homestyles separately
    try {
      const hsRes = await fetch(`${API_URL}/homestyles`);
      const hsData = await hsRes.json();
      if (hsData.success && hsData.data) {
        setHomestyle(hsData.data);
        setHsVideos(hsData.data.videoLinks || []);
      }
    } catch {}
    // fetch notifications
    try {
      const nRes = await fetch(`${API_URL}/notifications/admin`, { headers });
      const nData = await nRes.json();
      if (nData.success) setNotifications(nData.notifications || []);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchAll();
  }, [token, fetchAll, router]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const uploadVideo = async (file: File): Promise<string> => {
    setHsVideoUploading(true);
    const fd = new FormData();
    fd.append('video', file);
    const res = await fetch(`${API_URL}/upload/upload-video`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json();
    setHsVideoUploading(false);
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const saveHomestyle = async () => {
    if (hsVideos.length === 0) { alert('At least one video required'); return; }
    setHsSaving(true);
    const payload = { videoLinks: hsVideos, substituteVideoLinks: homestyle?.substituteVideoLinks || [], bestseller: homestyle?.bestseller || [], categories: homestyle?.categories || [] };
    const res = await fetch(`${API_URL}/homestyles`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setHsSaving(false);
    if (data.success) { setHomestyle(data.data); alert('Saved!'); } else alert(data.error || 'Failed');
  };
  // Upload image to Cloudinary via backend
  const uploadImage = async (file: File): Promise<string> => {
    setImgUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_URL}/upload/upload-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json();
    setImgUploading(false);
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  // Save kitchen (add or edit)
  const saveKitchen = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = { name: fd.get('name'), latitude: fd.get('latitude'), longitude: fd.get('longitude') };
    const isEdit = !!kitchenModal.data?._id;
    const url = isEdit ? `${API_URL}/admin/cloudkitchens/${kitchenModal.data._id}` : `${API_URL}/admin/cloudkitchens`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setKitchenModal({ open: false, data: null }); fetchAll(); }
    else alert(data.error || 'Failed');
  };

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setImgPreview(url);
    } catch { alert('Image upload failed'); }
  };

  // Save menu item (add or edit)
  const saveMenu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body: any = {
      name: fd.get('name'), description: fd.get('description'), price: Number(fd.get('price')),
      image: imgPreview || fd.get('imageUrl'), category: fd.get('category'), mealType: fd.get('mealType'),
      cloudKitchen: fd.get('cloudKitchen') || null,
      isSpecial: fd.get('isSpecial') === 'on', isTodaySpecial: fd.get('isTodaySpecial') === 'on',
      isAvailable: fd.get('isAvailable') === 'on',
      ingredients: (fd.get('ingredients') as string)?.split(',').map(s => s.trim()).filter(Boolean),
    };
    const isEdit = !!menuModal.data?._id;
    const url = isEdit ? `${API_URL}/admin/menu/${menuModal.data._id}` : `${API_URL}/admin/menu`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setMenuModal({ open: false, data: null }); setImgPreview(''); fetchAll(); }
    else alert(data.error || 'Failed');
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    active: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-600',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'stats', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'kitchens', label: 'Kitchens', icon: Store, count: kitchens.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { id: 'homestyles', label: 'Home Page', icon: Home },
    { id: 'notifications', label: 'Notifs', icon: Bell, count: notifications.length },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
          <button onClick={() => router.push('/home')} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-extrabold">🛠 Admin Dashboard</h1>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} disabled={loading} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { logout(); router.push('/login'); }} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 sticky top-[60px] h-[calc(100vh-60px)] py-4 gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                tab === t.id ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <t.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{t.label}</span>
              {t.count !== undefined && (
                <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </aside>

      <div className="flex-1 p-4 pb-24 md:pb-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {/* OVERVIEW */}
        {!loading && tab === 'stats' && stats && (
          <div className="space-y-5">

            {/* Live users banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wide">Live on App Right Now</p>
                <p className="text-4xl font-black text-white mt-1">{liveUsers}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
            </div>

            {/* All-time stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Users',    value: stats.users,         icon: '👤', color: 'bg-blue-50   text-blue-600'   },
                { label: 'Total Orders',   value: stats.orders,        icon: '📦', color: 'bg-orange-50 text-orange-600' },
                { label: 'Menu Items',     value: stats.menuItems,     icon: '🍽️', color: 'bg-green-50  text-green-600'  },
                { label: 'Subscriptions',  value: stats.subscriptions, icon: '💳', color: 'bg-purple-50 text-purple-600' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Today's summary */}
            {today && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-900">📅 Today — {today.date}</h3>
                  <span className="text-xs text-gray-400">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-50">
                  {[
                    { label: 'Revenue',   value: `₹${today.summary.revenue.toLocaleString()}`, color: 'text-green-600' },
                    { label: 'Orders',    value: today.summary.totalOrders,                     color: 'text-orange-600' },
                    { label: 'Scheduled', value: today.summary.scheduledMeals,                  color: 'text-blue-600' },
                  ].map(s => (
                    <div key={s.label} className="p-4 text-center">
                      <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-50 border-t border-gray-50">
                  {[
                    { label: 'Pending',   value: today.summary.pending,   color: 'text-yellow-600' },
                    { label: 'Delivered', value: today.summary.delivered, color: 'text-green-600'  },
                    { label: 'Cancelled', value: today.summary.cancelled, color: 'text-red-500'    },
                  ].map(s => (
                    <div key={s.label} className="p-3 text-center">
                      <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's scheduled meals */}
            {today?.scheduledOrders?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <h3 className="font-extrabold text-gray-900">🗓 Scheduled Meals Today</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{today.summary.scheduledMeals} meal slots locked</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {today.scheduledOrders.map((s: any) => (
                    <div key={s._id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-900">{s.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{s.user?.phone}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {s.meals.map((m: any, i: number) => (
                          <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                            m.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' :
                            m.mealType === 'Lunch'     ? 'bg-orange-100 text-orange-700' :
                                                         'bg-indigo-100 text-indigo-700'
                          }`}>
                            <span>{m.mealType === 'Breakfast' ? '☕' : m.mealType === 'Lunch' ? '🍽️' : '🍛'}</span>
                            <span>{m.menuItem?.name || m.mealType}</span>
                            {m.menuItem?.price && <span className="opacity-70">₹{m.menuItem.price}</span>}
                          </div>
                        ))}
                      </div>
                      {s.meals[0]?.deliveryAddress?.fullAddress && (
                        <p className="text-xs text-gray-400 mt-1.5">📍 {s.meals[0].deliveryAddress.fullAddress}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's instant orders */}
            {today?.instantOrders?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <h3 className="font-extrabold text-gray-900">⚡ Instant Orders Today</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{today.instantOrders.length} orders placed</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {today.instantOrders.map((o: any) => (
                    <div key={o._id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{o.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-orange-600">₹{o.totalAmount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          o.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                          o.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                     'bg-blue-100 text-blue-700'
                        }`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">All-Time Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Cloud Kitchens</span><span className="font-bold text-gray-900">{kitchens.length}</span></div>
                <div className="flex justify-between"><span>Active Menu Items</span><span className="font-bold text-gray-900">{menuItems.filter(i => i.isAvailable).length}</span></div>
                <div className="flex justify-between"><span>Total Revenue</span><span className="font-bold text-gray-900">₹{orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && tab === 'users' && (
          <div>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="flex-1 text-sm focus:outline-none" />
            </div>
            <div className="space-y-3">
              {users.filter(u =>
                !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.phone?.includes(search)
              ).map(u => (
                <div key={u._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedRow(expandedRow === u._id ? null : u._id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{u.phone}</p>
                      {u.isPremium && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Premium</span>}
                    </div>
                    {expandedRow === u._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedRow === u._id && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 text-xs text-gray-600 space-y-1.5">
                      <div className="flex justify-between"><span>User ID</span><span className="font-mono text-gray-400">{u._id}</span></div>
                      <div className="flex justify-between"><span>Wallet Balance</span><span className="font-bold text-green-600">₹{u.walletBalance || 0}</span></div>
                      <div className="flex justify-between"><span>Addresses</span><span>{u.addresses?.length || 0} saved</span></div>
                      <div className="flex justify-between"><span>Location</span><span>{u.currentLocation?.locationName || 'Not set'}</span></div>
                      <div className="flex justify-between"><span>Joined</span><span>{fmt(u.createdAt)}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {!loading && tab === 'orders' && (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                      <span className="text-xs text-gray-400">{fmtTime(o.createdAt)}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{o.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{o.user?.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)}>
                    <p className="font-extrabold text-orange-600">₹{o.totalAmount}</p>
                    <p className="text-xs text-gray-400">{o.items?.length} item(s)</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this order?')) return;
                      const res = await fetch(`${API_URL}/admin/orders/${o._id}`, { method: 'DELETE', headers });
                      const d = await res.json();
                      if (d.success) fetchAll(); else alert(d.error || 'Failed');
                    }}
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg font-bold flex-shrink-0"
                  >Del</button>
                  <div className="cursor-pointer flex-shrink-0" onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)}>
                    {expandedRow === o._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedRow === o._id && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 text-xs text-gray-600 space-y-1.5">
                    <div className="flex justify-between"><span>Order ID</span><span className="font-mono text-gray-400">{o._id}</span></div>
                    <div className="flex justify-between"><span>Payment</span><span className={`font-bold ${statusColor[o.paymentStatus] || ''}`}>{o.paymentMethod} · {o.paymentStatus}</span></div>
                    <div className="flex justify-between"><span>Delivery Fee</span><span>₹{o.deliveryFee || 0}</span></div>
                    <div className="flex justify-between"><span>Discount</span><span>₹{o.discount || 0}</span></div>
                    <div className="flex justify-between"><span>Final Amount</span><span className="font-bold text-gray-900">₹{o.finalAmount}</span></div>
                    {o.deliveryAddress && (
                      <div className="flex justify-between"><span>Address</span><span className="text-right max-w-[60%]">{[o.deliveryAddress.street, o.deliveryAddress.city, o.deliveryAddress.state].filter(Boolean).join(', ')}</span></div>
                    )}
                    {o.specialInstructions && (
                      <div className="flex justify-between"><span>Instructions</span><span>{o.specialInstructions}</span></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MENU ITEMS */}
        {!loading && tab === 'menu' && (
          <div>
            <button
              onClick={() => { setMenuModal({ open: true, data: null }); setImgPreview(''); }}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm mb-3"
            >+ Add Menu Item</button>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu…" className="flex-1 text-sm focus:outline-none" />
            </div>
            <div className="space-y-3">
              {menuItems.filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase())).map(m => (
                <div key={m._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === m._id ? null : m._id)}
                    >
                      <img
                        src={m.image?.startsWith('http') ? m.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
                        alt={m.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.mealType} · {m.category}</p>
                        {m.cloudKitchen && <p className="text-xs text-orange-400">🏠 {m.cloudKitchen.name}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-extrabold text-orange-600">₹{m.price}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${m.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {m.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setImgPreview(''); setMenuModal({ open: true, data: m }); }}
                      className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-lg font-bold flex-shrink-0"
                    >Edit</button>
                    <div className="cursor-pointer flex-shrink-0" onClick={() => setExpandedRow(expandedRow === m._id ? null : m._id)}>
                      {expandedRow === m._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {expandedRow === m._id && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 text-xs text-gray-600 space-y-1.5">
                      <div className="flex justify-between"><span>Item ID</span><span className="font-mono text-gray-400">{m._id}</span></div>
                      <div className="flex justify-between"><span>Description</span><span className="text-right max-w-[60%]">{m.description}</span></div>
                      <div className="flex justify-between"><span>Rating</span><span>⭐ {m.rating || 0}/5</span></div>
                      <div className="flex justify-between"><span>Special</span><span>{m.isSpecial ? '✅ Yes' : 'No'}</span></div>
                      <div className="flex justify-between"><span>Today Special</span><span>{m.isTodaySpecial ? '✅ Yes' : 'No'}</span></div>
                      {m.ingredients?.length > 0 && (
                        <div className="flex justify-between"><span>Ingredients</span><span className="text-right max-w-[60%]">{m.ingredients.join(', ')}</span></div>
                      )}
                      <div className="flex justify-between"><span>Added</span><span>{fmt(m.createdAt)}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLOUD KITCHENS */}
        {!loading && tab === 'kitchens' && (
          <div className="space-y-3">
            <button
              onClick={() => setKitchenModal({ open: true, data: null })}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm"
            >+ Add Cloud Kitchen</button>
            {kitchens.map(k => (
              <div key={k._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === k._id ? null : k._id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white text-lg flex-shrink-0">
                      🏠
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{k.name}</p>
                      <p className="text-xs text-gray-500">
                        {k.location?.coordinates ? `${k.location.coordinates[1].toFixed(4)}, ${k.location.coordinates[0].toFixed(4)}` : 'No location'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">{fmt(k.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setKitchenModal({ open: true, data: k })}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-lg font-bold flex-shrink-0"
                  >Edit</button>
                  <div className="cursor-pointer flex-shrink-0" onClick={() => setExpandedRow(expandedRow === k._id ? null : k._id)}>
                    {expandedRow === k._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedRow === k._id && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 text-xs text-gray-600 space-y-1.5">
                    <div className="flex justify-between"><span>Kitchen ID</span><span className="font-mono text-gray-400">{k._id}</span></div>
                    <div className="flex justify-between"><span>Longitude</span><span>{k.location?.coordinates?.[0]}</span></div>
                    <div className="flex justify-between"><span>Latitude</span><span>{k.location?.coordinates?.[1]}</span></div>
                    <div className="flex justify-between"><span>Menu Items</span><span>{menuItems.filter(m => m.cloudKitchen?._id === k._id || m.cloudKitchen === k._id).length}</span></div>
                    <div className="flex justify-between"><span>Created</span><span>{fmtTime(k.createdAt)}</span></div>
                  </div>
                )}
              </div>
            ))}
            {kitchens.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🏠</p>
                <p className="font-semibold">No cloud kitchens yet</p>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {!loading && tab === 'subscriptions' && (
          <div className="space-y-3">
            {subscriptions.map(s => (
              <div key={s._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColor[s.status] || 'bg-gray-100 text-gray-600'}`}>
                        {s.status || 'active'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{s.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{s.user?.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                    <p className="font-extrabold text-purple-600">₹{s.amount || s.totalAmount || 0}</p>
                    <p className="text-xs text-gray-400">{fmt(s.createdAt)}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this subscription?')) return;
                      const res = await fetch(`${API_URL}/admin/subscriptions/${s._id}`, { method: 'DELETE', headers });
                      const d = await res.json();
                      if (d.success) fetchAll(); else alert(d.error || 'Failed');
                    }}
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg font-bold flex-shrink-0"
                  >Del</button>
                  <div className="cursor-pointer flex-shrink-0" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                    {expandedRow === s._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedRow === s._id && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 text-xs text-gray-600 space-y-1.5">
                    <div className="flex justify-between"><span>Sub ID</span><span className="font-mono text-gray-400">{s._id}</span></div>
                    <div className="flex justify-between"><span>Plan</span><span className="font-bold">{s.plan || s.planName || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Duration</span><span>{s.duration || s.days || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Start Date</span><span>{s.startDate ? fmt(s.startDate) : 'N/A'}</span></div>
                    <div className="flex justify-between"><span>End Date</span><span>{s.endDate ? fmt(s.endDate) : 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Payment</span><span className={statusColor[s.paymentStatus] || ''}>{s.paymentStatus || 'N/A'}</span></div>
                  </div>
                )}
              </div>
            ))}
            {subscriptions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">💳</p>
                <p className="font-semibold">No subscriptions yet</p>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {!loading && tab === 'notifications' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-extrabold text-gray-900">🔔 Create Notification</h3>
              <input
                placeholder="Title"
                value={notifForm.title}
                onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              />
              <textarea
                placeholder="Message"
                rows={3}
                value={notifForm.message}
                onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
              <select
                value={notifForm.type}
                onChange={e => setNotifForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="info">ℹ️ Info</option>
                <option value="offer">🎁 Offer</option>
                <option value="order">📦 Order</option>
                <option value="alert">⚠️ Alert</option>
              </select>
              <button
                disabled={notifSaving || !notifForm.title || !notifForm.message}
                onClick={async () => {
                  setNotifSaving(true);
                  try {
                    const res = await fetch(`${API_URL}/notifications/admin`, {
                      method: 'POST',
                      headers: { ...headers, 'Content-Type': 'application/json' },
                      body: JSON.stringify(notifForm),
                    });
                    const d = await res.json();
                    if (d.success) {
                      setNotifForm({ title: '', message: '', type: 'info', targetAll: true });
                      setNotifications(n => [d.notification, ...n]);
                    } else alert(d.error || 'Failed');
                  } catch { alert('Failed'); }
                  setNotifSaving(false);
                }}
                className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm disabled:opacity-60"
              >
                {notifSaving ? 'Sending…' : '🚀 Send to All Users'}
              </button>
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sent ({notifications.length})</p>
            {notifications.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">🔔</p>
                <p className="font-semibold">No notifications sent yet</p>
              </div>
            )}
            {notifications.map(n => {
              const typeEmoji: Record<string, string> = { info: 'ℹ️', offer: '🎁', order: '📦', alert: '⚠️' };
              return (
                <div key={n._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{typeEmoji[n.type] || 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">{n.readBy?.length || 0} read</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete?')) return;
                      const res = await fetch(`${API_URL}/notifications/admin/${n._id}`, { method: 'DELETE', headers });
                      const d = await res.json();
                      if (d.success) setNotifications(prev => prev.filter(x => x._id !== n._id));
                    }}
                    className="p-1.5 bg-red-50 text-red-400 rounded-lg flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* HOMESTYLES */}
        {!loading && tab === 'homestyles' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-extrabold text-gray-900">🏠 Home Page Settings</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900">🎬 Hero Videos</h3>
                <label className="cursor-pointer px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-xl">
                  {hsVideoUploading ? 'Uploading…' : '+ Upload Video'}
                  <input type="file" accept="video/*" className="hidden" disabled={hsVideoUploading}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try { const url = await uploadVideo(file); setHsVideos(v => [...v, url]); }
                      catch { alert('Video upload failed'); }
                    }}
                  />
                </label>
              </div>
              {hsVideos.length === 0 && <p className="text-xs text-gray-400">No videos yet</p>}
              <div className="space-y-2">
                {hsVideos.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                    <video src={url} className="w-20 h-12 rounded-lg object-cover flex-shrink-0" />
                    <p className="w-0 flex-1 text-xs text-gray-500 truncate overflow-hidden">{url}</p>
                    <button onClick={() => setHsVideos(v => v.filter((_, idx) => idx !== i))} className="p-1.5 bg-red-100 text-red-500 rounded-lg flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={saveHomestyle} disabled={hsSaving} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm disabled:opacity-60">
              {hsSaving ? 'Saving…' : '💾 Save Home Page'}
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Bottom tab bar — mobile only */}
      {/* Kitchen Modal */}
      {kitchenModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h2 className="font-extrabold text-gray-900 mb-4">{kitchenModal.data ? 'Edit Kitchen' : 'Add Kitchen'}</h2>
            <form onSubmit={saveKitchen} className="space-y-3">
              <input name="name" defaultValue={kitchenModal.data?.name || ''} required placeholder="Kitchen Name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              <input name="latitude" defaultValue={kitchenModal.data?.location?.coordinates?.[1] || ''} required placeholder="Latitude" type="number" step="any" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              <input name="longitude" defaultValue={kitchenModal.data?.location?.coordinates?.[0] || ''} required placeholder="Longitude" type="number" step="any" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setKitchenModal({ open: false, data: null })} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {menuModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 my-4">
            <h2 className="font-extrabold text-gray-900 mb-4">{menuModal.data ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <form onSubmit={saveMenu} className="space-y-3">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={imgPreview || menuModal.data?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer block w-full py-2 border-2 border-dashed border-orange-300 rounded-xl text-center text-xs font-bold text-orange-500 hover:bg-orange-50 transition">
                      {imgUploading ? 'Uploading…' : '📷 Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImgChange} disabled={imgUploading} />
                    </label>
                    {(imgPreview || menuModal.data?.image) && (
                      <input type="hidden" name="imageUrl" value={imgPreview || menuModal.data?.image || ''} />
                    )}
                  </div>
                </div>
              </div>
              <input name="name" defaultValue={menuModal.data?.name || ''} required placeholder="Item Name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              <textarea name="description" defaultValue={menuModal.data?.description || ''} placeholder="Description" rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <input name="price" defaultValue={menuModal.data?.price || ''} required placeholder="Price (₹)" type="number" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
                <select name="mealType" defaultValue={menuModal.data?.mealType || 'Lunch'} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select name="category" defaultValue={menuModal.data?.category || 'dal'} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                  <option value="dal">Dal</option>
                  <option value="sabji">Sabji</option>
                  <option value="raita">Raita</option>
                  <option value="roti">Roti</option>
                </select>
                <select name="cloudKitchen" defaultValue={menuModal.data?.cloudKitchen?._id || menuModal.data?.cloudKitchen || ''} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                  <option value="">No Kitchen</option>
                  {kitchens.map(k => <option key={k._id} value={k._id}>{k.name}</option>)}
                </select>
              </div>
              <input name="ingredients" defaultValue={menuModal.data?.ingredients?.join(', ') || ''} placeholder="Ingredients (comma separated)" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isAvailable" defaultChecked={menuModal.data?.isAvailable !== false} className="accent-orange-500" />
                  <span className="font-medium text-gray-700">Available</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isSpecial" defaultChecked={!!menuModal.data?.isSpecial} className="accent-orange-500" />
                  <span className="font-medium text-gray-700">Special</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isTodaySpecial" defaultChecked={!!menuModal.data?.isTodaySpecial} className="accent-orange-500" />
                  <span className="font-medium text-gray-700">Today Special</span>
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setMenuModal({ open: false, data: null }); setImgPreview(''); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving || imgUploading} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold transition ${
              tab === t.id ? 'text-orange-600' : 'text-gray-400'
            }`}
          >
            <t.icon className="w-5 h-5 mb-0.5" />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
