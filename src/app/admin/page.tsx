'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLiveCount } from '@/hooks/useLiveCount';
import { Users, ShoppingBag, UtensilsCrossed, CreditCard, Store, BarChart2, LogOut, RefreshCw, Home, Bell, FileText, Tag, Activity, Volume2, VolumeX, TrendingUp, FileEdit, User, Lock, Camera, Sparkles, Save, Loader2, Search, MapPin, ChevronRight, X, Phone, Mail, Globe, Menu, Plus, Trash2, Image as ImageIcon, Briefcase, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  OverviewTab, UsersTab, OrdersTab, MenuTab, KitchensTab, SettingsTab,
  SubscriptionsTab, NotificationsTab, LegalTab, HomestyleTab, CouponsTab, ScheduleOrdersTab, LeadsTab,
  EarningsTab, GalleryTab, KYCTab, KitchenSettingsTab
} from './AdminContent';
import { MapLocationTab } from './MapLocationTab';
import { PayoutsTab } from './PayoutsTab';
import { CouponModal } from './CouponModal';
import { KitchenModal } from './KitchenModal';
import ImageGallery from '@/components/ImageGallery';
import AdminNotifications from '@/components/AdminNotifications';
import { notificationSound, showAdminNotification } from '@/lib/notificationSound';

const API_URL = 'https://tifficaapp-1.onrender.com/api';
type Tab = 'stats' | 'users' | 'orders' | 'menu' | 'kitchens' | 'settings' | 'subscriptions' | 'schedules' | 'homestyles' | 'notifications' | 'legal' | 'coupons' | 'leads' | 'earnings' | 'payouts' | 'map' | 'gallery' | 'kyc' | 'profile';
interface Stats { users: number; orders: number; menuItems: number; subscriptions: number; totalWalletBalance?: number; }

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const { liveCount, isConnected } = useLiveCount();
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
  const [kitchenOwners, setKitchenOwners] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [scheduleOrders, setScheduleOrders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
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
  const [hsScheduleBannerImages, setHsScheduleBannerImages] = useState<string[]>([]);
  const [hsScheduleBannerUploading, setHsScheduleBannerUploading] = useState(false);
  const [hsSubscriptionBanners, setHsSubscriptionBanners] = useState<string[]>([]);
  const [hsSubscriptionBannerUploading, setHsSubscriptionBannerUploading] = useState(false);
  const [hsScheduleSectionImages, setHsScheduleSectionImages] = useState<any>({
    regular: '', shahiThali: '', corporateOrder: '', miniBowl: ''
  });
  const [hsSectionUploading, setHsSectionUploading] = useState<string | null>(null);
  const [kitchenModal, setKitchenModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [menuModal, setMenuModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [menuFormDirty, setMenuFormDirty] = useState(false);
  const [userModal, setUserModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [selectedUserRole, setSelectedUserRole] = useState('user');
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string>('');
  // draft feature removed: no draftLoaded state
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
  const [ownerProfileModal, setOwnerProfileModal] = useState({ open: false });
  const [selectedCategory, setSelectedCategory] = useState<string>('regular');
  const [dishName, setDishName] = useState<string>('');
  const [categoryPrice, setCategoryPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [deliveryPrice, setDeliveryPrice] = useState<number | string>('');
  const [freeDelivery, setFreeDelivery] = useState<boolean>(false);
  const [isInstantLocal, setIsInstantLocal] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<string>('');
  const [currentDeliveryTime, setCurrentDeliveryTime] = useState<string>('');
  const [menuItemInputs, setMenuItemInputs] = useState<string[]>(['', '', '', '']);
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [infoText, setInfoText] = useState<string>('');

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGenerateDisabled, setIsGenerateDisabled] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const generateImage = async () => {
    if (!descriptionText.trim()) {
      alert('Please enter a description first');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch(`${API_URL}/generate-image`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: descriptionText })
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        setImgPreview(data.imageUrl);
        setMenuFormDirty(true);
      } else {
        alert(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const [kitchen, setKitchen] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    // Manual refresh only - no automatic reloading
    if (!token) return;
    setLoading(true); setError('');
    try {
      console.log('📋 Admin fetchAll started...');

      const [sRes, uRes, oRes, mRes, cRes, kRes, ownersRes, subRes, todayRes, dpRes, schedRes, leadsRes, kycRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users?all=true`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers }),
        fetch(`${API_URL}/admin/menu`, { headers }),
        fetch(`${API_URL}/admin/categories`, { headers }),
        fetch(`${API_URL}/admin/cloudkitchens`, { headers }),
        fetch(`${API_URL}/admin/kitchen-owners`, { headers }),
        fetch(`${API_URL}/admin/subscriptions`, { headers }),
        fetch(`${API_URL}/admin/today`, { headers }),
        fetch(`${API_URL}/admin/delivery-partners`, { headers }),
        fetch(`${API_URL}/admin/schedules`, { headers }),
        fetch(`${API_URL}/leads`, { headers }),
        fetch(`${API_URL}/admin/kyc/pending`, { headers }),
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
        leads: leadsRes.status,
        kyc: kycRes.status
      });

      if (sRes.status === 403) { setError('Access denied. Admin only.'); setLoading(false); return; }

      const [s, u, o, m, c, k, owners, sub, t, dp, sched, leadsData, kycData] = await Promise.all([
        sRes.json(), uRes.json(), oRes.json(), mRes.json(), cRes.json(), kRes.json(), ownersRes.json(),
        subRes.json(), todayRes.json(), dpRes.json(), schedRes.json(), leadsRes.json(), kycRes.json()
      ]);

      console.log('📋 API responses data:', {
        stats: s.success ? 'OK' : s.error,
        users: u.success ? `${u.users?.length || 0} users` : u.error,
        orders: o.success ? `${o.orders?.length || 0} orders` : o.error,
        menu: m.success ? `${m.items?.length || 0} items` : m.error,
        categories: c.success ? `${c.categories?.length || 0} categories` : c.error,
        kitchens: k.success ? `${k.kitchens?.length || 0} kitchens` : k.error,
        subscriptions: sub.success ? `${sub.subscriptions?.length || 0} subs` : sub.error,
        today: t.success ? 'OK' : t.error,
        deliveryPartners: dp.success ? `${dp.partners?.length || 0} partners` : dp.error,
        schedules: sched.success ? `${sched.schedules?.length || 0} schedules` : sched.error,
        leads: leadsData.success ? `${leadsData.data?.length || 0} leads` : leadsData.error,
        kyc: kycData.success ? `${kycData.kitchens?.length || 0} pending` : kycData.error
      });

      if (s.stats) setStats(s.stats);
      if (u.users) {
        setUsers(u.users);
        setLastUserCount(u.users.length);
      }
      if (o.success && o.orders) {
        setOrders(o.orders);
        setLastOrderCount(o.orders.length);
        console.log('✅ Orders loaded in admin:', o.orders.length);
      } else {
        console.error('❌ Orders API error:', o.error || 'Unknown error');
        setOrders([]);
      }
      if (m.items) setMenuItems(m.items);
      if (c.categories) setCategories(c.categories);
      if (k.kitchens) setKitchens(k.kitchens);
      if (owners.owners) setKitchenOwners(owners.owners);
      if (sub.subscriptions) {
        setSubscriptions(sub.subscriptions);
        setLastSubscriptionCount(sub.subscriptions.length);
      }
      if (t.success) { setToday(t); setLiveUsers(t.liveUsers || 0); }
      if (dp.success) setDeliveryPartners(dp.partners || []);
      if (sched.success) {
        setScheduleOrders(sched.schedules || []);
        setLastScheduleCount((sched.schedules || []).length);
      }
      if (leadsData.success) {
        setLeads(leadsData.data || []);
      }
      if (kycData.success) {
        setPendingKyc(kycData.kitchens || []);
      }

      // If user is kitchen owner, find their specific kitchen from the list
      if (user?.role === 'kitchen-owner' && k.kitchens) {
        const ownerKitchen = k.kitchens.find((kit: any) => 
          kit.ownerId === user._id || kit._id === (user.assignedKitchen || user.kitchenId)
        );
        if (ownerKitchen) setKitchen(ownerKitchen);
      }
    } catch (error) {
      console.error('❌ Admin fetchAll error:', error);
      setError('Failed to load data. Check server connection.');
    }
    setLoading(false);
    try {
      const r = await fetch(`${API_URL}/homestyles`);
      const d = await r.json();
      if (d.success && d.data) {
        setHomestyle(d.data);
        setHsVideos(d.data.videoLinks || []);
        setHsScheduleBannerImages(d.data.scheduleBannerImages || []);
        setHsSubscriptionBanners(d.data.subscriptionBanners || []);
        setHsScheduleSectionImages(d.data.scheduleSectionImages || {
          regular: '', shahiThali: '', corporateOrder: '', miniBowl: ''
        });
      }
    } catch { }
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

      // Request notification permission (browser only)
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }
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

      if (menuModal.data) {
        console.log('📝 Menu modal opened with data:', menuModal.data);
        console.log('✅ Setting isInstant from data:', menuModal.data.isInstant);
        const activeCategory = (menuModal.data.scheduleSections && menuModal.data.scheduleSections.length > 0) ? menuModal.data.scheduleSections[0] : (menuModal.data.category || 'Regular');
        setSelectedCategory(activeCategory);
        setDishName(menuModal.data.name || '');
        setCurrentTags((menuModal.data.tags || []).join(', '));
        setCurrentDeliveryTime(menuModal.data.deliveryTime || '');
        // Set selling & purchase prices from existing item or from categories list
        try {
          const selCat = categories?.find((c: any) => (c.name || '').toLowerCase() === (activeCategory || '').toLowerCase());
          const menuPrice = (menuModal.data.price !== undefined && menuModal.data.price !== null) ? menuModal.data.price : (selCat?.sellPrice || 0);
          setSellingPrice(menuPrice || 0);
          setDeliveryPrice(menuModal.data.deliveryPrice !== undefined && menuModal.data.deliveryPrice !== null ? menuModal.data.deliveryPrice : '');
          setFreeDelivery(!!menuModal.data.freeDelivery);
          setIsInstantLocal(!!menuModal.data.isInstant);
          console.log('✅ setIsInstantLocal called with:', !!menuModal.data.isInstant);
        } catch (e) { /* ignore */ }
        // For admin show full description textarea, for kitchen-owner keep legacy item inputs
        if (isAdmin) {
          setDescriptionText(menuModal.data.description || '');
          setInfoText(menuModal.data.info || '');
  
        } else {
          setDescriptionText(menuModal.data.description || '');
        }
      } else {
        setSelectedCategory('Regular');
        setDishName('');
        setCurrentTags('');
        setCurrentDeliveryTime('');
        setMenuItemInputs(['', '', '', '']);
        setDescriptionText('');
        setInfoText('');
        // initialize default prices from categories (if available) - only for admin, not for kitchen owners
        if (isAdmin) {
          try {
            const defaultCat = (categories || []).find((c: any) => (c.name || '').toLowerCase() === 'regular') || (categories && categories[0]);
            setSellingPrice(defaultCat?.sellPrice || 0);
            setDeliveryPrice('');
            setFreeDelivery(false);
          } catch (e) { /* ignore */ }
        } else {
          // For kitchen owners, start with empty prices
          setSellingPrice(0);
          setDeliveryPrice('');
          setFreeDelivery(false);
        }
      }

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
    const payload = {
      videoLinks: hsVideos,
      substituteVideoLinks: homestyle?.substituteVideoLinks || [],
      bestseller: homestyle?.bestseller || [],
      categories: categories.filter((c: any) => c.isHomestyle).map((c: any) => c._id),
      scheduleBannerImages: hsScheduleBannerImages,
      subscriptionBanners: hsSubscriptionBanners,
      scheduleSectionImages: hsScheduleSectionImages
    };
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
    const body: any = {
      name: fd.get('name'),
      latitude: parseFloat(fd.get('latitude') as string),
      longitude: parseFloat(fd.get('longitude') as string),
      ownerName: fd.get('ownerName'),
      ownerPhone: fd.get('ownerPhone'),
      ownerEmail: fd.get('ownerEmail'),
      mpin: fd.get('mpin') || undefined
    };
    const ownerId = fd.get('ownerId') as string;
    if (ownerId) {
      body.ownerId = ownerId;
    }
    const isEdit = !!kitchenModal.data?._id;
    const url = isEdit ? `${API_URL}/admin/cloudkitchens/${kitchenModal.data._id}` : `${API_URL}/admin/cloudkitchens`;
    console.log('🚀 Saving kitchen:', { isEdit, url, body });
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('✅ Save response:', data);
    setSaving(false);
    if (data.success) {
      setKitchenModal({ open: false, data: null });
      fetchAll();
    } else {
      alert(data.error || 'Failed');
    }
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

    // Handle assignedKitchen for kitchen-owner role
    if (body.role === 'kitchen-owner') {
      const kitchenId = fd.get('assignedKitchen') as string;
      // backend expects `kitchenId` when creating a KitchenOwner
      body.kitchenId = kitchenId || null; // Explicitly set to null if empty
    }
    const isEdit = !!userModal.data?._id;
    let url: string;
    let method: string;

    // Create KitchenOwner via dedicated endpoint when admin selects role 'kitchen-owner'
    if (!isEdit && body.role === 'kitchen-owner') {
      url = `${API_URL}/admin/kitchen-owners`;
      method = 'POST';
    } else {
      url = isEdit ? `${API_URL}/admin/users/${userModal.data._id}` : `${API_URL}/admin/users`;
      method = isEdit ? 'PUT' : 'POST';
    }

    const res = await fetch(url, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json(); setSaving(false);
    if (data.success) { setUserModal({ open: false, data: null }); fetchAll(); } else alert(data.error || 'Failed');
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        fetchAll();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error', err);
      alert('Failed to delete user');
    }
    setLoading(false);
  };

  const saveMenu = async (event: any) => {
    if (event && event.preventDefault) event.preventDefault();
    const form = event.currentTarget.tagName === 'FORM' ? event.currentTarget : document.getElementById('menu-form');
    if (!form) return;

    setSaving(true);
    const fd = new FormData(form as HTMLFormElement);

    // Decide cloudKitchen: prefer explicit form value, then existing item value, then kitchen-owner's kitchen
    const fdCloudKitchen = fd.get('cloudKitchen');
    let cloudKitchenValue: any = null;
    if (fdCloudKitchen) cloudKitchenValue = fdCloudKitchen;
    else if (menuModal.data?.cloudKitchen) cloudKitchenValue = (menuModal.data?.cloudKitchen as any)?._id || menuModal.data?.cloudKitchen;
    else if (user?.role === 'kitchen-owner') cloudKitchenValue = (user as any).kitchenId || (user as any).assignedKitchen || null;

    const mealTypes = fd.getAll ? fd.getAll('mealTypes') : [];
    const mealType = (fd.get('mealType') as any) || (mealTypes && mealTypes.length > 0 ? mealTypes[0] : null);
    const homeCategories = fd.getAll ? fd.getAll('homeCategories') : [];
    let scheduleSections = fd.getAll ? fd.getAll('scheduleSections') : [];

    // If scheduleSections not provided, map the selectedCategory into scheduleSections
    if ((!scheduleSections || scheduleSections.length === 0) && selectedCategory) {
      scheduleSections = [selectedCategory];
    }

    // Normalize form values to strings. `FormData.get()` can return a File,
    // so guard against that before calling string methods like `split`.
    let descriptionValue: string;
    if (isAdmin) {
      const fdDesc = fd.get('description');
      descriptionValue = (typeof fdDesc === 'string' && fdDesc) ? fdDesc : (descriptionText || '');
    } else {
      const fdDesc = fd.get('description');
      descriptionValue = (typeof fdDesc === 'string' && fdDesc) ? fdDesc : (descriptionText || '');
    }

    const categoryValue = selectedCategory || 'regular';

    // Ensure a `name` is always sent. If the admin didn't provide one,
    // derive it from the first line of the description so older servers
    // that require `name` continue to work.
    const fdName = fd.get('name');
    let nameValue = isAdmin 
      ? ((typeof fdName === 'string' && String(fdName).trim()) ? String(fdName).trim() : '')
      : dishName.trim();
    if (!nameValue) {
      const derived = (descriptionValue || '').split('\n')[0].trim();
      nameValue = derived ? derived.slice(0, 60) : 'Menu Item';
    }

    const body: any = {
      name: nameValue,
      description: descriptionValue,
      category: categoryValue || 'regular',
      price: sellingPrice || menuModal.data?.price || 0,
      kitchenEarning: menuModal.data?.kitchenEarning || 0,
      deliveryPrice: freeDelivery ? 0 : (deliveryPrice || menuModal.data?.deliveryPrice || 0),
      freeDelivery: freeDelivery,
      image: imgPreview || fd.get('imageUrl'),
      isVeg: true,
      isInstant: isInstantLocal,
      isSpecial: fd.get('isSpecial') === 'true',
      isSubscription: fd.get('isSubscription') === 'true',
      cloudKitchen: cloudKitchenValue || null,
      mealType: mealType || null,
      mealTypes: mealTypes || [],
      homeCategories: homeCategories || [],
      scheduleSections: scheduleSections || [],
      deliveryTime: currentDeliveryTime,
      tags: currentTags.split(',').map(t => t.trim()).filter(t => t),
      info: infoText || null,
    };

    console.log('📝 Saving menu item...');
    console.log('isInstantLocal state:', isInstantLocal);
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
      setSelectedCategory('regular');
      setDescriptionText('');
      setInfoText('');
      setSellingPrice(0);
      setDeliveryPrice('');
      setFreeDelivery(false);
      setIsInstantLocal(false);
      setIsGenerateDisabled(false);
      fetchAll();
    } else {
      alert(data.error || 'Failed to save menu item');
    }
  };

  // draft loading removed

  const isKitchenOwner = user?.role === 'kitchen-owner';
  const isAdmin = user?.role === 'admin';

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = isKitchenOwner ? [
    { id: 'orders', label: 'Active Orders', icon: ShoppingBag, count: orders.length },
    { id: 'menu', label: 'Kitchen Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'stats', label: 'Analytics', icon: BarChart2 },
    { id: 'earnings', label: 'Earnings', icon: CreditCard },
    { id: 'profile', label: 'Profile & KYC', icon: User },
  ] : [
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, count: menuItems.length },
    { id: 'kitchens', label: 'Kitchens', icon: Store, count: kitchens.length },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Tag },
    { id: 'stats', label: 'Analytics', icon: BarChart2 },
    { id: 'earnings', label: 'Earnings', icon: CreditCard },
    { id: 'payouts', label: 'Payouts', icon: CreditCard },
    { id: 'schedules', label: 'Schedule', icon: CreditCard, count: scheduleOrders.length },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.length },
    { id: 'legal', label: 'Legal Pages', icon: FileText },
    { id: 'homestyles', label: 'Media', icon: Home },
    { id: 'coupons', label: 'Coupons', icon: Tag, count: coupons.length },
    { id: 'leads', label: 'Sales Leads', icon: TrendingUp, count: leads.length },
    { id: 'map', label: 'Map Location', icon: Globe },
  ];

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setSearch('');
    setOrderSearch('');
    setDateFilter('');
    setExpandedRow(null);
    setShowMoreMenu(false);
  };

  const inputCls = 'w-full border border-black rounded-[1rem] px-6 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition bg-white/50 backdrop-blur-sm';

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
        {isKitchenOwner && kitchen && !kitchen.isKycDone && (
          <div className="bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between shadow-lg shadow-amber-500/20 relative z-30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider">KYC Action Required — Please complete verification to start selling</span>
            </div>
            <button 
              onClick={() => handleTabChange('profile')}
              className="px-4 py-1.5 bg-white text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 active:scale-95 transition shadow-sm"
            >
              Verify Now
            </button>
          </div>
        )}

        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 mt-0 md:mt-0 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-md flex items-center justify-center bg-slate-800 text-white font-bold text-sm">T</div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900">{tabs.find(t => t.id === tab)?.label}</h1>
              <p className="text-[10px] font-medium text-slate-500 hidden md:block">Business operations · {user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live User Count via WebSocket - Front App Users */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isConnected
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-gray-50 border border-gray-200 text-gray-500'
              }`} title={`Live users in front app (${isConnected ? 'connected' : 'disconnected'})`}>
              <div className={`w-2 h-2 rounded-full ${isConnected
                ? 'bg-green-500 animate-pulse'
                : 'bg-gray-400'
                }`} />
              <span className="tabular-nums">{liveCount}</span>
              <span className="text-[10px] uppercase tracking-wider">Live</span>
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              title="Refresh"
              className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <AdminNotifications />
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
                  {user?.role === 'kitchen-owner' && (
                    <button
                      onClick={() => { setShowProfileMenu(false); setTab('profile'); }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition border-b border-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
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
                  deleteUser={deleteUser}
                  {...commonProps}
                />
              )}
              {tab === 'orders' && (
                <OrdersTab orders={orders} search={orderSearch} setSearch={setOrderSearch} dateFilter={dateFilter} setDateFilter={setDateFilter} deliveryPartners={deliveryPartners} kitchens={kitchens} users={users} {...commonProps} />
              )}
              {tab === 'menu' && (
                <MenuTab menuItems={menuItems} search={search} setSearch={setSearch} expandedRow={expandedRow} setExpandedRow={setExpandedRow} setMenuModal={setMenuModal} setImgPreview={setImgPreview} kitchens={kitchens} setSelectedCategory={setSelectedCategory} setSellingPrice={setSellingPrice} categories={categories} {...commonProps} />
              )}
              {tab === 'kitchens' && isAdmin && (
                <KitchensTab kitchens={kitchens} menuItems={menuItems} users={users} kitchenOwners={kitchenOwners} setKitchenModal={setKitchenModal} {...commonProps} />
              )}
              {tab === 'settings' && isAdmin && (
                <SettingsTab categories={categories} {...commonProps} />
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
                <HomestyleTab
                  hsVideos={hsVideos}
                  setHsVideos={setHsVideos}
                  hsVideoUploading={hsVideoUploading}
                  hsSaving={hsSaving}
                  saveHomestyle={saveHomestyle}
                  uploadVideo={uploadVideo}
                  hsScheduleBannerImages={hsScheduleBannerImages}
                  setHsScheduleBannerImages={setHsScheduleBannerImages}
                  hsScheduleBannerUploading={hsScheduleBannerUploading}
                  setHsScheduleBannerUploading={setHsScheduleBannerUploading}
                  hsSubscriptionBanners={hsSubscriptionBanners}
                  setHsSubscriptionBanners={setHsSubscriptionBanners}
                  hsSubscriptionBannerUploading={hsSubscriptionBannerUploading}
                  setHsSubscriptionBannerUploading={setHsSubscriptionBannerUploading}
                  hsScheduleSectionImages={hsScheduleSectionImages}
                  setHsScheduleSectionImages={setHsScheduleSectionImages}
                  hsSectionUploading={hsSectionUploading}
                  setHsSectionUploading={setHsSectionUploading}
                  uploadImage={uploadImage}
                />
              )}
              {tab === 'gallery' && isAdmin && (
                <GalleryTab {...commonProps} />
              )}
              {tab === 'coupons' && isAdmin && (
                <CouponsTab coupons={coupons} userPerformance={userPerformance} setCouponModal={setCouponModal} performanceDateFrom={performanceDateFrom} setPerformanceDateFrom={setPerformanceDateFrom} performanceDateTo={performanceDateTo} setPerformanceDateTo={setPerformanceDateTo} {...commonProps} />
              )}
              {tab === 'leads' && isAdmin && (
                <LeadsTab leads={leads} expandedRow={expandedRow} setExpandedRow={setExpandedRow} search={leadsSearch} setSearch={setLeadsSearch} statusFilter={leadsStatusFilter} setStatusFilter={setLeadsStatusFilter} {...commonProps} />
              )}
              {tab === 'map' && isAdmin && (
                <MapLocationTab users={users} kitchens={kitchens} orders={orders} {...commonProps} />
              )}
              {tab === 'earnings' && (
                <EarningsTab orders={orders} />
              )}
              {tab === 'payouts' && isAdmin && (
                <PayoutsTab fetchAll={fetchAll} headers={headers} API_URL={API_URL} />
              )}
              {tab === 'profile' && (
                <KitchenSettingsTab user={user} kitchen={kitchen} headers={headers} API_URL={API_URL} fetchAll={fetchAll} />
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
            <>
              <button onClick={() => handleTabChange('earnings')} className={`flex flex-col items-center justify-center flex-1 py-2 rounded-md ${tab === 'earnings' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}>
                <CreditCard className="w-5 h-5" />
                <span className="text-[9px] font-medium mt-0.5">Earnings</span>
              </button>
            </>
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
                  <option value="user">Customer</option>
                  <option value="kitchen-owner">Kitchen Owner</option>
                  <option value="delivery">Delivery</option>
                  <option value="admin">Admin</option>
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
      <KitchenModal
        kitchenModal={kitchenModal}
        setKitchenModal={setKitchenModal}
        saveKitchen={saveKitchen}
        saving={saving}
        users={users}
        inputCls={inputCls}
      />

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
                setMenuFormDirty(true);
              }}
              className="space-y-2 max-h-[70vh] overflow-y-auto pr-4"
            >
              {/* Name field — admin only */}
              {isAdmin && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Menu Name</p>
                  <input
                    type="text"
                    name="name"
                    defaultValue={menuModal.data?.name || ''}
                    placeholder="e.g. Dal Tadka Thali"
                    className={inputCls}
                    onChange={() => setMenuFormDirty(true)}
                  />
                </div>
              )}

                {isAdmin && (
                  <>
                    <div className="pt-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Home Categories (show on Home)</p>
                      <div className="flex gap-3 px-4 flex-wrap">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" name="homeCategories" value="Lunch" defaultChecked={menuModal.data?.homeCategories?.includes?.('Lunch')} />
                          <span>Lunch</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" name="homeCategories" value="Dinner" defaultChecked={menuModal.data?.homeCategories?.includes?.('Dinner')} />
                          <span>Dinner</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" name="homeCategories" value="Healthy" defaultChecked={menuModal.data?.homeCategories?.includes?.('Healthy')} />
                          <span>Healthy</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" name="homeCategories" value="Shahi Thali" defaultChecked={menuModal.data?.homeCategories?.includes?.('Shahi Thali')} />
                          <span>Shahi Thali</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" name="homeCategories" value="Breakfast" defaultChecked={menuModal.data?.homeCategories?.includes?.('Breakfast')} />
                          <span>Breakfast</span>
                        </label>
                      </div>
                    </div>

                    {/* Schedule Sections moved to the price & schedule block below (single-select) */}
                  </>
                )}

                {isAdmin ? (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Schedule Category</p>
                  <div className="flex gap-3 px-4 flex-wrap">
                    {['Regular','Shahi Thali','Mini Bowl'].map(opt => (
                      <label key={opt} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="scheduleSections"
                          value={opt}
                          checked={String(selectedCategory) === String(opt)}
                          onChange={(e) => {
                            const checked = (e.target as HTMLInputElement).checked;
                            if (checked) {
                              setSelectedCategory(opt);
                              // set items count for shahi thali
                              if (opt.toLowerCase() === 'shahi thali') {
                                setMenuItemInputs(prev => { let next = [...prev]; while (next.length < 5) next.push(''); return next.slice(0,5); });
                              } else {
                                setMenuItemInputs(prev => { let next = [...prev]; while (next.length < 4) next.push(''); return next.slice(0,4); });
                              }
                            } else {
                              setSelectedCategory('');
                            }
                            setMenuFormDirty(true);
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="px-4 pt-2 grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-0">Selling Price (customer)</p>
                      <input type="number" name="price" value={sellingPrice} onChange={e => { setSellingPrice(Number(e.target.value || 0)); setMenuFormDirty(true); }} className={inputCls} />
                    </div>
                  </div>

                  <div className="px-4 pt-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isInstant" value="true" checked={isInstantLocal} onChange={(e) => { setIsInstantLocal((e.target as HTMLInputElement).checked); setMenuFormDirty(true); }} />
                      <span className="text-sm">Instant</span>
                    </label>
                  </div>
                </div>
              ) : (
                isKitchenOwner ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Schedule Category</p>
                    <div className="flex gap-3 px-4 flex-wrap">
                      {['Regular','Shahi Thali','Mini Bowl'].map(opt => (
                        <label key={opt} className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="scheduleSections"
                            value={opt}
                            checked={String(selectedCategory) === String(opt)}
                            onChange={(e) => {
                              const checked = (e.target as HTMLInputElement).checked;
                              if (checked) {
                                setSelectedCategory(opt);
                                if (opt.toLowerCase() === 'shahi thali') {
                                  setMenuItemInputs(prev => { let next = [...prev]; while (next.length < 5) next.push(''); return next.slice(0,5); });
                                } else {
                                  setMenuItemInputs(prev => { let next = [...prev]; while (next.length < 4) next.push(''); return next.slice(0,4); });
                                }
                              } else {
                                setSelectedCategory('');
                              }
                              setMenuFormDirty(true);
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    <div className="px-4 pt-2 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-0">Selling Price (customer)</p>
                        <input type="number" name="price" value={sellingPrice} onChange={e => { setSellingPrice(Number(e.target.value || 0)); setMenuFormDirty(true); }} className={inputCls} />
                      </div>

                    </div>
                    <div className="px-4 pt-3">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" name="freeDelivery" checked={freeDelivery} onChange={(e) => { setFreeDelivery((e.target as HTMLInputElement).checked); setMenuFormDirty(true); }} />
                        <span className="text-sm">Free Delivery</span>
                      </label>
                    </div>
                    {!freeDelivery && (
                      <div className="px-4 pt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-0">Delivery Price (Max ₹30)</p>
                        <input 
                          type="number" 
                          name="deliveryPrice" 
                          value={deliveryPrice} 
                          placeholder="Enter delivery price"
                          max="30"
                          onChange={e => { 
                            let value = e.target.value;
                            if (value === '') {
                              setDeliveryPrice('');
                            } else {
                              let numValue = Number(value || 0);
                              if (numValue > 30) {
                                numValue = 30;
                              }
                              setDeliveryPrice(numValue);
                            }
                            setMenuFormDirty(true); 
                          }} 
                          className={inputCls + ' [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'} 
                          style={{ MozAppearance: 'textfield' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Other roles: include hidden input so backend still receives category
                  <input type="hidden" name="category" value={selectedCategory} />
                )
              )}



             

              {isAdmin ? (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Description</p>
                  <textarea
                    name="description"
                    value={descriptionText}
                    onChange={e => { setDescriptionText(e.target.value); setMenuFormDirty(true); setIsGenerateDisabled(!!e.target.value.trim()); }}
                    placeholder="Full description for schedule and listing"
                    className={inputCls + ' h-32 resize-y'}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Dish Name</p>
                    <input
                      type="text"
                      name="name"
                      value={dishName}
                      onChange={e => { 
                        setDishName(e.target.value);
                        setMenuFormDirty(true);
                      }}
                      placeholder="e.g., Matar Paneer, Paneer Tikka"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Description</p>
                    <textarea
                      name="description"
                      value={descriptionText}
                      onChange={e => { setDescriptionText(e.target.value); setMenuFormDirty(true); }}
                      placeholder="Describe your dish (ingredients, preparation, etc.)"
                      className={inputCls + ' h-20 resize-y'}
                    />
                  </div>
                </div>
              )}

              {/* Today's Special & Subscription Checkboxes - Only for Admin */}
              {isAdmin && (
                <div className="pt-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">Menu Flags</p>
                  <div className="flex gap-4 px-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isSpecial" value="true" defaultChecked={menuModal.data?.isSpecial} />
                      <span>Today's Special</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isSubscription" value="true" defaultChecked={menuModal.data?.isSubscription} />
                      <span>Subscription</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Meal type selection for kitchen owners (Lunch / Dinner) */}
              <div className="pt-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Meal Types</p>
                <div className="flex gap-3 px-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="mealTypes" value="lunch" defaultChecked={menuModal.data?.mealTypes?.includes?.('lunch')} />
                    <span>Lunch</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="mealTypes" value="dinner" defaultChecked={menuModal.data?.mealTypes?.includes?.('dinner')} />
                    <span>Dinner</span>
                  </label>
                </div>
              </div>

              {isAdmin && (
                <>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Delivery Time</p>
                    <input
                      type="text"
                      name="deliveryTime"
                      value={currentDeliveryTime}
                      onChange={e => { setCurrentDeliveryTime(e.target.value); setMenuFormDirty(true); }}
                      placeholder="e.g. 30-40 mins"
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Tags (comma separated)</p>
                    <input
                      type="text"
                      name="tags"
                      value={currentTags}
                      onChange={e => { setCurrentTags(e.target.value); setMenuFormDirty(true); }}
                      placeholder="Street Food, Spicy"
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {/* Image Selection - At Bottom */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                  <img src={imgPreview || menuModal.data?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'} alt="preview" className="w-20 h-20 rounded-[1.5rem] object-cover shrink-0 shadow-lg shadow-orange-100" />
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowImageGallery(true)}
                      className="py-4 bg-blue-500 border border-blue-600 rounded-full text-center text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:border-blue-700 transition w-full"
                    >
                      <span className="flex items-center justify-center gap-2">
                        🖼️ Browse & Select Image
                      </span>
                    </button>
                  </div>
                  {(imgPreview || menuModal.data?.image) && <input type="hidden" name="imageUrl" value={imgPreview || menuModal.data?.image || ''} />}
                </div>
              </div>

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
                    type="submit"
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

      {/* ── IMAGE GALLERY MODAL ── */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowImageGallery(false);
          }
        }}>
          <div className="bg-white rounded-[1rem] w-full max-w-4xl p-4 my-4 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <ImageGallery
              onSelectImage={(imageUrl: string) => {
                setImgPreview(imageUrl);
                setShowImageGallery(false);
              }}
              kitchenId={(user as any)?.kitchenId || (user as any)?.assignedKitchen}
              token={token || ''}
              API_URL={API_URL}
              onClose={() => setShowImageGallery(false)}
              initialSearchQuery={dishName || descriptionText}
            />
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

