'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSwipe } from '@/hooks/useSwipe';
import { Users, ShoppingBag, UtensilsCrossed, CreditCard, Store, BarChart2, LogOut, RefreshCw, Home, Bell, FileText, Tag, Activity, Volume2, VolumeX, TrendingUp, FileEdit, User, Lock, Camera, Sparkles } from 'lucide-react';
import {
  OverviewTab, UsersTab, OrdersTab, MenuTab, KitchensTab,
  SubscriptionsTab, NotificationsTab, LegalTab, HomestyleTab, CouponsTab, ScheduleOrdersTab, LeadsTab,
  EarningsTab
} from './AdminContent';
import { CouponModal } from './CouponModal';
import { notificationSound, showAdminNotification } from '@/lib/notificationSound';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';
type Tab = 'stats' | 'users' | 'orders' | 'menu' | 'drafts' | 'kitchens' | 'subscriptions' | 'schedules' | 'homestyles' | 'notifications' | 'legal' | 'coupons' | 'leads' | 'earnings';
interface Stats { users: number; orders: number; menuItems: number; subscriptions: number; totalWalletBalance?: number; }

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('stats');
  useEffect(() => {
    if (user?.role === 'kitchen-owner' && tab === 'stats') {
      setTab('orders');
    }
  }, [user]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [scheduleOrders, setScheduleOrders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsStatusFilter, setLeadsStatusFilter] = useState('');
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
  const [menuFormDirty, setMenuFormDirty] = useState(false);
  const [userModal, setUserModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [selectedUserRole, setSelectedUserRole] = useState('user');
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string>('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGenerateDisabled, setIsGenerateDisabled] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [performanceDateFrom, setPerformanceDateFrom] = useState('');
  const [performanceDateTo, setPerformanceDateTo] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [userPerformance, setUserPerformance] = useState<any[]>([]);
  const [couponModal, setCouponModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [lastScheduleCount, setLastScheduleCount] = useState(0);
  const [lastUserCount, setLastUserCount] = useState(0);
  const [lastSubscriptionCount, setLastSubscriptionCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Array<{ id: string, type: string, message: string, time: Date }>>([]);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      console.log('📋 Admin fetchAll started...');

      const [sRes, uRes, oRes, mRes, kRes, subRes, todayRes, dpRes, schedRes, leadsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers }),
        fetch(`${API_URL}/admin/menu`, { headers }),
        fetch(`${API_URL}/admin/cloudkitchens`, { headers }),
        fetch(`${API_URL}/admin/subscriptions`, { headers }),
        fetch(`${API_URL}/admin/today`, { headers }),
        fetch(`${API_URL}/admin/delivery-partners`, { headers }),
        fetch(`${API_URL}/admin/schedules`, { headers }),
        fetch(`${API_URL}/leads`, { headers }),
      ]);

      console.log('📋 API responses status:', {
        stats: sRes.status,
        users: uRes.status,
        orders: oRes.status,
        menu: mRes.status,
        kitchens: kRes.status,
        subscriptions: subRes.status,
        today: todayRes.status,
        deliveryPartners: dpRes.status,
        schedules: schedRes.status,
        leads: leadsRes.status
      });

      if (sRes.status === 403) { setError('Access denied. Admin only.'); setLoading(false); return; }

      const [s, u, o, m, k, sub, t, dp, sched, leadsData] = await Promise.all([
        sRes.json(), uRes.json(), oRes.json(), mRes.json(), kRes.json(),
        subRes.json(), todayRes.json(), dpRes.json(), schedRes.json(), leadsRes.json()
      ]);

      console.log('📋 API responses data:', {
        stats: s.success ? 'OK' : s.error,
        users: u.success ? `${u.users?.length || 0} users` : u.error,
        orders: o.success ? `${o.orders?.length || 0} orders` : o.error,
        menu: m.success ? `${m.items?.length || 0} items` : m.error,
        kitchens: k.success ? `${k.kitchens?.length || 0} kitchens` : k.error,
        subscriptions: sub.success ? `${sub.subscriptions?.length || 0} subs` : sub.error,
        today: t.success ? 'OK' : t.error,
        deliveryPartners: dp.success ? `${dp.partners?.length || 0} partners` : dp.error,
        schedules: sched.success ? `${sched.schedules?.length || 0} schedules` : sched.error,
        leads: leadsData.success ? `${leadsData.data?.length || 0} leads` : leadsData.error
      });

      if (s.stats) setStats(s.stats);
      if (u.users) {
        // Check for new users and play sound
        if (lastUserCount > 0 && u.users.length > lastUserCount && soundEnabled) {
          const newUserCount = u.users.length - lastUserCount;
          showAdminNotification('NEW_USER', `user(s) registered`, newUserCount);
        }
        setUsers(u.users);
        setLastUserCount(u.users.length);
      }
      if (o.success && o.orders) {
        // Check for new orders and play sound
        if (lastOrderCount > 0 && o.orders.length > lastOrderCount && soundEnabled) {
          const newOrderCount = o.orders.length - lastOrderCount;
          showAdminNotification('NEW_ORDER', `order(s) received`, newOrderCount);
        }
        setOrders(o.orders);
        setLastOrderCount(o.orders.length);
        console.log('✅ Orders loaded in admin:', o.orders.length);
      } else {
        console.error('❌ Orders API error:', o.error || 'Unknown error');
        setOrders([]);
      }
      if (m.items) setMenuItems(m.items);
      if (k.kitchens) setKitchens(k.kitchens);
      if (sub.subscriptions) {
        // Check for new subscriptions and play sound
        if (lastSubscriptionCount > 0 && sub.subscriptions.length > lastSubscriptionCount && soundEnabled) {
          const newSubCount = sub.subscriptions.length - lastSubscriptionCount;
          showAdminNotification('NEW_SUBSCRIPTION', `subscription(s) purchased`, newSubCount);
        }
        setSubscriptions(sub.subscriptions);
        setLastSubscriptionCount(sub.subscriptions.length);
      }
      if (t.success) { setToday(t); setLiveUsers(t.liveUsers || 0); }
      if (dp.success) setDeliveryPartners(dp.partners || []);
      if (sched.success) {
        // Check for new schedule orders and play sound
        if (lastScheduleCount > 0 && (sched.schedules || []).length > lastScheduleCount && soundEnabled) {
          const newScheduleCount = (sched.schedules || []).length - lastScheduleCount;
          showAdminNotification('NEW_SCHEDULE', `schedule order(s) received`, newScheduleCount);
        }
        setScheduleOrders(sched.schedules || []);
        setLastScheduleCount((sched.schedules || []).length);
      }
      if (leadsData.success) {
        setLeads(leadsData.data || []);
      }
    } catch (error) {
      console.error('❌ Admin fetchAll error:', error);
      setError('Failed to load data. Check server connection.');
    }
    setLoading(false);
    try { const r = await fetch(`${API_URL}/homestyles`); const d = await r.json(); if (d.success && d.data) { setHomestyle(d.data); setHsVideos(d.data.videoLinks || []); } } catch { }
    try { const r = await fetch(`${API_URL}/notifications/admin`, { headers }); const d = await r.json(); if (d.success) setNotifications(d.notifications || []); } catch { }
    try { const r = await fetch(`${API_URL}/legalpages`); const d = await r.json(); if (d.success && d.data) { const te = d.data.find((p: any) => p.pageType === 'terms'); const pr = d.data.find((p: any) => p.pageType === 'privacy'); setLegal({ terms: te?.content || '', privacy: pr?.content || '' }); } } catch { }
    try { const r = await fetch(`${API_URL}/coupons`, { headers }); const d = await r.json(); if (d.success) setCoupons(d.coupons || []); } catch { }
    try {
      let perfUrl = `${API_URL}/coupons/user-performance`;
      const params = new URLSearchParams();
      if (performanceDateFrom) params.append('startDate', performanceDateFrom);
      if (performanceDateTo) params.append('endDate', performanceDateTo);
      if (params.toString()) perfUrl += '?' + params.toString();
      const r = await fetch(perfUrl, { headers });
      const d = await r.json();
      if (d.success) setUserPerformance(d.users || []);
    } catch { }
  }, [token, performanceDateFrom, performanceDateTo, lastUserCount, lastOrderCount, lastSubscriptionCount, lastScheduleCount, soundEnabled]);

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

      // Request notification permission (browser only)
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Set up auto-refresh for new orders (every 30 seconds)
      const interval = setInterval(() => {
        fetchAll();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [token, user, router]);

  // Handle escape key and prevent back navigation when modal is open with unsaved changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuModal.open) {
        if (menuFormDirty && !confirm('❌ Discard all changes?\n\nAre you sure you want to exit without saving?')) {
          e.preventDefault();
          return;
        }
        setMenuModal({ open: false, data: null });
        setImgPreview('');
        setMenuFormDirty(false);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (menuModal.open && menuFormDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (menuModal.open && menuFormDirty) {
        if (!confirm('❌ Discard all changes?\n\nAre you sure you want to exit without saving?')) {
          e.preventDefault();
          window.history.pushState(null, '', window.location.href);
          return;
        }
      }
      if (menuModal.open) {
        setMenuModal({ open: false, data: null });
        setImgPreview('');
        setMenuFormDirty(false);
      }
    };

    if (menuModal.open) {
      // Push a new state when modal opens
      window.history.pushState(null, '', window.location.href);

      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [menuModal.open, menuFormDirty]);

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

  const saveMenu = async (event: any, isDraftParam?: boolean) => {
    if (event && event.preventDefault) event.preventDefault();
    const form = event.currentTarget.tagName === 'FORM' ? event.currentTarget : document.getElementById('menu-form');
    if (!form) return;

    // Skip HTML validation for drafts, but enforce it for live
    if (!isDraftParam) {
      if (!(form as HTMLFormElement).checkValidity()) {
        (form as HTMLFormElement).reportValidity();
        return;
      }
    }

    setSaving(true);
    const fd = new FormData(form as HTMLFormElement);

    const availableUntilDate = fd.get('availableUntilDate') as string;
    const availableUntil = availableUntilDate ? new Date(availableUntilDate).toISOString() : null;

    const discountValue = fd.get('discount') as string;
    const discount = discountValue ? Number(discountValue) : 0;

    const originalPriceValue = fd.get('originalPrice') as string;
    const originalPrice = originalPriceValue ? Number(originalPriceValue) : null;

    const ratingValue = fd.get('rating') as string;
    const rating = ratingValue ? Number(ratingValue) : (menuModal.data?.rating || 5.0);

    const isSpecial = fd.get('isSpecial') === 'on' || (isKitchenOwner ? (menuModal.data?.isSpecial || false) : false);
    const isTodaySpecial = fd.get('isTodaySpecial') === 'on' || (isKitchenOwner ? (menuModal.data?.isTodaySpecial || false) : false);

    // Get all selected meal types
    const mealTypes: string[] = [];
    ['Breakfast', 'Lunch', 'Dinner', 'Instant'].forEach(type => {
      if (fd.get(`mealType_${type}`) === 'on') {
        mealTypes.push(type);
      }
    });

    if (mealTypes.length === 0 && !isDraftParam) {
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
      mealType: mealTypes[0], // Set primary mealType for backward compatibility
      mealTypes: mealTypes,
      isVeg: true,
      cloudKitchen: fd.get('cloudKitchen') || null,
      isSpecial,
      isTodaySpecial,
      ingredients: (fd.get('ingredients') as string)?.split(',').map(s => s.trim()).filter(Boolean),
      availableQuantity: Number(fd.get('availableQuantity')) || null,
      availableUntil: availableUntil,
      rating: rating,
      isDraft: isDraftParam ?? menuModal.data?.isDraft ?? false
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
      setMenuFormDirty(false);
      localStorage.removeItem('menuDraft');

      // Force delete backend ephemeral draft and wait for it
      try {
        await fetch(`${API_URL}/admin/draft/menu_item`, { method: 'DELETE', headers });
      } catch (e) { }

      setIsGenerateDisabled(false);
      fetchAll();
    } else {
      alert(data.error || 'Failed to save menu item');
    }
  };

  // Helper to save draft to DB
  const saveDraftToDB = async (formData: any) => {
    try {
      await fetch(`${API_URL}/admin/draft`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'menu_item', data: formData })
      });
    } catch (e) {
      console.error('Draft save failed', e);
    }
  };

  const generateDescriptionWithAI = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    if (!nameInput?.value) {
      alert('Please enter a menu name first.');
      return;
    }
    const title = nameInput.value;
    const imgBase64 = imgPreview || menuModal.data?.image || '';

    setIsGeneratingDesc(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, imageBase64: imgBase64 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      const descTextarea = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
      if (descTextarea) {
        descTextarea.value = data.description;
        setIsGenerateDisabled(true);
        setMenuFormDirty(true);

        // Auto save to draft (Local & DB)
        if (!menuModal.data) {
          const fd = new FormData(form as HTMLFormElement);
          const draft = Object.fromEntries(fd.entries());
          if (imgPreview) draft.imageUrl = imgPreview;
          localStorage.setItem('menuDraft', JSON.stringify(draft));
          saveDraftToDB(draft);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error generating description');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  useEffect(() => {
    const loadDraft = async () => {
      if (menuModal.open && !menuModal.data && !draftLoaded) {
        let draft: any = null;

        // 1. Try Backend first
        try {
          const res = await fetch(`${API_URL}/admin/draft/menu_item`, { headers });
          const resData = await res.json();
          if (resData.success && resData.draft) {
            draft = resData.draft.data;
          }
        } catch (e) { }

        // 2. Fallback to LocalStorage
        if (!draft) {
          const draftStr = localStorage.getItem('menuDraft');
          if (draftStr) draft = JSON.parse(draftStr);
        }

        if (draft) {
          try {
            const form = document.querySelector('form#menu-form') as HTMLFormElement;
            if (form) {
              let hasDesc = false;
              Object.keys(draft).forEach(key => {
                const input = form.elements.namedItem(key);
                if (input && input instanceof HTMLInputElement) {
                  if (input.type === 'checkbox') {
                    input.checked = draft[key] === 'on' || draft[key] === true;
                  } else if (input.type === 'radio') {
                    if (input.value === draft[key]) input.checked = true;
                  } else {
                    input.value = draft[key];
                  }
                } else if (input && input instanceof HTMLTextAreaElement) {
                  input.value = draft[key];
                  if (key === 'description' && draft[key]?.trim()) hasDesc = true;
                } else if (input && input instanceof HTMLSelectElement) {
                  input.value = draft[key];
                }
              });
              setIsGenerateDisabled(hasDesc);
              if (draft.imageUrl) {
                setImgPreview(draft.imageUrl);
              }
            }
          } catch (e) { }
        }
        setDraftLoaded(true);
      }
    };

    loadDraft();

    if (!menuModal.open) {
      setDraftLoaded(false);
      setIsGenerateDisabled(false);
    }
  }, [menuModal.open, menuModal.data, draftLoaded, headers]);

  const isKitchenOwner = user?.role === 'kitchen-owner';
  const isAdmin = user?.role === 'admin';

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = isKitchenOwner ? [
    { id: 'orders', label: 'Active Orders', icon: ShoppingBag, count: orders.length },
    { id: 'menu', label: 'Kitchen Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'stats', label: 'Analytics', icon: BarChart2 },
    { id: 'earnings', label: 'Earnings', icon: CreditCard },
  ] : [
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'kitchens', label: 'Kitchens', icon: Store, count: kitchens.length },
    { id: 'stats', label: 'Analytics', icon: BarChart2 },
    { id: 'earnings', label: 'Earnings', icon: CreditCard },
    { id: 'schedules', label: 'Schedule', icon: CreditCard, count: scheduleOrders.length },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.length },
    { id: 'legal', label: 'Legal Pages', icon: FileText },
    { id: 'homestyles', label: 'Media', icon: Home },
    { id: 'coupons', label: 'Coupons', icon: Tag, count: coupons.length },
    { id: 'leads', label: 'Sales Leads', icon: TrendingUp, count: leads.length },
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

  const inputCls = 'w-full border border-slate-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition bg-white/50 backdrop-blur-sm';

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
      <div className="text-center bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl max-w-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">{error}</h2>
        <button onClick={() => router.push('/home')} className="mt-4 px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200">Return to Safety</button>
      </div>
    </div>
  );

  const commonProps = { fetchAll, headers, API_URL, user };

  return (
    <div className="flex h-screen bg-white overflow-hidden selection:bg-slate-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full border-r border-slate-200 bg-slate-50">
        <div className="px-5 py-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center bg-slate-800 text-white font-bold text-sm">T</div>
            <div>
              <p className="text-slate-900 font-bold text-sm leading-tight">Tiffica Admin</p>
              <p className="text-[10px] font-medium text-slate-500">{isKitchenOwner ? 'Kitchen operations' : 'Enterprise console'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${tab === t.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
            >
              <t.icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="flex-1 truncate">{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold tabular-nums ${tab === t.id ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{t.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-slate-200 bg-white">
          <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 bg-slate-50">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-700 text-white font-semibold text-xs shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-black truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate uppercase">{user?.role}</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              title="Logout"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">

        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-md flex items-center justify-center bg-slate-800 text-white font-bold text-sm">T</div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900">{tabs.find(t => t.id === tab)?.label}</h1>
              <p className="text-[10px] font-medium text-slate-500 hidden md:block">Business operations · {user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {liveUsers > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                {liveUsers} live
              </div>
            )}
            <button
              onClick={fetchAll}
              disabled={loading}
              title="Refresh"
              className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setTab('notifications')}
              title="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <Bell className="w-4 h-4" />
              {recentNotifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Profile"
                className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <User className="w-4 h-4" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs font-black text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfileMenu(false); logout(); router.push('/login'); }}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4 pb-24 md:pb-6 scroll-smooth">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-600 font-medium">Loading data…</p>
            </div>
          )}

          {!loading && (
            <div className="max-w-[1600px] mx-auto w-full">
              {tab === 'stats' && stats && (
                <OverviewTab stats={stats} today={today} liveUsers={liveUsers} kitchens={kitchens} menuItems={menuItems} orders={orders} users={users} deliveryPartners={deliveryPartners} user={user} fetchAll={fetchAll} performanceDateFrom={performanceDateFrom} setPerformanceDateFrom={setPerformanceDateFrom} performanceDateTo={performanceDateTo} setPerformanceDateTo={setPerformanceDateTo} />
              )}
              {tab === 'users' && isAdmin && (
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
              {tab === 'orders' && (
                <OrdersTab orders={orders} search={orderSearch} setSearch={setOrderSearch} dateFilter={dateFilter} setDateFilter={setDateFilter} deliveryPartners={deliveryPartners} kitchens={kitchens} users={users} {...commonProps} />
              )}
              {tab === 'menu' && (
                <MenuTab menuItems={menuItems} search={search} setSearch={setSearch} expandedRow={expandedRow} setExpandedRow={setExpandedRow} setMenuModal={setMenuModal} setImgPreview={setImgPreview} kitchens={kitchens} {...commonProps} />
              )}
              {tab === 'kitchens' && isAdmin && (
                <KitchensTab kitchens={kitchens} menuItems={menuItems} users={users} setKitchenModal={setKitchenModal} {...commonProps} />
              )}
              {tab === 'subscriptions' && isAdmin && (
                <SubscriptionsTab subscriptions={subscriptions} expandedRow={expandedRow} setExpandedRow={setExpandedRow} {...commonProps} />
              )}
              {tab === 'schedules' && isAdmin && (
                <ScheduleOrdersTab scheduleOrders={scheduleOrders} expandedRow={expandedRow} setExpandedRow={setExpandedRow} search={orderSearch} setSearch={setOrderSearch} dateFilter={dateFilter} setDateFilter={setDateFilter} {...commonProps} />
              )}
              {tab === 'notifications' && isAdmin && (
                <NotificationsTab notifications={notifications} setNotifications={setNotifications} notifForm={notifForm} setNotifForm={setNotifForm} notifSaving={notifSaving} setNotifSaving={setNotifSaving} {...commonProps} />
              )}
              {tab === 'legal' && isAdmin && (
                <LegalTab legal={legal} setLegal={setLegal} legalSaving={legalSaving} setLegalSaving={setLegalSaving} {...commonProps} />
              )}
              {tab === 'homestyles' && isAdmin && (
                <HomestyleTab hsVideos={hsVideos} setHsVideos={setHsVideos} hsVideoUploading={hsVideoUploading} hsSaving={hsSaving} saveHomestyle={saveHomestyle} uploadVideo={uploadVideo} />
              )}
              {tab === 'coupons' && isAdmin && (
                <CouponsTab coupons={coupons} userPerformance={userPerformance} setCouponModal={setCouponModal} performanceDateFrom={performanceDateFrom} setPerformanceDateFrom={setPerformanceDateFrom} performanceDateTo={performanceDateTo} setPerformanceDateTo={setPerformanceDateTo} {...commonProps} />
              )}
              {tab === 'leads' && isAdmin && (
                <LeadsTab leads={leads} expandedRow={expandedRow} setExpandedRow={setExpandedRow} search={leadsSearch} setSearch={setLeadsSearch} statusFilter={leadsStatusFilter} setStatusFilter={setLeadsStatusFilter} {...commonProps} />
              )}
              {tab === 'earnings' && (
                <EarningsTab orders={orders} />
              )}
            </div>
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white safe-area-pb">
        <div className="flex items-center justify-around px-1 py-1.5">
          <button onClick={() => handleTabChange('orders')} className={`flex flex-col items-center justify-center flex-1 py-2 rounded-md ${tab === 'orders' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5">Orders</span>
          </button>
          <button onClick={() => handleTabChange('menu')} className={`flex flex-col items-center justify-center flex-1 py-2 rounded-md ${tab === 'menu' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}>
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5">Menu</span>
          </button>
          <button onClick={() => handleTabChange('stats')} className={`flex flex-col items-center justify-center flex-1 py-2 rounded-md ${tab === 'stats' ? 'text-white bg-slate-800' : 'text-slate-500'}`}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5">Analytics</span>
          </button>
          {isKitchenOwner ? (
            <button onClick={() => handleTabChange('earnings')} className={`flex flex-col items-center justify-center flex-1 py-2 rounded-md ${tab === 'earnings' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}>
              <CreditCard className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-0.5">Earnings</span>
            </button>
          ) : (
            <button onClick={() => handleTabChange('kitchens')} className={`flex flex-col items-center justify-center flex-1 py-2 rounded-md ${tab === 'kitchens' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}>
              <Store className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-0.5">Kitchens</span>
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setShowMoreMenu(true)} className="flex flex-col items-center justify-center flex-1 py-2 rounded-md text-slate-500">
              <div className="grid grid-cols-2 gap-1 px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>
            </button>
          )}
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
              {tabs.filter(t => !['orders', 'menu', 'kitchens', 'stats'].includes(t.id)).map(t => (
                <button
                  key={t.id}
                  onClick={() => { handleTabChange(t.id); setShowMoreMenu(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all ${tab === t.id ? 'bg-orange-50 text-orange-600 border-2 border-orange-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tab === t.id ? 'bg-orange-100' : 'bg-white'
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => { setUserModal({ open: false, data: null }); setSelectedUserRole('user'); }}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-orange-100 flex items-center justify-center text-orange-500 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="font-black text-slate-900 text-xl tracking-tight">{userModal.data ? 'Calibrate Identity' : 'Commission Participant'}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Management</p>
            </div>

            <form onSubmit={saveUser} className="space-y-4">
              <input name="name" defaultValue={userModal.data?.name || ''} required placeholder="Full Legal Name" className={inputCls} />
              <input name="phone" defaultValue={userModal.data?.phone || ''} required placeholder="Mobile Uplink (10 digits)" type="tel" pattern="[0-9]{10}" maxLength={10} className={inputCls} />
              <input name="email" defaultValue={userModal.data?.email || ''} placeholder="Digital Mailbox" type="email" className={inputCls} />
              <input name="password" placeholder={userModal.data ? 'Access Key (unchanged)' : 'Initial Password (123456)'} type="password" className={inputCls} />
              <input name="walletBalance" defaultValue={userModal.data?.walletBalance || '0'} placeholder="Liquidity Balance (₹)" type="number" className={inputCls} />

              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Market Authorization</p>
                <select
                  name="role"
                  value={selectedUserRole}
                  onChange={(e) => setSelectedUserRole(e.target.value)}
                  className={inputCls}
                >
                  <option value="user">Consumer Tier</option>
                  <option value="delivery">Logistics Partner</option>
                  <option value="kitchen-owner">Operations Lead</option>
                  <option value="admin">System Controller</option>
                </select>
              </div>

              {selectedUserRole === 'kitchen-owner' && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Assigned Node</p>
                  <select name="assignedKitchen" defaultValue={userModal.data?.assignedKitchen?._id || userModal.data?.assignedKitchen || ''} className={inputCls}>
                    <option value="">Detached Protocol</option>
                    {kitchens.map(k => <option key={k._id} value={k._id}>{k.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setUserModal({ open: false, data: null }); setSelectedUserRole('user'); }} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition">Abort</button>
                <button type="submit" disabled={saving} className="flex-1 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition disabled:opacity-50">
                  {saving ? 'Syncing…' : userModal.data ? 'Confirm' : 'Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KITCHEN MODAL ── */}
      {kitchenModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-100 flex items-center justify-center text-amber-500 mb-4">
                <Store className="w-8 h-8" />
              </div>
              <h2 className="font-black text-slate-900 text-xl tracking-tight">{kitchenModal.data ? 'Configure Node' : 'Initialize Kitchen'}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Node</p>
            </div>

            <form onSubmit={saveKitchen} className="space-y-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Branding</p>
                <input name="name" defaultValue={kitchenModal.data?.name || ''} required placeholder="Operational Title" className={inputCls} />
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Geo-Spatial Coordinates</p>
                <div className="grid grid-cols-2 gap-3">
                  <input name="latitude" defaultValue={kitchenModal.data?.location?.coordinates?.[1] || ''} required placeholder="Lat" type="number" step="any" className={inputCls} />
                  <input name="longitude" defaultValue={kitchenModal.data?.location?.coordinates?.[0] || ''} required placeholder="Lng" type="number" step="any" className={inputCls} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Node Controller</p>
                <select name="ownerId" defaultValue={kitchenModal.data?.owner?._id || kitchenModal.data?.owner || ''} className={inputCls}>
                  <option value="">Unassigned</option>
                  {users.filter(u => u.role === 'kitchen-owner').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setKitchenModal({ open: false, data: null })} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition disabled:opacity-50">
                  {saving ? 'Syncing…' : 'Initialize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MENU MODAL ── */}
      {menuModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (menuFormDirty && !confirm('❌ Discard all changes?\n\nAre you sure you want to exit without saving?')) return;
            setMenuModal({ open: false, data: null });
            setImgPreview('');
            setMenuFormDirty(false);
          }
        }}>
          <div className="bg-white rounded-[1rem] w-full max-w-2xl p-4 my-4 shadow-2xl animate-in zoom-in-95 duration-300">


            <form
              id="menu-form"
              noValidate
              onSubmit={saveMenu}
              onChange={(e) => {
                const descTextarea = e.currentTarget.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
                setIsGenerateDisabled(!!descTextarea?.value.trim());

                if (!menuModal.data) {
                  const formNode = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(formNode);
                  const draft = Object.fromEntries(fd.entries());
                  if (imgPreview) draft.imageUrl = imgPreview;

                  localStorage.setItem('menuDraft', JSON.stringify(draft));

                  // Auto save to DB (Debounced internally by browser/react or just fire and forget)
                  // For better UX, we can use a small timeout to avoid spamming
                  const timer = (window as any)._draftTimer;
                  if (timer) clearTimeout(timer);
                  (window as any)._draftTimer = setTimeout(() => saveDraftToDB(draft), 1000);
                }
              }}
              className="space-y-2 max-h-[70vh] overflow-y-auto pr-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                  <img src={imgPreview || menuModal.data?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'} alt="preview" className="w-20 h-20 rounded-[1.5rem] object-cover shrink-0 shadow-lg shadow-orange-100" />
                  <label className="flex-1 cursor-pointer">
                    <div className="py-4 bg-white border border-slate-200 rounded-full text-center text-[10px] font-black uppercase tracking-widest text-orange-500 shadow-sm hover:border-orange-200 transition">
                      <span className="flex items-center justify-center gap-2">
                        {imgUploading ? 'Uploading…' : <><Camera className="w-4 h-4" /> Capture Image</>}
                      </span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const url = await uploadImage(f); setImgPreview(url); setMenuFormDirty(true); } catch { alert('Upload failed'); } }} disabled={imgUploading} />
                  </label>
                  {(imgPreview || menuModal.data?.image) && <input type="hidden" name="imageUrl" value={imgPreview || menuModal.data?.image || ''} />}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Basic Information</p>
                  <button
                    type="button"
                    onClick={generateDescriptionWithAI}
                    disabled={isGeneratingDesc || isGenerateDisabled}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full transition ${isGeneratingDesc || isGenerateDisabled ? "text-slate-400 bg-slate-100 cursor-not-allowed" : "text-orange-500 hover:text-orange-600 bg-orange-50"}`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isGeneratingDesc ? 'Generating...' : <><Sparkles className="w-4 h-4" /> Auto Generate</>}
                    </span>
                  </button>
                </div>
                <input name="name" defaultValue={menuModal.data?.name || ''} placeholder="Item Name" className={inputCls} />
                <textarea name="description" defaultValue={menuModal.data?.description || ''} placeholder="Item Description" rows={2} className={`${inputCls} resize-none`} />
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Pricing</p>
                <div className="grid grid-cols-3 gap-3">
                  {isKitchenOwner ? (
                    <div className="col-span-3">
                      <input name="originalPrice" defaultValue={menuModal.data?.originalPrice || ''} placeholder="Original Price (Your Base Price)" type="number" step="0.01" className={inputCls} required />
                      <input type="hidden" name="price" value={menuModal.data?.price || '0'} />
                      <input type="hidden" name="discount" value={menuModal.data?.discount || '0'} />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest px-4">Selling Price</p>
                        <input name="price" defaultValue={menuModal.data?.price || ''} placeholder="Selling Price (₹)" type="number" step="0.01" className={inputCls} required />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-4">Original Price</p>
                        <input name="originalPrice" defaultValue={menuModal.data?.originalPrice || ''} placeholder="Original Price" type="number" step="0.01" className={inputCls} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-4">Discount</p>
                        <input name="discount" defaultValue={menuModal.data?.discount || '0'} placeholder="Discount (₹)" type="number" step="0.01" className={inputCls} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Category & Type</p>
                <select name="category" defaultValue={menuModal.data?.category || ''} className={inputCls}>
                  <option value="">Select Category</option>
                  <option value="dal">Dal</option>
                  <option value="roti">Roti</option>
                  <option value="sabji">Sabji</option>
                  <option value="raita">Raita</option>
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Meal Type Vectors</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Breakfast', 'Lunch', 'Dinner', 'Instant'].map(type => {
                    const isChecked = menuModal.data?.mealTypes?.includes(type) || menuModal.data?.mealType === type;
                    return (
                      <label key={type} className={`flex items-center justify-center py-3 rounded-full border-2 transition font-black text-[10px] uppercase tracking-widest cursor-pointer ${isChecked ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-orange-200'
                        }`}>
                        <input
                          type="checkbox"
                          name={`mealType_${type}`}
                          className="sr-only"
                          defaultChecked={isChecked}
                          onChange={(e) => {
                            const label = e.target.closest('label');
                            if (e.target.checked) {
                              label?.classList.remove('bg-slate-50', 'border-slate-50', 'text-slate-400');
                              label?.classList.add('bg-orange-500', 'border-orange-500', 'text-white', 'shadow-lg', 'shadow-orange-100');
                            } else {
                              label?.classList.remove('bg-orange-500', 'border-orange-500', 'text-white', 'shadow-lg', 'shadow-orange-100');
                              label?.classList.add('bg-slate-50', 'border-slate-50', 'text-slate-400');
                            }
                            setMenuFormDirty(true);
                          }}
                        />
                        {type}
                      </label>
                    );
                  })}
                </div>
              </div>

              {!isKitchenOwner && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Kitchen Assignment</p>
                  <select name="cloudKitchen" defaultValue={menuModal.data?.cloudKitchen?._id || menuModal.data?.cloudKitchen || ''} className={inputCls}>
                    <option value="">No Kitchen</option>
                    {kitchens?.map((k: any) => (
                      <option key={k._id} value={k._id}>{k.name}</option>
                    ))}
                  </select>
                </div>
              )}


              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">{isKitchenOwner ? 'Ingredients' : 'Rating & Ingredients'}</p>
                {!isKitchenOwner && (
                  <input name="rating" defaultValue={menuModal.data?.rating || '5.0'} placeholder="Rating (0-5)" type="number" min="0" max="5" step="0.1" className={inputCls} />
                )}
                <input name="ingredients" defaultValue={menuModal.data?.ingredients?.join(', ') || ''} placeholder="Ingredients (comma separated)" className={inputCls} />
              </div>

              {!isKitchenOwner && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Special Flags</p>
                  <div className="grid grid-cols-3 gap-2">
                    <label className={`flex items-center justify-center py-3 rounded-full border-2 transition font-black text-[10px] uppercase tracking-widest cursor-pointer ${menuModal.data?.isSpecial ? 'bg-purple-500 border-purple-500 text-white' : 'bg-slate-50 border-slate-50 text-slate-400'
                      }`}>
                      <input type="checkbox" name="isSpecial" className="sr-only" defaultChecked={menuModal.data?.isSpecial} onChange={(e) => {
                        const label = e.target.closest('label');
                        if (e.target.checked) {
                          label?.classList.remove('bg-slate-50', 'border-slate-50', 'text-slate-400');
                          label?.classList.add('bg-purple-500', 'border-purple-500', 'text-white');
                        } else {
                          label?.classList.remove('bg-purple-500', 'border-purple-500', 'text-white');
                          label?.classList.add('bg-slate-50', 'border-slate-50', 'text-slate-400');
                        }
                        setMenuFormDirty(true);
                      }} />
                      <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Special</span>
                    </label>
                    <label className={`flex items-center justify-center py-3 rounded-full border-2 transition font-black text-[10px] uppercase tracking-widest cursor-pointer ${menuModal.data?.isTodaySpecial ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 border-slate-50 text-slate-400'
                      }`}>
                      <input type="checkbox" name="isTodaySpecial" className="sr-only" defaultChecked={menuModal.data?.isTodaySpecial} onChange={(e) => {
                        const label = e.target.closest('label');
                        if (e.target.checked) {
                          label?.classList.remove('bg-slate-50', 'border-slate-50', 'text-slate-400');
                          label?.classList.add('bg-amber-500', 'border-amber-500', 'text-white');
                        } else {
                          label?.classList.remove('bg-amber-500', 'border-amber-500', 'text-white');
                          label?.classList.add('bg-slate-50', 'border-slate-50', 'text-slate-400');
                        }
                        setMenuFormDirty(true);
                      }} />
                      ⭐ Today
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => { if (menuFormDirty && !confirm('❌ Discard all changes?')) return; setMenuModal({ open: false, data: null }); setImgPreview(''); setMenuFormDirty(false); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <div className="flex-[2] flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => saveMenu(e, true)}
                    disabled={saving || imgUploading}
                    className="flex-1 py-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => saveMenu(e, false)}
                    disabled={saving || imgUploading}
                    className="flex-2 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition disabled:opacity-50 px-8"
                  >
                    {saving ? 'Syncing...' : menuModal.data ? 'Update Live' : 'Go Live'}
                  </button>
                </div>
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

