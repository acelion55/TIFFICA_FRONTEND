'use client';
import React from 'react';
import { ChevronDown, ChevronUp, Search, Trash2, Plus, Activity, Tag, TrendingUp, Award, Users, User, ShoppingBag, UtensilsCrossed, CreditCard, ChevronRight, Calendar, ArrowUpDown, Mail, Phone, MapPin, Truck, Copy, Zap, CheckCircle, Hourglass, Home, Wallet, Gem, CalendarDays, Rocket, Flag, Megaphone, Info, Gift, Package, AlertTriangle, Bell, Send, Save, Smartphone, GraduationCap, Building2, Shirt, Lock, FileText, Film, Video, Sparkles, X, RefreshCw, Download, ChevronLeft, Printer, Eye, MoreHorizontal, ArrowUp, ArrowDown, Edit, Loader2, BarChart2, Store, Camera, Layout } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AdminNotifications from '@/components/AdminNotifications';
import { ERP, AdminPageHeader, AdminToolbar, AdminPanel, AdminDataTable, AdminKpiGrid, AdminStatusBadge, MiniBarChart } from './admin-ui';
export { OverviewTab } from './admin-analytics';

const SC: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-slate-100 text-slate-500',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function UsersTab({ users, search, setSearch, setUserModal, openEditUserModal, deleteUser, fetchAll, headers, API_URL }: any) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const filtered = users.filter((u: any) => {
    return !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u: any) => u._id)));
    }
  };

  const handleBulkRoleChange = async (role: string) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to change the role to "${role}" for ${selectedIds.size} selected users?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/bulk-role`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selectedIds), role })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSelectedIds(new Set());
        fetchAll?.();
      } else {
        alert(data.error || 'Bulk update failed');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  return (
    <div className={ERP.page}>
      <AdminPageHeader
        title=""
        subtitle={""}
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-lg animate-in fade-in slide-in-from-right-4">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{selectedIds.size} Selected</span>
                <div className="h-4 w-[1px] bg-orange-200 mx-1" />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkRoleChange(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="text-[10px] font-bold text-slate-600 bg-transparent py-1 pr-6 focus:outline-none cursor-pointer"
                >
                  <option value="">Bulk Role Change</option>
                  <option value="user">Set as User</option>
                  <option value="admin">Set as Admin</option>
                  <option value="delivery">Set as Delivery</option>
                  <option value="kitchen-owner">Set as Kitchen Owner</option>
                </select>
              </div>
            )}
            <button type="button" onClick={() => setUserModal({ open: true, data: null })} className={`${ERP.btn} ${ERP.btnPrimary}`}>
              <Plus className="w-4 h-4" /> Add user
            </button>
          </div>
        }
      />
      <AdminKpiGrid items={[
        { label: 'Total users', value: filtered.length },
        { label: 'Customers', value: users.filter((u: any) => u.role === 'user' || !u.role).length },
        { label: 'Kitchen owners', value: users.filter((u: any) => u.role === 'kitchen-owner').length },
        { label: 'Premium', value: users.filter((u: any) => u.isPremium).length },
      ]} />
      <AdminToolbar search={search} setSearch={setSearch} searchPlaceholder="Search name, email, phone…" />
      <AdminDataTable
        showSearch={false}
        selectable={true}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email', sortable: true },
          { key: 'role', header: 'Role', sortable: true, render: (u: any) => <AdminStatusBadge status={u.role || 'user'} /> },
          { key: 'walletBalance', header: 'Wallet', render: (u: any) => `₹${(u.walletBalance || 0).toLocaleString('en-IN')}` },
          { key: 'createdAt', header: 'Joined', sortable: true, render: (u: any) => fmt(u.createdAt) },
          {
            key: 'actions', header: '', render: (u: any) => (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openEditUserModal ? openEditUserModal(u) : setUserModal({ open: true, data: u })} className={`${ERP.btn} ${ERP.btnSecondary} py-1`}>Edit</button>
                {deleteUser && (
                  <button type="button" onClick={() => deleteUser(u._id)} className={`${ERP.btn} ${ERP.btnDanger} py-1`}><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            )
          },
        ]}
        rows={filtered}
        emptyMessage="No users match search"
        exportFilename="users-export.csv"
        exportHeaders={['Name', 'Phone', 'Email', 'Role', 'Wallet']}
        exportRows={filtered.map((u: any) => [u.name, u.phone, u.email, u.role, u.walletBalance])}
      />
    </div>
  );
}

const ORDER_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  preparing: 'bg-purple-50 text-purple-800 border-purple-200',
  ready: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  picked_up: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  out_for_delivery: 'bg-orange-50 text-orange-800 border-orange-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
};

const EMPTY_ORDER_FILTERS = {
  kitchenOwnerId: '', kitchenId: '', customerName: '', phone: '', orderId: '',
  status: '', paymentStatus: '', deliveryPartnerName: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '',
};

const ORDER_PAGE_SIZE = 25;

function getOrderKitchenIds(order: any): string[] {
  const ids = new Set<string>();
  order.items?.forEach((item: any) => {
    const ck = item.menuItem?.cloudKitchen;
    if (ck) ids.add(typeof ck === 'object' ? ck._id : String(ck));
  });
  return [...ids];
}

function getOrderKitchenName(order: any): string {
  const ck = order.items?.[0]?.menuItem?.cloudKitchen;
  return typeof ck === 'object' ? ck?.name || '—' : '—';
}

function getDeliveryPartnerName(order: any, deliveryPartners: any[]): string {
  if (order.deliveryPartner?.name) return order.deliveryPartner.name;
  const id = order.deliveryPartner?._id || order.deliveryPartner;
  if (!id) return '—';
  return deliveryPartners?.find((p: any) => p._id === id)?.name || '—';
}

function formatOrderAddress(addr: any): string {
  if (!addr) return '—';
  return [addr.fullAddress, addr.street, addr.area, addr.city, addr.landmark].filter(Boolean).join(', ') || '—';
}

function getOrderPaymentStatus(order: any): string {
  if (order.paymentStatus) return order.paymentStatus;
  return order.paymentId || order.paymentMethod === 'razorpay' ? 'paid' : 'pending';
}

function formatOrderId(id: string) {
  return id ? `ORD-${id.slice(-8).toUpperCase()}` : '—';
}

function estimateOrderEta(createdAt: string) {
  const d = new Date(createdAt);
  d.setMinutes(d.getMinutes() + 45);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function exportOrdersCsv(rows: any[], deliveryPartners: any[]) {
  const hdr = ['Order ID', 'Customer', 'Phone', 'Amount', 'Payment', 'Kitchen', 'Delivery', 'Status', 'Created'];
  const body = rows.map(o => [o._id, o.user?.name, o.user?.phone, o.totalAmount, getOrderPaymentStatus(o), getOrderKitchenName(o), getDeliveryPartnerName(o, deliveryPartners), o.status, o.createdAt].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([[hdr.join(','), ...body].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

export function OrdersTab({ orders, fetchAll, headers, API_URL, search, setSearch, dateFilter, setDateFilter, deliveryPartners, kitchens = [], users = [], user }: any) {
  const isAdmin = user?.role === 'admin';
  const [sortField, setSortField] = React.useState<'createdAt' | 'totalAmount' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [drawerOrder, setDrawerOrder] = React.useState<any>(null);
  const [showFilters, setShowFilters] = React.useState(isAdmin);
  const [filterDraft, setFilterDraft] = React.useState({ ...EMPTY_ORDER_FILTERS });
  const [appliedFilters, setAppliedFilters] = React.useState({ ...EMPTY_ORDER_FILTERS });
  const [headerDateFrom, setHeaderDateFrom] = React.useState('');
  const [headerDateTo, setHeaderDateTo] = React.useState('');

  const kitchenOwners = users.filter((u: any) => u.role === 'kitchen-owner');
  const todayStr = new Date().toISOString().split('T')[0];

  const kitchenIdsForOwner = appliedFilters.kitchenOwnerId
    ? kitchens.filter((k: any) => (k.owner?._id || k.owner) === appliedFilters.kitchenOwnerId).map((k: any) => k._id)
    : null;

  const hasActiveAdminFilters = isAdmin && Object.values(appliedFilters).some(v => v !== '');

  const filteredOrders = orders.filter((o: any) => {
    const q = search?.toLowerCase() || '';
    const matchesSearch = !q ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.user?.phone?.includes(search) ||
      o._id?.toLowerCase().includes(q) ||
      formatOrderId(o._id).toLowerCase().includes(q);

    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    const amount = Number(o.totalAmount) || 0;
    const payStatus = getOrderPaymentStatus(o);

    if (isAdmin) {
      if (headerDateFrom && orderDate < headerDateFrom) return false;
      if (headerDateTo && orderDate > headerDateTo) return false;
      if (appliedFilters.customerName && !o.user?.name?.toLowerCase().includes(appliedFilters.customerName.toLowerCase())) return false;
      if (appliedFilters.phone && !o.user?.phone?.includes(appliedFilters.phone)) return false;
      if (appliedFilters.orderId && !o._id?.toLowerCase().includes(appliedFilters.orderId.toLowerCase())) return false;
      if (appliedFilters.status && o.status !== appliedFilters.status) return false;
      if (appliedFilters.paymentStatus && payStatus !== appliedFilters.paymentStatus) return false;
      if (appliedFilters.deliveryPartnerName) {
        const dp = getDeliveryPartnerName(o, deliveryPartners).toLowerCase();
        if (!dp.includes(appliedFilters.deliveryPartnerName.toLowerCase())) return false;
      }
      if (appliedFilters.kitchenOwnerId) {
        const ids = getOrderKitchenIds(o);
        if (!kitchenIdsForOwner?.length || !ids.some(id => kitchenIdsForOwner.includes(id))) return false;
      }
      if (appliedFilters.kitchenId) {
        if (!getOrderKitchenIds(o).includes(appliedFilters.kitchenId)) return false;
      }
      if (appliedFilters.dateFrom && orderDate < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && orderDate > appliedFilters.dateTo) return false;
      if (appliedFilters.amountMin && amount < Number(appliedFilters.amountMin)) return false;
      if (appliedFilters.amountMax && amount > Number(appliedFilters.amountMax)) return false;
      return matchesSearch;
    }

    const matchesDate = !dateFilter || orderDate === dateFilter;
    return matchesSearch && matchesDate;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortField === 'totalAmount') cmp = (Number(a.totalAmount) || 0) - (Number(b.totalAmount) || 0);
    else cmp = String(a.status).localeCompare(String(b.status));
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ORDER_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = sortedOrders.slice((safePage - 1) * ORDER_PAGE_SIZE, safePage * ORDER_PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, appliedFilters, headerDateFrom, headerDateTo, dateFilter, sortField, sortOrder]);

  const kpis = React.useMemo(() => {
    const base = isAdmin ? orders : filteredOrders;
    const todayOrders = base.filter((o: any) => new Date(o.createdAt).toISOString().split('T')[0] === todayStr);
    return {
      total: base.length,
      active: base.filter((o: any) => !['delivered', 'cancelled'].includes(o.status)).length,
      preparing: base.filter((o: any) => o.status === 'preparing').length,
      outForDelivery: base.filter((o: any) => o.status === 'out_for_delivery').length,
      deliveredToday: todayOrders.filter((o: any) => o.status === 'delivered').length,
      cancelled: base.filter((o: any) => o.status === 'cancelled').length,
      revenueToday: todayOrders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (Number(o.totalAmount) || 0), 0),
    };
  }, [orders, filteredOrders, isAdmin, todayStr]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />;

  const applyFilters = () => setAppliedFilters({ ...filterDraft });
  const clearFilters = () => {
    setFilterDraft({ ...EMPTY_ORDER_FILTERS });
    setAppliedFilters({ ...EMPTY_ORDER_FILTERS });
    setHeaderDateFrom('');
    setHeaderDateTo('');
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pagedOrders.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pagedOrders.map((o: any) => o._id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const patchStatus = async (orderId: string, status: string) => {
    const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if ((await res.json()).success) { fetchAll(); if (drawerOrder?._id === orderId) setDrawerOrder((d: any) => ({ ...d, status })); }
  };

  const assignPartner = async (orderId: string, deliveryPartnerId: string) => {
    const res = await fetch(`${API_URL}/admin/orders/${orderId}/assign-delivery`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryPartnerId }),
    });
    if ((await res.json()).success) fetchAll();
  };

  const inputCls = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-100';

  const statusBadge = (status: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${ORDER_STATUS_STYLE[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );

  /* ——— Kitchen owner: compact ERP table ——— */
  if (!isAdmin) {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="flex-1 text-sm bg-transparent focus:outline-none" />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={inputCls + ' w-auto'} />
          {dateFilter && <button type="button" onClick={() => setDateFilter('')} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Clear date</button>}
          <button type="button" onClick={() => fetchAll()} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Items</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Time</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400 text-xs font-semibold uppercase">No orders</td></tr>
                ) : pagedOrders.map((o: any, i: number) => (
                  <tr key={o._id} className={`border-b border-slate-100 ${i % 2 ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{formatOrderId(o._id)}</td>
                    <td className="px-4 py-3">{o.user?.name || 'Guest'}<br /><span className="text-xs text-slate-400">{o.user?.phone}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">{o.items?.map((it: any) => `${it.menuItem?.name || it.name}×${it.quantity || 1}`).join(', ')}</td>
                    <td className="px-4 py-3 font-semibold">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={e => patchStatus(o._id, e.target.value)} className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
              <span>Page {safePage} of {totalPages} · {sortedOrders.length} orders</span>
              <div className="flex gap-2">
                <button disabled={safePage <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
                <button disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ——— Admin: enterprise order management ——— */
  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">{sortedOrders.length} orders · updated live</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Global search…" className="flex-1 text-sm focus:outline-none min-w-0" />
          </div>
          <input type="date" value={headerDateFrom} onChange={e => setHeaderDateFrom(e.target.value)} className={inputCls + ' w-[130px]'} title="From" />
          <span className="text-slate-300">—</span>
          <input type="date" value={headerDateTo} onChange={e => setHeaderDateTo(e.target.value)} className={inputCls + ' w-[130px]'} title="To" />
          <button type="button" onClick={() => exportOrdersCsv(sortedOrders, deliveryPartners)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><Download className="w-3.5 h-3.5" /> Export CSV</button>
          <button type="button" onClick={() => fetchAll()} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
          <button type="button" disabled={selectedIds.size === 0} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg disabled:opacity-40"><MoreHorizontal className="w-3.5 h-3.5" /> Bulk ({selectedIds.size})</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: 'Total', value: kpis.total },
          { label: 'Active', value: kpis.active },
          { label: 'Preparing', value: kpis.preparing },
          { label: 'Out for delivery', value: kpis.outForDelivery },
          { label: 'Delivered today', value: kpis.deliveredToday },
          { label: 'Cancelled', value: kpis.cancelled },
          { label: 'Revenue today', value: `₹${kpis.revenueToday.toLocaleString('en-IN')}` },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">{k.label}</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-600 bg-slate-50 border-b border-slate-200 hover:bg-slate-100">
          Advanced filters {hasActiveAdminFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showFilters && (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 border-b border-slate-200">
            <input placeholder="Order ID" value={filterDraft.orderId} onChange={e => setFilterDraft(f => ({ ...f, orderId: e.target.value }))} className={inputCls} />
            <input placeholder="Customer" value={filterDraft.customerName} onChange={e => setFilterDraft(f => ({ ...f, customerName: e.target.value }))} className={inputCls} />
            <input placeholder="Phone" value={filterDraft.phone} onChange={e => setFilterDraft(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
            <input placeholder="Delivery partner" value={filterDraft.deliveryPartnerName} onChange={e => setFilterDraft(f => ({ ...f, deliveryPartnerName: e.target.value }))} className={inputCls} />
            <select value={filterDraft.kitchenOwnerId} onChange={e => setFilterDraft(f => ({ ...f, kitchenOwnerId: e.target.value }))} className={inputCls}>
              <option value="">All owners</option>
              {kitchenOwners.map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <select value={filterDraft.kitchenId} onChange={e => setFilterDraft(f => ({ ...f, kitchenId: e.target.value }))} className={inputCls}>
              <option value="">All kitchens</option>
              {kitchens.map((k: any) => <option key={k._id} value={k._id}>{k.name}</option>)}
            </select>
            <select value={filterDraft.status} onChange={e => setFilterDraft(f => ({ ...f, status: e.target.value }))} className={inputCls}>
              <option value="">Status</option>
              {['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filterDraft.paymentStatus} onChange={e => setFilterDraft(f => ({ ...f, paymentStatus: e.target.value }))} className={inputCls}>
              <option value="">Payment</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input type="date" value={filterDraft.dateFrom} onChange={e => setFilterDraft(f => ({ ...f, dateFrom: e.target.value }))} className={inputCls} />
            <input type="date" value={filterDraft.dateTo} onChange={e => setFilterDraft(f => ({ ...f, dateTo: e.target.value }))} className={inputCls} />
            <input type="number" placeholder="Min ₹" value={filterDraft.amountMin} onChange={e => setFilterDraft(f => ({ ...f, amountMin: e.target.value }))} className={inputCls} />
            <input type="number" placeholder="Max ₹" value={filterDraft.amountMax} onChange={e => setFilterDraft(f => ({ ...f, amountMax: e.target.value }))} className={inputCls} />
            <div className="col-span-2 flex gap-2 items-end">
              <button type="button" onClick={applyFilters} className="flex-1 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600">Apply</button>
              <button type="button" onClick={clearFilters} className="flex-1 py-2 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50">Reset</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-800 text-white sticky top-0 z-20">
              <tr>
                <th className="w-10 px-3 py-2.5"><input type="checkbox" checked={pagedOrders.length > 0 && selectedIds.size === pagedOrders.length} onChange={toggleSelectAll} className="rounded" /></th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase">Order ID</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase">Customer</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase">Kitchen</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase cursor-pointer" onClick={() => toggleSort('totalAmount')}>Amount <SortIcon field="totalAmount" /></th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase">Payment</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase">Partner</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase cursor-pointer" onClick={() => toggleSort('status')}>Status <SortIcon field="status" /></th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase cursor-pointer" onClick={() => toggleSort('createdAt')}>Created <SortIcon field="createdAt" /></th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase">ETA</th>
                <th className="w-16 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length === 0 ? (
                <tr><td colSpan={11} className="py-20 text-center text-slate-400 text-xs font-semibold uppercase">No orders match filters</td></tr>
              ) : pagedOrders.map((o: any, i: number) => (
                <tr key={o._id} className={`border-b border-slate-100 hover:bg-orange-50/30 cursor-pointer ${i % 2 ? 'bg-slate-50/40' : 'bg-white'}`} onClick={() => setDrawerOrder(o)}>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(o._id)} onChange={() => toggleSelect(o._id)} className="rounded" /></td>
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-800">{formatOrderId(o._id)}</td>
                  <td className="px-3 py-2"><div className="font-medium text-slate-900">{o.user?.name || 'Guest'}</div><div className="text-xs text-slate-400">{o.user?.phone}</div></td>
                  <td className="px-3 py-2 text-xs text-slate-600 max-w-[120px] truncate">{getOrderKitchenName(o)}</td>
                  <td className="px-3 py-2 font-semibold">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getOrderPaymentStatus(o) === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{getOrderPaymentStatus(o)}</span></td>
                  <td className="px-3 py-2 text-xs">{getDeliveryPartnerName(o, deliveryPartners)}</td>
                  <td className="px-3 py-2">{statusBadge(o.status)}</td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">{fmtTime(o.createdAt)}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{estimateOrderEta(o.createdAt)}</td>
                  <td className="px-3 py-2" onClick={e => e.stopPropagation()}><button type="button" onClick={() => setDrawerOrder(o)} className="p-1.5 rounded hover:bg-slate-200" title="View"><Eye className="w-4 h-4 text-slate-500" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          <span>Showing {(safePage - 1) * ORDER_PAGE_SIZE + 1}–{Math.min(safePage * ORDER_PAGE_SIZE, sortedOrders.length)} of {sortedOrders.length}</span>
          <div className="flex items-center gap-2">
            <button disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1.5 border rounded disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-semibold">{safePage} / {totalPages}</span>
            <button disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-1.5 border rounded disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {drawerOrder && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOrder(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Order details</p>
                <p className="font-mono font-bold text-slate-900">{formatOrderId(drawerOrder._id)}</p>
              </div>
              <button type="button" onClick={() => setDrawerOrder(null)} className="p-2 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
              <div>{statusBadge(drawerOrder.status)}</div>
              <section>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Customer</h4>
                <p className="font-semibold">{drawerOrder.user?.name}</p>
                <p className="text-slate-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{drawerOrder.user?.phone || '—'}</p>
                <p className="text-slate-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" />{drawerOrder.user?.email || '—'}</p>
              </section>
              <section>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Delivery</h4>
                <p className="text-slate-700 flex gap-1"><MapPin className="w-3 h-3 shrink-0 mt-0.5" />{formatOrderAddress(drawerOrder.deliveryAddress)}</p>
              </section>
              <section>
                <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Items</h4>
                <ul className="space-y-2">
                  {drawerOrder.items?.map((it: any, idx: number) => (
                    <li key={idx} className="flex justify-between text-xs border-b border-slate-100 pb-2">
                      <span>{it.menuItem?.name || it.name} ×{it.quantity || 1}</span>
                      <span className="font-semibold">₹{it.price || 0}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-bold text-right mt-2">Total ₹{Number(drawerOrder.totalAmount || 0).toLocaleString('en-IN')}</p>
              </section>
              {drawerOrder.specialInstructions && (
                <section className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs italic">{drawerOrder.specialInstructions}</section>
              )}
              <section>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Assign delivery partner</label>
                <select value={drawerOrder.deliveryPartner?._id || drawerOrder.deliveryPartner || ''} onChange={e => assignPartner(drawerOrder._id, e.target.value)} className={inputCls}>
                  <option value="">Unassigned</option>
                  {deliveryPartners?.map((dp: any) => <option key={dp._id} value={dp._id}>{dp.name}</option>)}
                </select>
              </section>
              <section>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Update status</label>
                <select value={drawerOrder.status} onChange={e => patchStatus(drawerOrder._id, e.target.value)} className={inputCls}>
                  {['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </section>
            </div>
            <div className="p-4 border-t border-slate-200 flex flex-wrap gap-2">
              {drawerOrder.user?.phone && <a href={`tel:${drawerOrder.user.phone}`} className="flex-1 min-w-[100px] py-2 text-center text-xs font-bold border rounded-lg hover:bg-slate-50">Call</a>}
              <button type="button" onClick={() => window.print()} className="flex items-center justify-center gap-1 flex-1 min-w-[100px] py-2 text-xs font-bold border rounded-lg hover:bg-slate-50"><Printer className="w-3.5 h-3.5" /> Print</button>
              <button type="button" onClick={() => patchStatus(drawerOrder._id, 'cancelled')} className="flex-1 min-w-[100px] py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function MenuTab({ menuItems, search, setSearch, setMenuModal, setImgPreview, kitchens, fetchAll, headers, API_URL, isDraftTab, user, setSelectedCategory, categories }: any) {
  const [kitchenFilter, setKitchenFilter] = React.useState('');
  const [nameFilter, setNameFilter] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  const filteredItems = menuItems.filter((m: any) => {
    const isActuallyDraft = m.isDraft === true || String(m.isDraft) === 'true';
    // Exclude draft items from the listing
    if (isActuallyDraft) return false;

    const matchesSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());

    // Kitchen-owner only sees their own menu items
    if (user?.role === 'kitchen-owner') {
      const kitchenId = (user as any).kitchenId || (user as any).assignedKitchen;
      const isOwnMenu = typeof m.cloudKitchen === 'object' 
        ? m.cloudKitchen?._id === kitchenId 
        : m.cloudKitchen === kitchenId;
      return matchesSearch && isOwnMenu;
    }

    // Admin can filter by kitchen and name
    if (user?.role === 'admin') {
      const matchesKitchen = !kitchenFilter ||
        (kitchenFilter === 'no-kitchen' ? !m.cloudKitchen :
          (typeof m.cloudKitchen === 'object' ? m.cloudKitchen?._id === kitchenFilter : m.cloudKitchen === kitchenFilter)
        );
      const matchesName = !nameFilter || m.name?.toLowerCase().includes(nameFilter.toLowerCase());
      return matchesSearch && matchesKitchen && matchesName;
    }

    return matchesSearch;
  });

  return (
    <div className={ERP.page}>
      <span className='flex justify-between -mt-3'>

        <button type="button" onClick={() => { setSelectedCategory('regular'); setMenuModal({ open: true, data: null }); }} className={`${ERP.btn} ${ERP.btnPrimary}`}>
          <Plus className="w-4 h-4" /> Add item
        </button>

        {/* Drafts removed: only show live items */}
      </span>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
        <div className="flex-1 flex items-center  bg-white rounded-md border border-slate-200 px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…" className="flex-1 text-sm focus:outline-none placeholder:text-slate-400" />
        </div>
        {user?.role === 'admin' && (
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all ${showFilters ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              <span className="inline-flex items-center gap-1.5"><Search className="w-4 h-4" /> Filters</span>
              {user?.role === 'admin' && (

                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 z-50 min-w-[300px] animate-in fade-in slide-in-from-top-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Filter by Name</label>
                    <select
                      value={nameFilter}
                      onChange={e => setNameFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">All Items</option>
                      <option value="dal">Dal Items</option>
                      <option value="sabji">Sabji Items</option>
                      <option value="roti">Roti Items</option>
                      <option value="raita">Raita Items</option>
                      <option value="rice">Rice Items</option>
                      <option value="paneer">Paneer Items</option>
                      <option value="chicken">Chicken Items</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Kitchen</label>
                    <select
                      value={kitchenFilter}
                      onChange={e => setKitchenFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">All Kitchens</option>
                      {kitchens?.map((k: any) => (
                        <option key={k._id} value={k._id}>{k.name}</option>
                      ))}
                      <option value="no-kitchen">No Kitchen</option>
                    </select>
                  </div>
                  <button
                    onClick={() => { setNameFilter(''); setKitchenFilter(''); setShowFilters(false); }}
                    className="w-full py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold">No menu items found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredItems.map((m: any) => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                {/* Image with overlay */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100">
                  <img
                    src={m.image?.startsWith('http') ? m.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = ''; }}
                  />
                  {/* Overlay with name and category */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="font-black text-white text-lg leading-tight mb-1">{m.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.category === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {m.category || 'Regular'}
                          </span>
                          {/* Draft badge removed */}
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="text-right">
                          <p className="font-black text-white text-xl leading-none">₹{m.price}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details section */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      {m.cloudKitchen?.name || 'No Kitchen'}
                    </span>
                    <span className="px-2 py-1 bg-slate-50 rounded-full text-[10px] font-medium">Live</span>
                  </div>

                  {m.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{m.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => { 
                        setImgPreview(''); 
                        setSelectedCategory(m?.category || 'regular');
                        setMenuModal({ open: true, data: m }); 
                      }}
                      className="flex-1 px-3 py-2 text-xs font-bold bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${m.name}"?\n\nThis will permanently remove this menu item.`)) return;
                        try {
                          const res = await fetch(`${API_URL}/admin/menu/${m._id}`, {
                            method: 'DELETE',
                            headers
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert('✅ ' + data.message);
                            fetchAll();
                          } else {
                            alert('❌ ' + (data.error || 'Failed to delete'));
                          }
                        } catch (err) {
                          console.error('Delete error:', err);
                          alert('❌ Failed to delete menu item');
                        }
                      }}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition"
                      title="Delete menu item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function KitchensTab({ kitchens, menuItems, setKitchenModal, fetchAll, headers, API_URL, users = [], kitchenOwners = [] }: any) {
  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState<'table' | 'grid'>('table');

  const menuCount = (kitchenId: string) =>
    menuItems.filter((m: any) => m.cloudKitchen?._id === kitchenId || m.cloudKitchen === kitchenId).length;

  const ownerName = (k: any) => {
    const ownerId = k.owner?._id || k.owner;
    if (k.owner?.name) return k.owner.name;
    if (ownerId && users && users.length > 0) {
      const user = users.find((u: any) => u._id === ownerId);
      if (user?.name) return user.name;
    }
    return k.ownerName || k.ownerEmail || '—';
  };

  const getOwnerDetails = (k: any) => {
    const ownerId = k.owner?._id || k.owner;
    if (k.owner?.name) return { name: k.owner.name, email: k.owner.email, phone: k.owner.phone, id: k.owner._id };
    if (ownerId && users && users.length > 0) {
      const user = users.find((u: any) => u._id === ownerId);
      if (user) return { name: user.name, email: user.email, phone: user.phone, id: user._id };
    }
    return {
      name: k.ownerName || k.ownerEmail || '—',
      email: k.ownerEmail || '—',
      phone: k.ownerPhone || '—',
      id: null
    };
  };

  const enriched = kitchens.map((k: any) => ({
    ...k,
    menuCount: menuCount(k._id),
    ownerLabel: ownerName(k),
    lat: k.location?.coordinates?.[1]?.toFixed(4) ?? '—',
    lng: k.location?.coordinates?.[0]?.toFixed(4) ?? '—',
  }));

  const filtered = enriched.filter((k: any) =>
    !search ||
    k.name?.toLowerCase().includes(search.toLowerCase()) ||
    k.ownerLabel?.toLowerCase().includes(search.toLowerCase()) ||
    k.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    k._id?.toLowerCase().includes(search.toLowerCase())
  );

  const unassignedOwners = (kitchenOwners || []).filter((o: any) => !o.kitchenId);

  const unassignedKitchenRows = unassignedOwners.map((owner: any) => ({
    _id: `unassigned-${owner._id}`,
    name: null,
    owner: owner,
    ownerName: owner.name,
    ownerPhone: owner.phone,
    ownerEmail: owner.email,
    menuCount: 0,
    createdAt: owner.createdAt,
    location: null,
    isUnassigned: true
  }));

  const tableRows = [...filtered, ...unassignedKitchenRows];

  const deleteKitchen = async (id: string) => {
    if (!confirm('🚨 CRITICAL ACTION: Delete this cloud kitchen and all associated data permanently?\n\nThis cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/cloudkitchens/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (result.success) {
        alert('✅ Kitchen deleted successfully');
        fetchAll();
      } else {
        alert('❌ Failed to delete: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete kitchen error:', err);
      alert('❌ Error connecting to server');
    }
  };

  const toggleKitchenStatus = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/cloudkitchens/${id}/status`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current })
      });
      const result = await res.json();
      if (result.success) {
        fetchAll();
      } else {
        alert('❌ Failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error connecting to server');
    }
  };

  return (
    <div className={ERP.page}>
      <AdminPageHeader
        title="Cloud Kitchens"
        subtitle={`${filtered.length} of ${kitchens.length} hubs · Admin Control`}
        actions={
          <button type="button" onClick={() => setKitchenModal({ open: true, data: null })} className={`${ERP.btn} ${ERP.btnPrimary}`}>
            <Plus className="w-4 h-4" /> Add kitchen
          </button>
        }
      />

      <AdminKpiGrid items={[
        { label: 'Total kitchens', value: kitchens.length },
        { label: 'With menu items', value: enriched.filter((k: any) => k.menuCount > 0).length },
        { label: 'Total menu items', value: menuItems.length },
        { label: 'Avg items / kitchen', value: kitchens.length ? Math.round(menuItems.length / kitchens.length) : 0 },
      ]} />

      <AdminToolbar search={search} setSearch={setSearch} searchPlaceholder="Search kitchen, owner, ID…" onRefresh={fetchAll} />

      {view === 'table' ? (
        <AdminDataTable
          showSearch={false}
          columns={[
            { key: '_id', header: 'Kitchen ID', sortable: true, render: (k: any) => <span className="font-mono text-xs">{k._id?.slice(-8).toUpperCase()}</span> },
            { key: 'name', header: 'Kitchen name', sortable: true },
            {
              key: 'isActive',
              header: 'Status',
              render: (k: any) => (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleKitchenStatus(k._id, k.isActive); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all ${k.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                >
                  {k.isActive ? 'Active' : 'Inactive'}
                </button>
              )
            },
            { key: 'ownerName', header: 'Owner Name', sortable: true, render: (k: any) => getOwnerDetails(k).name },
            { key: 'ownerPhone', header: 'Phone', render: (k: any) => getOwnerDetails(k).phone },
            { key: 'ownerEmail', header: 'Email', render: (k: any) => getOwnerDetails(k).email },
            { key: 'menuCount', header: 'Menu items', sortable: true },
            { key: 'createdAt', header: 'Created', sortable: true, render: (k: any) => k.createdAt ? fmt(k.createdAt) : '—' },
            {
              key: 'actions', header: 'Actions', render: (k: any) => (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={() => { console.log('🔧 Edit kitchen clicked (table):', { kitchenId: k._id, name: k.name, owner: k.owner, ownerLabel: k.ownerLabel, fullData: k }); setKitchenModal({ open: true, data: k }); }} className={`${ERP.btn} ${ERP.btnSecondary} py-1 px-2`}>Edit</button>
                  {k.location?.coordinates && (
                    <button
                      type="button"
                      onClick={() => {
                        const [lng, lat] = k.location.coordinates;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                      }}
                      className={`${ERP.btn} ${ERP.btnSecondary} py-1 px-2`}
                    >
                      Map
                    </button>
                  )}
                  <button type="button" onClick={() => deleteKitchen(k._id)} className={`${ERP.btn} ${ERP.btnDanger} py-1 px-2`}>Delete</button>
                </div>
              ),
            },
          ]}
          rows={tableRows}
          emptyMessage="No kitchens match search"
          onRowClick={(k: any) => setKitchenModal({ open: true, data: k })}
          exportFilename={`cloud-kitchens-${new Date().toISOString().split('T')[0]}.csv`}
          exportHeaders={['Kitchen ID', 'Name', 'Owner Name', 'Phone', 'Email', 'Menu Items', 'Created']}
          exportRows={filtered.map((k: any) => [k._id, k.name, k.ownerName || '', k.ownerPhone || '', k.ownerEmail || '', k.menuCount, k.createdAt ? fmt(k.createdAt) : ''])}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((k: any) => (
            <div key={k._id} className={`${ERP.panel} hover:border-slate-300 transition-colors overflow-hidden group`}>
              <div className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Home className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { console.log('🔧 Plus icon edit clicked (grid card):', { kitchenId: k._id, name: k.name, owner: k.owner, ownerLabel: k.ownerLabel, fullData: k }); setKitchenModal({ open: true, data: k }); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{k.name}</h3>
                    <div className="flex items-center gap-2 mt-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleKitchenStatus(k._id, k.isActive); }}>
                      <span className={`w-2 h-2 rounded-full ${k.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <p className={`text-[10px] font-black uppercase tracking-widest ${k.isActive ? 'text-emerald-600' : 'text-red-600'}`}>{k.isActive ? 'Active Hub' : 'Inactive'}</p>
                    </div>
                    {k.owner?._id || k.owner ? (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Owner Assigned</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">{getOwnerDetails(k).name}</p>
                        {getOwnerDetails(k).email && getOwnerDetails(k).email !== '—' && (
                          <p className="text-[9px] text-slate-500 mt-0.5">{getOwnerDetails(k).email}</p>
                        )}
                        {getOwnerDetails(k).phone && getOwnerDetails(k).phone !== '—' && (
                          <p className="text-[9px] text-slate-500">{getOwnerDetails(k).phone}</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">No Owner Assigned</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Menu Size</p>
                      <p className="text-sm font-black text-slate-700">{k.menuCount} Items</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleKitchenStatus(k._id, k.isActive); }}
                        className={`text-[10px] font-bold rounded-full px-2 py-0.5 inline-block shadow-sm ${k.isActive ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}
                      >
                        {k.isActive ? 'Online' : 'Offline'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="truncate">{k.location?.coordinates ? `${k.location.coordinates[1].toFixed(4)}°N, ${k.location.coordinates[0].toFixed(4)}°E` : 'GPS Coordinates Pending'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-7 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center gap-3">
                <button
                  onClick={() => { console.log('🔧 Config Hub clicked (grid):', { kitchenId: k._id, name: k.name, owner: k.owner, ownerLabel: k.ownerLabel, fullData: k }); setKitchenModal({ open: true, data: k }); }}
                  className="flex-1 py-3 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm"
                >
                  Config Hub
                </button>
                {k.location?.coordinates && (
                  <button
                    onClick={() => {
                      const [lng, lat] = k.location.coordinates;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-orange-500 hover:border-orange-100 transition shadow-sm"
                  >
                    🧭
                  </button>
                )}
                <button
                  onClick={async () => deleteKitchen(k._id)}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsTab({ categories = [], fetchAll, headers, API_URL, user }: any) {
  const [catModal, setCatModal] = React.useState<{ open: boolean; data: any }>({ open: false, data: null });
  const [locationModal, setLocationModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [locationSaving, setLocationSaving] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  
  const [form, setForm] = React.useState({ 
    name: '', 
    purchasePrice: '', 
    sellPrice: ''
  });
  
  const [locationForm, setLocationForm] = React.useState({
    latitude: '',
    longitude: '',
    geoLimit: '5000'
  });

  React.useEffect(() => {
    if (catModal.open && catModal.data) {
      setForm({ 
        name: catModal.data.name || '', 
        purchasePrice: String(catModal.data.purchasePrice || ''), 
        sellPrice: String(catModal.data.sellPrice || '')
      });
    } else if (!catModal.open) {
      setForm({ name: '', purchasePrice: '', sellPrice: '' });
    }
  }, [catModal]);

  const openNew = () => setCatModal({ open: true, data: null });
  const openEdit = (c: any) => setCatModal({ open: true, data: c });

  const handleCaptureLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationForm(f => ({ 
          ...f, 
          latitude: String(pos.coords.latitude.toFixed(6)), 
          longitude: String(pos.coords.longitude.toFixed(6)) 
        }));
        console.log('✅ Location captured:', pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        console.error('❌ Location error:', err);
        alert('Failed to get location: ' + err.message);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const save = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name || String(form.name).trim() === '') return alert('Name required');
    setSaving(true);
    try {
      const payload = { 
        name: form.name.trim(), 
        purchasePrice: Number(form.purchasePrice || 0), 
        sellPrice: Number(form.sellPrice || 0)
      };
      let res;
      if (catModal.data && catModal.data._id) {
        res = await fetch(`${API_URL}/admin/categories/${catModal.data._id}`, { 
          method: 'PUT', 
          headers: { ...headers, 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
      } else {
        res = await fetch(`${API_URL}/admin/categories`, { 
          method: 'POST', 
          headers: { ...headers, 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
      }
      const data = await res.json();
      if (data.success) {
        setCatModal({ open: false, data: null });
        fetchAll();
      } else alert(data.error || 'Failed');
    } catch (err) {
      console.error('Save category error', err);
      alert('Failed to save');
    }
    setSaving(false);
  };

  const saveLocationToAllCategories = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!locationForm.latitude || !locationForm.longitude) {
      return alert('Please set latitude and longitude');
    }
    
    if (categories.length === 0) {
      return alert('No categories to update');
    }

    setLocationSaving(true);
    try {
      const payload = {
        latitude: Number(locationForm.latitude),
        longitude: Number(locationForm.longitude),
        geoLimit: Number(locationForm.geoLimit || 5000)
      };

      let successCount = 0;
      for (const category of categories) {
        const res = await fetch(`${API_URL}/admin/categories/${category._id}`, {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) successCount++;
      }

      alert(`✅ Location updated for ${successCount}/${categories.length} categories`);
      setLocationModal(false);
      setLocationForm({ latitude: '', longitude: '', geoLimit: '5000' });
      fetchAll();
    } catch (err) {
      console.error('Save location error', err);
      alert('Failed to save location');
    }
    setLocationSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, { 
        method: 'DELETE', 
        headers 
      });
      const data = await res.json();
      if (data.success) fetchAll(); 
      else alert(data.error || 'Failed');
    } catch (err) { 
      alert('Failed to delete'); 
    }
  };

  return (
    <div className={ERP.page}>
      <AdminPageHeader 
        title="Settings & Categories" 
        subtitle={`${categories.length} categories`} 
        actions={
          <div className="flex gap-2">
            <button 
              onClick={() => setLocationModal(true)} 
              className={`${ERP.btn} ${ERP.btnPrimary}`}
            >
              <MapPin className="w-4 h-4" /> Set Location
            </button>
            <button 
              onClick={openNew} 
              className={`${ERP.btn} ${ERP.btnPrimary}`}
            >
              <Plus className="w-4 h-4" /> Add category
            </button>
          </div>
        } 
      />

      <div className={ERP.panel}>
        <AdminDataTable
          showSearch={false}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'purchasePrice', header: 'Purchase Price', render: (c: any) => `₹${(c.purchasePrice || 0).toLocaleString('en-IN')}` },
            { key: 'sellPrice', header: 'Selling Price', render: (c: any) => `₹${(c.sellPrice || 0).toLocaleString('en-IN')}` },
            { key: 'location', header: 'Location', render: (c: any) => c.latitude && c.longitude ? `📍 ${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : '—' },
            { key: 'geoLimit', header: 'Geo Limit', render: (c: any) => c.geoLimit ? `${(c.geoLimit / 1000).toFixed(1)}km` : '—' },
            { key: 'actions', header: '', render: (c: any) => (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openEdit(c)} 
                  className={`${ERP.btn} ${ERP.btnSecondary} py-1 px-2`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => remove(c._id)} 
                  className={`${ERP.btn} ${ERP.btnDanger} py-1 px-2`}
                >
                  Delete
                </button>
              </div>
            ) }
          ]}
          rows={categories}
          emptyMessage="No categories"
        />
      </div>

      {catModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto">
          <form onSubmit={save} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg my-8">
            <h3 className="font-black text-lg mb-4">{catModal.data ? 'Edit Category' : 'Add Category'}</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Category Name</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g., Lunch Tiffin"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">Purchase Price (₹)</label>
                  <input 
                    type="number" 
                    value={form.purchasePrice} 
                    onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} 
                    placeholder="Kitchen earning"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={form.sellPrice} 
                    onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))} 
                    placeholder="Customer price"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm" 
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 italic">💡 Set location using "Set Location" button at top</p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-5">
              <button 
                type="button" 
                onClick={() => setCatModal({ open: false, data: null })} 
                className={`${ERP.btn} ${ERP.btnSecondary}`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className={`${ERP.btn} ${ERP.btnPrimary}`}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {locationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto">
          <form onSubmit={saveLocationToAllCategories} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg my-8">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <span>📍</span> Set Location for All Categories
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-bold">ℹ️ This location will apply to all {categories.length} categories and their menu items</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-slate-700">Capture Location</label>
                <button 
                  type="button" 
                  onClick={handleCaptureLocation}
                  disabled={locating}
                  className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 disabled:opacity-70"
                >
                  {locating ? '📍 Getting location...' : '📍 Capture Current Location'}
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                <p className="text-xs text-slate-600 font-bold">Or manually enter:</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      value={locationForm.latitude} 
                      onChange={e => setLocationForm(f => ({ ...f, latitude: e.target.value }))} 
                      placeholder="28.6139"
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      value={locationForm.longitude} 
                      onChange={e => setLocationForm(f => ({ ...f, longitude: e.target.value }))} 
                      placeholder="77.2090"
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-xs" 
                    />
                  </div>
                </div>
              </div>

              {locationForm.latitude && locationForm.longitude && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-700">✅ Location Set</p>
                  <p className="text-xs text-green-600 mt-1 font-mono">{locationForm.latitude}, {locationForm.longitude}</p>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="block text-xs font-bold mb-1 text-slate-700">Geo-Limit (Delivery Radius in meters)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={locationForm.geoLimit} 
                    onChange={e => setLocationForm(f => ({ ...f, geoLimit: e.target.value }))} 
                    placeholder="5000"
                    className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm" 
                  />
                  <div className="px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 whitespace-nowrap flex items-center">
                    {locationForm.geoLimit ? `${(Number(locationForm.geoLimit) / 1000).toFixed(1)}km` : '—'}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setLocationModal(false)} 
                className={`${ERP.btn} ${ERP.btnSecondary}`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={locationSaving || locating || !locationForm.latitude || !locationForm.longitude} 
                className={`${ERP.btn} ${ERP.btnPrimary}`}
              >
                {locationSaving ? 'Saving…' : `Apply to ${categories.length} Categories`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function SubscriptionsTab({ subscriptions, expandedRow, setExpandedRow, fetchAll, headers, API_URL }: any) {
  return (
    <div className={ERP.page}>
      <AdminPageHeader title="Subscriptions" subtitle={`${subscriptions.length} active memberships`} />
      <div className={ERP.panel}>
        <div className={ERP.panelHead}>
          <p className="text-sm font-bold text-slate-900">Membership registry</p>
          <CreditCard className="w-4 h-4 text-slate-500" />
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-900">No active subscriptions</p>
            <p className="text-sm mt-1">New memberships will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {subscriptions.map((s: any) => (
              <div key={s._id} className="group">
                <div className="flex items-center gap-5 px-8 py-6 hover:bg-slate-50 transition-all duration-300">
                  <div className="w-10 h-10 rounded-md bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                    {s.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>{s.status || 'active'}</span>
                      <span className="text-[10px] font-bold text-slate-300">#{s._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="font-black text-slate-900 text-base leading-none">{s.user?.name || 'Anonymous User'}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 truncate">{s.user?.email || 'No email associated'}</p>
                  </div>

                  <div className="text-right shrink-0 px-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Capital</p>
                    <p className="font-black text-orange-600 text-xl leading-none">₹{(s.amount || s.totalAmount || 0).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm('Abort this subscription permanently?')) return;
                        const res = await fetch(`${API_URL}/admin/subscriptions/${s._id}`, { method: 'DELETE', headers });
                        if ((await res.json()).success) fetchAll();
                      }}
                      className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}
                      className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all ${expandedRow === s._id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                        } shadow-sm`}
                    >
                      {expandedRow === s._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedRow === s._id && (
                  <div className="px-8 pb-8 pt-2 bg-slate-50/50 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {([
                        { label: 'Selected Plan', value: s.plan || s.planName || 'Standard', Icon: Gem },
                        { label: 'Time Horizon', value: `${s.duration || s.days || '0'} Days`, Icon: CalendarDays },
                        { label: 'Commencement', value: s.startDate ? fmt(s.startDate) : 'N/A', Icon: Rocket },
                        { label: 'Termination', value: s.endDate ? fmt(s.endDate) : 'N/A', Icon: Flag },
                      ] as { label: string; value: string; Icon: LucideIcon }[]).map(row => (
                        <div key={row.label} className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <row.Icon className="w-4 h-4 text-orange-500 shrink-0" />
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{row.label}</p>
                          </div>
                          <p className="font-black text-slate-800 text-xs">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const NOTIF_TYPE_ICON: Record<string, LucideIcon> = {
  info: Info,
  offer: Gift,
  order: Package,
  alert: AlertTriangle,
};

export function NotificationsTab({ notifications, setNotifications, notifForm, setNotifForm, notifSaving, setNotifSaving, headers, API_URL }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-orange-600" />
          </span>
          Dispatch Notification
        </h3>
        <div className="space-y-4">
          <input
            placeholder="Notification Title"
            value={notifForm.title}
            onChange={e => setNotifForm((f: any) => ({ ...f, title: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
          <textarea
            placeholder="Detailed Message"
            rows={3}
            value={notifForm.message}
            onChange={e => setNotifForm((f: any) => ({ ...f, message: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={notifForm.type}
              onChange={e => setNotifForm((f: any) => ({ ...f, type: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-3.5 text-sm font-bold focus:outline-none"
            >
              <option value="info">Announcement</option>
              <option value="offer">Marketing / Offer</option>
              <option value="order">Order Update</option>
              <option value="alert">Urgent Alert</option>
            </select>
            <button
              disabled={notifSaving || !notifForm.title || !notifForm.message}
              onClick={async () => {
                setNotifSaving(true);
                try {
                  const res = await fetch(`${API_URL}/notifications/admin`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify(notifForm)
                  });
                  const d = await res.json();
                  if (d.success) {
                    setNotifForm({ title: '', message: '', type: 'info', targetAll: true });
                    setNotifications((n: any[]) => [d.notification, ...n]);
                  } else alert(d.error || 'Failed');
                } catch { alert('Failed'); }
                setNotifSaving(false);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                {notifSaving ? 'Broadcasting…' : <><Send className="w-4 h-4" /> Push Broadcast</>}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast History</p>
        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{notifications.length} Sent</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notifications.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-900">Silence is Golden</p>
            <p className="text-slate-400 text-sm mt-1">No notifications dispatched yet</p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div key={n._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors text-orange-500">
                  {(() => {
                    const Icon = NOTIF_TYPE_ICON[n.type] || Info;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-slate-900 text-sm truncate">{n.title}</p>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete broadcast log?')) return;
                        const res = await fetch(`${API_URL}/notifications/admin/${n._id}`, { method: 'DELETE', headers });
                        if ((await res.json()).success) setNotifications((prev: any[]) => prev.filter(x => x._id !== n._id));
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{n.readBy?.length || 0} READS</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function LegalTab({ legal, setLegal, legalSaving, setLegalSaving, headers, API_URL }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </span>
          Terms & Conditions
        </h3>
        <textarea rows={10} value={legal.terms} onChange={e => setLegal((l: any) => ({ ...l, terms: e.target.value }))} placeholder="Enter Legal Terms…" className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none" />
      </div>
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-600" />
          </span>
          Privacy Policy
        </h3>
        <textarea rows={10} value={legal.privacy} onChange={e => setLegal((l: any) => ({ ...l, privacy: e.target.value }))} placeholder="Enter Privacy Policy…" className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none" />
      </div>
      <button
        disabled={legalSaving}
        onClick={async () => {
          setLegalSaving(true);
          try {
            await Promise.all([
              fetch(`${API_URL}/legalpages/terms`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Terms & Conditions', content: legal.terms }) }),
              fetch(`${API_URL}/legalpages/privacy`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Privacy Policy', content: legal.privacy }) })
            ]);
            alert('Legal documents updated');
          } catch { alert('Failed'); }
          setLegalSaving(false);
        }}
        className="w-full py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition active:scale-95"
      >
        <span className="flex items-center justify-center gap-2">
          {legalSaving ? 'Syncing Docs…' : <><Save className="w-4 h-4" /> Commit Legal Updates</>}
        </span>
      </button>
    </div>
  );
}

export function HomestyleTab({ 
  hsVideos, setHsVideos, hsVideoUploading, hsSaving, saveHomestyle, uploadVideo,
  hsScheduleBannerImages, setHsScheduleBannerImages, hsScheduleBannerUploading, setHsScheduleBannerUploading,
  hsSubscriptionBanners, setHsSubscriptionBanners, hsSubscriptionBannerUploading, setHsSubscriptionBannerUploading,
  hsScheduleSectionImages, setHsScheduleSectionImages, hsSectionUploading, setHsSectionUploading,
  uploadImage
}: any) {
  return (
    <div className="space-y-12 pb-20">
      {/* Cinematic Content Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Film className="w-5 h-5 text-orange-500" />
              Cinema & Reels
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hero Section Media</p>
          </div>
          <label className="cursor-pointer px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-100 transition active:scale-95">
            {hsVideoUploading ? 'Uploading Reel…' : '+ Add Reel'}
            <input type="file" accept="video/*" className="hidden" disabled={hsVideoUploading} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const url = await uploadVideo(file); setHsVideos((v: string[]) => [...v, url]); } catch { alert('Upload failed'); } }} />
          </label>
        </div>

        {hsVideos.length === 0 ? (
          <div className="text-center py-20 border-4 border-dashed border-slate-50 rounded-[2.5rem]">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No cinematic content uploaded</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hsVideos.map((url: string, i: number) => (
              <div key={i} className="group relative bg-slate-900 rounded-[1.5rem] overflow-hidden aspect-video shadow-xl">
                <video src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest truncate">{url.split('/').pop()}</p>
                  </div>
                  <button
                    onClick={() => setHsVideos((v: string[]) => v.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 rounded-full bg-red-500/20 text-white backdrop-blur-md hover:bg-red-500 transition flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Banner Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-500" />
              Schedule Page Banners
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sliding Banners (20vh Height)</p>
          </div>
          <label className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-100 transition active:scale-95">
            {hsScheduleBannerUploading ? 'Uploading…' : '+ Add Banner'}
            <input type="file" accept="image/*" className="hidden" disabled={hsScheduleBannerUploading} onChange={async e => { 
              const file = e.target.files?.[0]; 
              if (!file) return; 
              try { 
                setHsScheduleBannerUploading(true);
                const url = await uploadImage(file); 
                setHsScheduleBannerImages((v: string[]) => [...v, url]); 
              } catch { 
                alert('Upload failed'); 
              } finally {
                setHsScheduleBannerUploading(false);
              }
            }} />
          </label>
        </div>

        {hsScheduleBannerImages.length === 0 ? (
          <div className="text-center py-16 border-4 border-dashed border-slate-50 rounded-[2.5rem]">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No banner images uploaded</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {hsScheduleBannerImages.map((url: string, i: number) => (
              <div key={i} className="group relative bg-slate-50 rounded-[1.5rem] overflow-hidden aspect-[16/6] border-2 border-slate-100 shadow-lg">
                <img src={url} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => setHsScheduleBannerImages((v: string[]) => v.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 rounded-full bg-white/90 text-red-500 shadow-md hover:bg-red-500 hover:text-white transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Banner Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-500" />
              Subscription Page Banners
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sliding Banners for the Subscription page</p>
          </div>
          <label className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-100 transition active:scale-95">
            {hsSubscriptionBannerUploading ? 'Uploading…' : '+ Add Banner'}
            <input type="file" accept="image/*" className="hidden" disabled={hsSubscriptionBannerUploading} onChange={async e => { 
              const file = e.target.files?.[0]; 
              if (!file) return; 
              try { 
                setHsSubscriptionBannerUploading(true);
                const url = await uploadImage(file); 
                setHsSubscriptionBanners((v: string[]) => [...v, url]); 
              } catch { 
                alert('Upload failed'); 
              } finally {
                setHsSubscriptionBannerUploading(false);
              }
            }} />
          </label>
        </div>

        {hsSubscriptionBanners.length === 0 ? (
          <div className="text-center py-16 border-4 border-dashed border-slate-50 rounded-[2.5rem]">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No banner images uploaded</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {hsSubscriptionBanners.map((url: string, i: number) => (
              <div key={i} className="group relative bg-slate-50 rounded-[1.5rem] overflow-hidden aspect-[16/6] border-2 border-slate-100 shadow-lg">
                <img src={url} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => setHsSubscriptionBanners((v: string[]) => v.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 rounded-full bg-white/90 text-red-500 shadow-md hover:bg-red-500 hover:text-white transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Categories Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div>
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <Layout className="w-5 h-5 text-orange-500" />
            Schedule Category Sections
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Distinct UI Section Images</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            { id: 'regular', label: 'Regular' },
            { id: 'shahiThali', label: 'Shahi Thali' },
            { id: 'corporateOrder', label: 'Corporate Order' },
            { id: 'schoolTiffins', label: 'School Tiffins' }
          ].map(section => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{section.label}</label>
                {hsScheduleSectionImages[section.id] && (
                  <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full">Active</span>
                )}
              </div>
              
              <div className="group relative bg-slate-50 rounded-[2rem] overflow-hidden aspect-[4/3] border-4 border-double border-slate-200 flex items-center justify-center transition-all hover:border-orange-200">
                {hsScheduleSectionImages[section.id] ? (
                  <div className="w-full h-full relative">
                    <img src={hsScheduleSectionImages[section.id]} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                      <label 
                        className="px-6 py-3 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition active:scale-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Change Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setHsSectionUploading(section.id);
                              const url = await uploadImage(file);
                              setHsScheduleSectionImages((prev: any) => ({ ...prev, [section.id]: url }));
                            } catch {
                              alert('Upload failed');
                            } finally {
                              setHsSectionUploading(null);
                            }
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 transition">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setHsSectionUploading(section.id);
                          const url = await uploadImage(file);
                          setHsScheduleSectionImages((prev: any) => ({ ...prev, [section.id]: url }));
                        } catch {
                          alert('Upload failed');
                        } finally {
                          setHsSectionUploading(null);
                        }
                      }} 
                    />
                    {hsSectionUploading === section.id ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                          <Camera className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Image</p>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveHomestyle}
        disabled={hsSaving}
        className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-3"
      >
        {hsSaving ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {hsSaving ? 'Deploying Changes…' : 'Finalize & Sync All Configurations'}
      </button>
    </div>
  );
}

export function CouponsTab({ coupons, userPerformance, setCouponModal, fetchAll, headers, API_URL, performanceDateFrom, setPerformanceDateFrom, performanceDateTo, setPerformanceDateTo }: any) {
  return (
    <div className="space-y-6">
      {/* Performance Date Filter */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Performance Analytics</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit temporal window</p>
          </div>
          <Calendar className="w-8 h-8 text-orange-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Commencement Date</label>
            <input
              type="date"
              value={performanceDateFrom}
              onChange={(e) => setPerformanceDateFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Termination Date</label>
            <input
              type="date"
              value={performanceDateTo}
              onChange={(e) => setPerformanceDateTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-full px-6 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setPerformanceDateFrom(''); setPerformanceDateTo(''); }}
              className="w-full py-4 rounded-full border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition active:scale-95"
            >
              Reset Temporal Filters
            </button>
          </div>
        </div>
      </div>

      {/* Top Performance Users */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest leading-none">MVP Segment</p>
              <p className="text-white font-black text-3xl mt-3">Elite Tier Consumers</p>
            </div>
            <Award className="w-12 h-12 text-orange-400 drop-shadow-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {userPerformance.slice(0, 3).map((user: any, i: number) => (
              <div key={user._id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl group-hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-orange-400 font-black text-2xl">0{i + 1}</p>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-white font-black text-lg leading-tight truncate">{user.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-2xl font-black text-white">₹{user.totalSpent.toLocaleString()}</p>
                  <p className="text-orange-400/60 text-[10px] font-black uppercase tracking-widest">{user.totalOrders} TX</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-500" />
          Promo Matrix
        </h3>
        <button onClick={() => setCouponModal({ open: true, data: null })} className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 transition active:scale-95">
          <Plus className="w-5 h-5" /> Generate Coupon
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {coupons.map((c: any) => (
          <div key={c._id} className={`bg-white rounded-[2.5rem] shadow-sm overflow-hidden border transition-all duration-300 ${c.isActive ? 'border-amber-100 hover:shadow-xl hover:shadow-orange-100/20' : 'border-slate-100 opacity-80'}`}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-3xl shadow-inner ${c.isActive ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-300'}`}>
                    🎫
                  </div>
                  <div>
                    <p className="font-black text-2xl text-slate-900 leading-none mb-2">{c.code}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.description || 'Global Platform Offer'}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {c.isActive ? 'Operational' : 'Disabled'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-orange-50/50 rounded-[1.5rem] p-5 border border-orange-100/30">
                  <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Value Projection</p>
                  <p className="font-black text-slate-900 text-xl">
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Usage Threshold</p>
                  <p className="font-black text-slate-900 text-xl">₹{c.minOrderAmount}</p>
                </div>
              </div>

              {c.userSpecific && (
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Exclusive Holder</p>
                    <p className="text-xs font-black text-slate-900">{c.userSpecific.name}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCouponModal({ open: true, data: c })}
                  className="flex-1 py-3.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition active:scale-95"
                >
                  Edit Terms
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch(`${API_URL}/coupons/${c._id}/toggle`, { method: 'PATCH', headers });
                    if ((await res.json()).success) fetchAll();
                  }}
                  className={`flex-1 py-3.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${c.isActive ? 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {c.isActive ? 'Suspend' : 'Activate'}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Permanent deletion of coupon?')) return;
                    const res = await fetch(`${API_URL}/coupons/${c._id}`, { method: 'DELETE', headers });
                    if ((await res.json()).success) fetchAll();
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">🎟️</div>
          <p className="text-2xl font-black text-slate-900">Zero Inventory</p>
          <p className="text-slate-400 text-sm mt-2">Generate your first promotion above</p>
        </div>
      )}

      {/* User Performance Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mt-12">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Performance Audit Log
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userPerformance.length} Total Registered Entities</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Entity</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Log Count</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Value</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">LTV Average</th>
                <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {userPerformance.slice(0, 10).map((user: any) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900 text-sm">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{user.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-slate-700 text-base">{user.totalOrders}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-orange-600 text-base">₹{user.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500">₹{Math.round(user.avgOrderValue)}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setCouponModal({
                        open: true,
                        data: {
                          userSpecific: user._id,
                          performanceBased: true,
                          performanceCriteria: {
                            minOrders: user.totalOrders,
                            minSpent: user.totalSpent,
                            reason: `Loyalty reward: ${user.totalOrders} orders | LTV ₹${user.totalSpent.toLocaleString()}`
                          }
                        }
                      })}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition shadow-lg shadow-slate-100 active:scale-95"
                    >
                      Issue Reward
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export function ScheduleOrdersTab({ scheduleOrders, expandedRow, setExpandedRow, search, setSearch, dateFilter, setDateFilter, fetchAll, headers, API_URL }: any) {
  const filteredOrders = scheduleOrders.filter((s: any) => {
    const matchesSearch = !search ||
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.phone?.includes(search) ||
      s._id?.toLowerCase().includes(search.toLowerCase());

    const matchesDate = !dateFilter ||
      s.meals?.some((m: any) => m.date?.split('T')[0] === dateFilter);

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white rounded-full border border-slate-200 px-6 py-3.5 shadow-sm focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Trace subscription schedules…"
            className="flex-1 text-sm font-bold focus:outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-4 bg-white rounded-full border border-slate-200 px-6 py-3.5 shadow-sm">
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Temporal Node</p>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="text-xs font-bold focus:outline-none text-slate-700 bg-transparent"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subscription Dispatch Ledger</p>
          <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{filteredOrders.length} ACTIVE FLOWS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xl font-black text-slate-900">No Schedules Found</p>
              <p className="text-slate-400 text-sm mt-2">No active subscriptions matches your criteria</p>
            </div>
          ) : (
            filteredOrders.map((s: any) => (
              <div key={s._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300 flex flex-col">
                <div className="p-7 flex flex-col flex-1 space-y-6">
                  {/* Header: Customer & ID */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-indigo-50">
                        {s.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 leading-none mb-1.5">{s.user?.name || 'Valued Subscriber'}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">#{s._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{s.meals?.length || 0} Meals Total</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reserved Capital</p>
                      <p className="text-2xl font-black text-indigo-600 leading-none">₹{s.meals?.reduce((sum: number, m: any) => sum + (m.mealPrice || 0), 0) || 0}</p>
                    </div>
                  </div>

                  {/* Customer Quick Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Dial</p>
                      <p className="text-xs font-black text-slate-700 inline-flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> {s.user?.phone}</p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Limit</p>
                      <p className="text-xs font-black text-emerald-600">₹{s.user?.walletBalance || 0}</p>
                    </div>
                  </div>

                  {/* Meal Breakdown Preview */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Upcoming Dispatch Queue</p>
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-2 scrollbar-hide">
                      {s.meals?.map((m: any, i: number) => (
                        <div key={i} className="group relative bg-white border border-slate-100 rounded-[1.25rem] p-4 hover:border-orange-200 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' :
                                m.mealType === 'Lunch' ? 'bg-orange-100 text-orange-700' :
                                  'bg-indigo-100 text-indigo-700'
                                }`}>{m.mealType}</span>
                              <span className="text-[10px] font-bold text-slate-400">{m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Date N/A'}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${SC[m.status] || 'bg-slate-100 text-slate-500'}`}>{m.status}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-800 truncate">{m.menuItem?.name || 'Custom Meal Plan'}</p>
                              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>🕑 {m.deliveryTime || 'Standard Time'}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span>{m.menuItem?.cloudKitchen?.name || 'Master Kitchen'}</span>
                              </p>
                            </div>
                            <p className="text-xs font-black text-slate-900 shrink-0">₹{m.mealPrice || 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Node */}
                  {s.meals?.[0]?.deliveryAddress && (
                    <div className="p-4 rounded-3xl bg-orange-50 border border-orange-100/50">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Delivery Destination</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">
                            {[s.meals[0].deliveryAddress.street, s.meals[0].deliveryAddress.city, s.meals[0].deliveryAddress.landmark].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-7 pb-7 pt-2 flex items-center gap-3">
                  <button
                    onClick={async () => { if (confirm('Abort absolute subscription?')) { const res = await fetch(`${API_URL}/admin/schedules/${s._id}`, { method: 'DELETE', headers }); if ((await res.json()).success) fetchAll(); } }}
                    className="flex-1 py-3.5 rounded-full border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition"
                  >
                    Hold Schedule
                  </button>
                  <button
                    onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}
                    className="flex-1 py-3.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition"
                  >
                    Modify Plan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function LeadsTab({ leads, expandedRow, setExpandedRow, search, setSearch, statusFilter, setStatusFilter, fetchAll, headers, API_URL }: any) {
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = !search ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.number?.includes(search);

    const matchesStatus = !statusFilter || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedLeads = filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    converted: 'bg-emerald-100 text-emerald-700',
    'not-interested': 'bg-red-100 text-red-700',
  };

  const mealTypeColors: Record<string, string> = {
    Lunch: 'bg-orange-100 text-orange-700',
    Dinner: 'bg-indigo-100 text-indigo-700',
    Both: 'bg-purple-100 text-purple-700',
  };

  const customerTypeIcon: Record<string, LucideIcon> = {
    Student: GraduationCap,
    Corporate: Building2,
    Employee: Shirt,
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white rounded-full border border-slate-200 px-6 py-3.5 shadow-sm focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or phone..."
            className="flex-1 text-sm font-bold focus:outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-6 py-3.5 bg-white border border-slate-200 rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="new">New Leads</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="not-interested">Not Interested</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Leads</p>
            <p className="text-sm font-bold text-orange-500 mt-1">{filteredLeads.length} leads found</p>
          </div>
          <span className="text-[10px] font-black text-slate-400 px-4 py-2 bg-slate-100 rounded-full">Page {page} of {Math.max(1, totalPages)}</span>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📋</div>
            <p className="font-black text-slate-900 text-lg">No leads found</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {paginatedLeads.map((lead: any) => (
                <div key={lead._id} className="group">
                  <button
                    className="w-full flex items-center gap-6 px-8 py-6 hover:bg-slate-50 transition-all text-left"
                    onClick={() => setExpandedRow(expandedRow === lead._id ? null : lead._id)}
                  >
                    <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform flex-shrink-0">
                      {lead.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-black text-slate-900 text-base">{lead.name}</p>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${statusColors[lead.status] || 'bg-slate-100'}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 shrink-0" /> {lead.number}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0" /> {lead.email}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {lead.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full mb-2 inline-block ${mealTypeColors[lead.mealType] || 'bg-slate-100'}`}>
                        {lead.mealType}
                      </span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {(() => {
                          const TypeIcon = customerTypeIcon[lead.customerType];
                          return TypeIcon ? <><TypeIcon className="w-3.5 h-3.5 inline mr-1" />{lead.customerType}</> : lead.customerType;
                        })()}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${expandedRow === lead._id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-500'
                      }`}>
                      {expandedRow === lead._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {expandedRow === lead._id && (
                    <div className="px-8 pb-8 pt-2 bg-slate-50/50 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Meal Preference</p>
                          <span className={`text-sm font-black px-3 py-1 rounded-full inline-block ${mealTypeColors[lead.mealType]}`}>
                            {lead.mealType}
                          </span>
                        </div>
                        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Type</p>
                          <span className="text-sm font-black">
                            {(() => {
                              const TypeIcon = customerTypeIcon[lead.customerType];
                              return TypeIcon ? <><TypeIcon className="w-3.5 h-3.5 inline mr-1" />{lead.customerType}</> : lead.customerType;
                            })()}
                          </span>
                        </div>
                        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Date</p>
                          <p className="text-sm font-black text-slate-700">
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Details</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-xs font-bold text-slate-700">{lead.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                <p className="text-xs font-bold text-slate-700">{lead.number}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                                <p className="text-xs font-bold text-slate-700">{lead.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-base">🏙️</span>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">City</p>
                                <p className="text-xs font-bold text-slate-700">{lead.city}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
                            <select
                              value={lead.status}
                              onChange={async (e) => {
                                const res = await fetch(`${API_URL}/leads/${lead._id}`, {
                                  method: 'PATCH',
                                  headers: { ...headers, 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: e.target.value })
                                });
                                if ((await res.json()).success) fetchAll();
                              }}
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-100"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="converted">Converted</option>
                              <option value="not-interested">Not Interested</option>
                            </select>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes</p>
                            <textarea
                              placeholder="Add notes..."
                              defaultValue={lead.notes}
                              onBlur={async (e) => {
                                const res = await fetch(`${API_URL}/leads/${lead._id}`, {
                                  method: 'PATCH',
                                  headers: { ...headers, 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ notes: e.target.value })
                                });
                                if ((await res.json()).success) fetchAll();
                              }}
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            window.location.href = `https://wa.me/${lead.number}?text=Hi ${lead.name}, we're interested in offering you our tiffin services!`;
                          }}
                          className="flex-1 py-3 bg-green-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition shadow-lg shadow-green-100"
                        >
                          💬 Send WhatsApp
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this lead?')) return;
                            const res = await fetch(`${API_URL}/leads/${lead._id}`, {
                              method: 'DELETE',
                              headers
                            });
                            if ((await res.json()).success) fetchAll();
                          }}
                          className="px-6 py-3 bg-red-50 text-red-500 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 disabled:opacity-50 transition"
                >
                  ← Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-black text-sm transition ${page === i + 1 ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 disabled:opacity-50 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


export function EarningsTab({ orders }: any) {
  const amt = (o: any) => Number(o.totalAmount || o.totalPrice || o.price || 0);
  const deliveredOrders = orders.filter((o: any) => o.status === 'delivered');
  const totalEarnings = deliveredOrders.reduce((sum: number, o: any) => sum + amt(o), 0);
  const pendingEarnings = orders
    .filter((o: any) => ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status))
    .reduce((sum: number, o: any) => sum + amt(o), 0);

  const monthlyData: { label: string; value: number }[] = Object.entries(
    deliveredOrders.reduce((acc: Record<string, number>, o: any) => {
      const month = new Date(o.createdAt).toLocaleString('en-IN', { month: 'short' });
      acc[month] = (acc[month] || 0) + amt(o);
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value: value as number }));

  return (
    <div className={ERP.page}>
      <AdminPageHeader title="Earnings & Payouts" subtitle="Financial summary from completed orders" />
      <AdminKpiGrid items={[
        { label: 'Total earnings', value: totalEarnings },
        { label: 'Delivered orders', value: deliveredOrders.length },
        { label: 'Pending payout', value: pendingEarnings },
        { label: 'Avg per order', value: deliveredOrders.length ? Math.round(totalEarnings / deliveredOrders.length) : 0 },
      ].map(item => ({
        ...item,
        value: typeof item.value === 'number' ? (
          item.label.includes('order') ? item.value : `₹${item.value.toLocaleString('en-IN')}`
        ) : item.value
      }))} />
      <AdminPanel title="Monthly revenue">
        <MiniBarChart data={monthlyData.slice(-6)} />
      </AdminPanel>
      <AdminDataTable
        showSearch={false}
        columns={[
          { key: '_id', header: 'Order', render: (o: any) => `ORD-${o._id?.slice(-6).toUpperCase()}` },
          { key: 'createdAt', header: 'Date', sortable: true, render: (o: any) => fmt(o.createdAt) },
          { key: 'totalAmount', header: 'Amount', sortable: true, render: (o: any) => `₹${amt(o).toLocaleString('en-IN')}` },
          { key: 'status', header: 'Status', render: (o: any) => <AdminStatusBadge status={o.status} map={ORDER_STATUS_STYLE} /> },
        ]}
        rows={deliveredOrders}
        emptyMessage="No completed orders"
        exportFilename="earnings.csv"
        exportHeaders={['Order', 'Date', 'Amount']}
        exportRows={deliveredOrders.map((o: any) => [o._id, o.createdAt, amt(o)])}
      />
    </div>
  );
}
