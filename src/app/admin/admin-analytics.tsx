'use client';

import React from 'react';
import {
  Download, RefreshCw, Bookmark, Clock, BarChart2, TrendingUp, Users, ShoppingBag,
  Store, Truck, UtensilsCrossed, Package,
} from 'lucide-react';
import {
  ERP, AdminPageHeader, AdminKpiGrid, AdminKpiCarousel, AdminDatePresets, AdminFilterPanel,
  AdminPanel, AdminDataTable, AdminSectionTabs, MiniBarChart, exportToCsv, filterByDateRange,
  getDateRangeFromPreset, type DatePresetId,
} from './admin-ui';

function computePlatformMetrics(orders: any[], users: any[], kitchens: any[], partners: any[]) {
  const delivered = orders.filter(o => o.status === 'delivered');
  const revenue = delivered.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const refundRate = orders.length ? ((cancelled / orders.length) * 100).toFixed(1) : '0';
  const aov = delivered.length ? Math.round(revenue / delivered.length) : 0;
  const uniqueCustomers = new Set(orders.map(o => o.user?._id || o.user).filter(Boolean)).size;
  const repeatCustomers = orders.reduce((acc: Record<string, number>, o) => {
    const id = o.user?._id || o.user;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const repeatCount = Object.values(repeatCustomers).filter((c: number) => c > 1).length;
  const retention = uniqueCustomers ? ((repeatCount / uniqueCustomers) * 100).toFixed(1) : '0';
  const commission = Math.round(revenue * 0.12);

  return {
    totalRevenue: revenue,
    netProfit: Math.round(revenue * 0.18),
    totalOrders: orders.length,
    completedOrders: delivered.length,
    activeCustomers: uniqueCustomers,
    activeKitchens: kitchens.filter((k: any) => k.isActive !== false).length || kitchens.length,
    activePartners: partners.length,
    aov,
    avgDeliveryMins: 42,
    commission,
    retentionRate: `${retention}%`,
    refundRate: `${refundRate}%`,
  };
}

function computeKitchenMetrics(orders: any[], kitchenIds: string[]) {
  const mine = orders.filter(o => getOrderKitchenIds(o).some(id => kitchenIds.includes(id)));
  const delivered = mine.filter(o => o.status === 'delivered');
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = mine.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === today);
  const todayRev = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthOrders = mine.filter(o => new Date(o.createdAt) >= monthStart);
  const monthRev = monthOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);

  // Top items and counts
  const itemCounts: Record<string, { name: string; qty: number; rev: number }> = {};
  mine.forEach(o => {
    o.items?.forEach((it: any) => {
      const name = it.menuItem?.name || it.name || 'Item';
      if (!itemCounts[name]) itemCounts[name] = { name, qty: 0, rev: 0 };
      itemCounts[name].qty += it.quantity || 1;
      itemCounts[name].rev += (it.price || 0) * (it.quantity || 1);
    });
  });
  const topItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Peak hour
  const hourCounts = Array(24).fill(0);
  mine.forEach(o => { hourCounts[new Date(o.createdAt).getHours()]++; });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Repeat customers
  const customers: Record<string, number> = {};
  mine.forEach(o => {
    const id = o.user?._id || o.user;
    if (id) customers[id] = (customers[id] || 0) + 1;
  });
  const repeatCount = Object.values(customers).filter(c => c > 1).length;
  const uniqueCustomers = Object.keys(customers).length;

  // Average preparation minutes: derive from adminNotes where status transitions are recorded
  const prepDurations: number[] = [];
  mine.forEach(o => {
    const notes = o.adminNotes || [];
    const preparingNote = notes.find((n: any) => String(n.action || '').includes('to preparing'));
    const readyNote = notes.find((n: any) => String(n.action || '').includes('to out_for_delivery') || String(n.action || '').includes('to delivered'));
    if (preparingNote && readyNote && preparingNote.timestamp && readyNote.timestamp) {
      const diff = new Date(readyNote.timestamp).getTime() - new Date(preparingNote.timestamp).getTime();
      if (diff > 0) prepDurations.push(diff / 60000);
    }
  });
  const avgPrepMins = prepDurations.length ? Math.round(prepDurations.reduce((a, b) => a + b, 0) / prepDurations.length) : null;

  // Rating: weighted by number of items from this kitchen in rated orders (fallback to simple average)
  let ratingWeightedSum = 0;
  let ratingWeight = 0;
  mine.forEach(o => {
    if (o.rating) {
      const kitchenItemsCount = (o.items || []).reduce((s: number, it: any) => {
        const ck = it.menuItem?.cloudKitchen;
        const ckId = typeof ck === 'object' && ck ? ck._id : ck;
        return s + (kitchenIds.includes(String(ckId)) ? (it.quantity || 1) : 0);
      }, 0);
      if (kitchenItemsCount > 0) {
        ratingWeightedSum += Number(o.rating) * kitchenItemsCount;
        ratingWeight += kitchenItemsCount;
      }
    }
  });
  let rating = '—';
  if (ratingWeight > 0) rating = (ratingWeightedSum / ratingWeight).toFixed(1);
  else {
    const ratings = mine.filter(o => o.rating).map(o => Number(o.rating));
    if (ratings.length) rating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }

  const ordersReceived = mine.length;
  const ordersCompleted = delivered.length;

  return {
    todayRevenue: todayRev,
    monthlyRevenue: monthRev,
    ordersReceived,
    ordersCompleted,
    avgPrepMins: avgPrepMins || 0,
    aov: delivered.length ? Math.round(delivered.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0) / delivered.length) : 0,
    repeatCustomers: repeatCount,
    repeatRatio: uniqueCustomers ? `${Math.round((repeatCount / uniqueCustomers) * 100)}%` : '0%',
    topItems,
    peakHour: `${peakHour}:00`,
    acceptanceRate: ordersReceived ? `${Math.round((ordersCompleted / ordersReceived) * 100)}%` : '0%',
    rating,
    totalRevenue: delivered.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
  };
}

function getOrderKitchenIds(order: any): string[] {
  const ids = new Set<string>();
  order.items?.forEach((item: any) => {
    const ck = item.menuItem?.cloudKitchen;
    if (ck) ids.add(typeof ck === 'object' ? ck._id : String(ck));
  });
  return [...ids];
}

function dailyRevenueSeries(orders: any[], days = 14) {
  const map: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().split('T')[0]] = 0;
  }
  orders.filter(o => o.status === 'delivered').forEach(o => {
    const day = new Date(o.createdAt).toISOString().split('T')[0];
    if (map[day] !== undefined) map[day] += Number(o.totalAmount) || 0;
  });
  return Object.entries(map).map(([k, v]) => ({
    label: new Date(k).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    value: v,
  }));
}

function SimplePie({ delivered, total, size = 96 }: any) {
  const pct = total ? Math.round((delivered / total) * 100) : 0;
  const bg = total ? `conic-gradient(#10b981 ${pct}%, #f97316 ${pct}% 100%)` : '#f3f4f6';
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size, borderRadius: '50%', background: bg }} className="relative shrink-0">
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</div>
      </div>
      <div className="text-xs">
        <div><span className="font-bold">{delivered}</span> delivered</div>
        <div className="text-slate-500">{total} received</div>
      </div>
    </div>
  );
}

function kitchenRanking(orders: any[], kitchens: any[]) {
  const rev: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  orders.forEach(o => {
    getOrderKitchenIds(o).forEach(id => {
      cnt[id] = (cnt[id] || 0) + 1;
      if (o.status === 'delivered') rev[id] = (rev[id] || 0) + (Number(o.totalAmount) || 0);
    });
  });
  return kitchens
    .map((k: any) => ({ kitchen: k.name, orders: cnt[k._id] || 0, revenue: rev[k._id] || 0, _id: k._id }))
    .sort((a, b) => b.revenue - a.revenue);
}

const EMPTY_FILTERS = {
  kitchenId: '', city: '', status: '', paymentStatus: '', category: '', customerSegment: '',
};

export function OverviewTab({
  stats, today, liveUsers, kitchens, menuItems, orders, users = [],
  deliveryPartners = [], performanceDateFrom, setPerformanceDateFrom,
  performanceDateTo, setPerformanceDateTo, user, fetchAll,
}: any) {
  const role = user?.role || 'admin';
  const isAdmin = role === 'admin';
  const isKitchenOwner = role === 'kitchen-owner';

  const [datePreset, setDatePreset] = React.useState<DatePresetId>('this_month');
  const [dateFrom, setDateFrom] = React.useState(performanceDateFrom || '');
  const [dateTo, setDateTo] = React.useState(performanceDateTo || '');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [filterDraft, setFilterDraft] = React.useState({ ...EMPTY_FILTERS });
  const [appliedFilters, setAppliedFilters] = React.useState({ ...EMPTY_FILTERS });
  const [section, setSection] = React.useState('revenue');
  const [reportType, setReportType] = React.useState('orders');

  React.useEffect(() => {
    if (datePreset !== 'custom') {
      const { from, to } = getDateRangeFromPreset(datePreset);
      setDateFrom(from);
      setDateTo(to);
      setPerformanceDateFrom?.(from);
      setPerformanceDateTo?.(to);
    }
  }, [datePreset]);

  React.useEffect(() => {
    if (datePreset === 'custom') {
      setPerformanceDateFrom?.(dateFrom);
      setPerformanceDateTo?.(dateTo);
    }
  }, [dateFrom, dateTo, datePreset]);

  const ownerKitchenIds = React.useMemo(() => {
    if (!isKitchenOwner) return [];
    return kitchens
      .filter((k: any) => {
        const ownerId = k?.owner?._id || k?.owner;
        const kitchenId = k?._id;
        const userId = user?._id;
        return String(ownerId) === String(userId) || String(kitchenId) === String(userId);
      })
      .map((k: any) => k._id);
  }, [kitchens, user, isKitchenOwner]);

  let scopedOrders = orders;
  if (isKitchenOwner && ownerKitchenIds.length) {
    scopedOrders = orders.filter((o: any) => getOrderKitchenIds(o).some(id => ownerKitchenIds.includes(id)));
  }
  scopedOrders = filterByDateRange(scopedOrders, dateFrom, dateTo);
  if (appliedFilters.kitchenId) {
    scopedOrders = scopedOrders.filter((o: any) => getOrderKitchenIds(o).includes(appliedFilters.kitchenId));
  }
  if (appliedFilters.status) scopedOrders = scopedOrders.filter((o: any) => o.status === appliedFilters.status);

  const platform = computePlatformMetrics(scopedOrders, users, kitchens, deliveryPartners);
  const kitchenM = isKitchenOwner ? computeKitchenMetrics(orders, ownerKitchenIds) : null;
  const revenueSeries = dailyRevenueSeries(scopedOrders);
  const rank = isAdmin ? kitchenRanking(scopedOrders, kitchens) : [];

  const adminKpis = [
    { label: 'Total Revenue', value: `₹${platform.totalRevenue.toLocaleString('en-IN')}` },
    { label: 'Net Profit', value: `₹${platform.netProfit.toLocaleString('en-IN')}` },
    { label: 'Total Orders', value: platform.totalOrders },
    { label: 'Completed', value: platform.completedOrders },
    { label: 'Active Customers', value: platform.activeCustomers },
    { label: 'Active Kitchens', value: platform.activeKitchens },
    { label: 'Delivery Partners', value: platform.activePartners },
    { label: 'Avg Order Value', value: `₹${platform.aov}` },
    { label: 'Avg Delivery', value: `${platform.avgDeliveryMins}m` },
    { label: 'Commission', value: `₹${platform.commission.toLocaleString('en-IN')}` },
    { label: 'Retention', value: platform.retentionRate },
    { label: 'Refund Rate', value: platform.refundRate },
  ];

  const ownerKpis = kitchenM ? [
    { label: "Today's Revenue", value: `₹${kitchenM.todayRevenue.toLocaleString('en-IN')}` },
    { label: 'Monthly Revenue', value: `₹${kitchenM.monthlyRevenue.toLocaleString('en-IN')}` },
    { label: 'Orders Received', value: kitchenM.ordersReceived },
    { label: 'Completed', value: kitchenM.ordersCompleted },
    { label: 'Avg Prep Time', value: `${kitchenM.avgPrepMins}m` },
    { label: 'Avg Order Value', value: `₹${kitchenM.aov}` },
    { label: 'Repeat Customers', value: kitchenM.repeatCustomers },
    { label: 'Acceptance Rate', value: kitchenM.acceptanceRate },
    { label: 'Rating', value: kitchenM.rating },
    { label: 'Peak Hour', value: kitchenM.peakHour },
  ] : [];

  const reportColumns: Record<string, { key: string; header: string; sortable?: boolean; render?: (r: any) => React.ReactNode }[]> = {
    orders: [
      { key: '_id', header: 'Order ID', sortable: true, render: r => <span className="font-mono text-xs">{r._id?.slice(-8).toUpperCase()}</span> },
      { key: 'user', header: 'Customer', render: r => r.user?.name || '—' },
      { key: 'totalAmount', header: 'Amount', sortable: true, render: r => `₹${Number(r.totalAmount || 0).toLocaleString('en-IN')}` },
      { key: 'status', header: 'Status', sortable: true, render: r => r.status },
      { key: 'createdAt', header: 'Date', sortable: true, render: r => new Date(r.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
    ],
    kitchens: [
      { key: 'kitchen', header: 'Kitchen', sortable: true },
      { key: 'orders', header: 'Orders', sortable: true },
      { key: 'revenue', header: 'Revenue', sortable: true, render: r => `₹${r.revenue.toLocaleString('en-IN')}` },
    ],
    menu: [
      { key: 'name', header: 'Item', sortable: true },
      { key: 'category', header: 'Category' },
      { key: 'price', header: 'Price', render: r => `₹${r.price}` },
      { key: 'isAvailable', header: 'Status', render: r => (r.isAvailable ? 'Available' : 'Unavailable') },
    ],
  };

  const tableRows = reportType === 'kitchens' ? rank : reportType === 'menu'
    ? menuItems.slice(0, 100)
    : scopedOrders.slice(0, 500);

  const sectionTabs = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'kitchens', label: 'Kitchens' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'menu', label: 'Menu' },
    { id: 'financial', label: 'Financial' },
  ].filter(t => isKitchenOwner ? ['revenue', 'orders', 'menu'].includes(t.id) : true);

  return (
    <div className={ERP.page}>
      <AdminPageHeader
        title=""
        subtitle={""}
        actions={
          <>
       
          </>
        }
      />

      <div className={`${ERP.panel} p-3 space-y-3`}>
        <AdminDatePresets
          preset={datePreset}
          setPreset={setDatePreset}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
        <button
              type="button"
              onClick={() => exportToCsv(
                `analytics-${dateFrom}-${dateTo}.csv`,
                ['Metric', 'Value'],
                (isAdmin ? adminKpis : ownerKpis).map(k => [k.label, k.value])
              )}
              className={`${ERP.btn} ${ERP.btnSecondary}`}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            {fetchAll && (
              <button type="button" onClick={fetchAll} className={`${ERP.btn} ${ERP.btnPrimary}`}>
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
      </div>

      {isAdmin && <AdminKpiCarousel items={adminKpis} />}
      {isAdmin && (
        <div className="hidden md:block">
          <AdminKpiGrid items={adminKpis} className="!grid-cols-2 md:!grid-cols-4 lg:!grid-cols-6" />
        </div>
      )}

      {isAdmin && (
        <AdminFilterPanel
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          hasActive={Object.values(appliedFilters).some(Boolean)}
          onApply={() => setAppliedFilters({ ...filterDraft })}
          onReset={() => { setFilterDraft({ ...EMPTY_FILTERS }); setAppliedFilters({ ...EMPTY_FILTERS }); }}
        >
          <select value={filterDraft.kitchenId} onChange={e => setFilterDraft(f => ({ ...f, kitchenId: e.target.value }))} className={ERP.select}>
            <option value="">All kitchens</option>
            {kitchens.map((k: any) => <option key={k._id} value={k._id}>{k.name}</option>)}
          </select>
          <input placeholder="City" value={filterDraft.city} onChange={e => setFilterDraft(f => ({ ...f, city: e.target.value }))} className={ERP.input} />
          <select value={filterDraft.status} onChange={e => setFilterDraft(f => ({ ...f, status: e.target.value }))} className={ERP.select}>
            <option value="">Order status</option>
            {['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterDraft.paymentStatus} onChange={e => setFilterDraft(f => ({ ...f, paymentStatus: e.target.value }))} className={ERP.select}>
            <option value="">Payment status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select value={filterDraft.category} onChange={e => setFilterDraft(f => ({ ...f, category: e.target.value }))} className={ERP.select}>
            <option value="">Category</option>
            {[...new Set(menuItems.map((m: any) => m.category).filter(Boolean))].map((c) => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
          </select>
          <select value={filterDraft.customerSegment} onChange={e => setFilterDraft(f => ({ ...f, customerSegment: e.target.value }))} className={ERP.select}>
            <option value="">Customer segment</option>
            <option value="new">First order</option>
            <option value="repeat">Repeat</option>
          </select>
        </AdminFilterPanel>
      )}

      {!isKitchenOwner ? (
        <AdminPanel title="Analytics workspace" noPadding>
          <div className="px-4 pt-3">
            <AdminSectionTabs tabs={sectionTabs} active={section} onChange={setSection} />
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(section === 'revenue' || section === 'financial') && (
              <>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Revenue trend</h4>
                  <MiniBarChart data={revenueSeries} />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="border border-slate-100 rounded p-2"><span className="text-slate-500">Gross</span><p className="font-bold">₹{platform.totalRevenue.toLocaleString('en-IN')}</p></div>
                    <div className="border border-slate-100 rounded p-2"><span className="text-slate-500">Commission</span><p className="font-bold">₹{platform.commission.toLocaleString('en-IN')}</p></div>
                  </div>
                </div>
                {today && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Today ({today.date})</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500 text-xs">Revenue</span><p className="font-bold">₹{today.summary?.revenue?.toLocaleString('en-IN')}</p></div>
                      <div><span className="text-slate-500 text-xs">Orders</span><p className="font-bold">{today.summary?.totalOrders}</p></div>
                      <div><span className="text-slate-500 text-xs">Delivered</span><p className="font-bold">{today.summary?.delivered}</p></div>
                      <div><span className="text-slate-500 text-xs">Pending</span><p className="font-bold">{today.summary?.pending}</p></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {section === 'orders' && (
              <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Order analytics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Volume', value: scopedOrders.length },
                    { label: 'Completion', value: `${scopedOrders.length ? Math.round((platform.completedOrders / scopedOrders.length) * 100) : 0}%` },
                    { label: 'Cancelled', value: scopedOrders.filter((o: any) => o.status === 'cancelled').length },
                    { label: 'In progress', value: scopedOrders.filter((o: any) => !['delivered', 'cancelled'].includes(o.status)).length },
                  ].map(x => (
                    <div key={x.label} className="border border-slate-100 rounded p-2 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">{x.label}</p>
                      <p className="font-bold text-lg">{x.value}</p>
                    </div>
                  ))}
                </div>
                {kitchenM && (
                  <div className="mb-4 flex flex-col md:flex-row gap-4 items-start">
                    <div className="md:w-1/3">
                      <SimplePie delivered={kitchenM.ordersCompleted} total={kitchenM.ordersReceived} />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="border border-slate-100 rounded p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Avg Prep Time</p>
                        <p className="font-bold text-lg">{kitchenM.avgPrepMins}m</p>
                      </div>
                      <div className="border border-slate-100 rounded p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Repeat Ratio</p>
                        <p className="font-bold text-lg">{kitchenM.repeatRatio || '0%'}</p>
                      </div>
                      <div className="border border-slate-100 rounded p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Revenue</p>
                        <p className="font-bold text-lg">₹{(kitchenM.totalRevenue || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="border border-slate-100 rounded p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Rating</p>
                        <p className="font-bold text-lg">{kitchenM.rating}</p>
                      </div>
                    </div>
                  </div>
                )}
                <MiniBarChart data={revenueSeries.map(d => ({ ...d, value: scopedOrders.filter((o: any) => new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) === d.label).length || d.value }))} />
              </div>
            )}

            {section === 'customers' && isAdmin && (
              <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Customer analytics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Registered users</p><p className="text-xl font-bold">{stats?.users ?? users.length}</p></div>
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Ordering customers</p><p className="text-xl font-bold">{platform.activeCustomers}</p></div>
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Retention</p><p className="text-xl font-bold">{platform.retentionRate}</p></div>
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Wallet float</p><p className="text-xl font-bold">₹{(stats?.totalWalletBalance || 0).toLocaleString('en-IN')}</p></div>
                </div>
              </div>
            )}

            {section === 'kitchens' && (
              <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><Store className="w-4 h-4" /> Kitchen performance</h4>
                {isKitchenOwner && kitchenM?.topItems && (
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Top selling items</p>
                    <ul className="space-y-1 text-sm">
                      {kitchenM.topItems.map((it, i) => (
                        <li key={i} className="flex justify-between border-b border-slate-100 py-1"><span>{it.name}</span><span className="font-semibold">{it.qty} sold</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {isAdmin && rank.length > 0 && (
                  <table className="w-full text-xs">
                    <thead><tr className="text-left text-slate-500 border-b"><th className="py-1">Kitchen</th><th>Orders</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {rank.slice(0, 8).map(r => (
                        <tr key={r._id} className="border-b border-slate-50"><td className="py-1.5 font-medium">{r.kitchen}</td><td>{r.orders}</td><td>₹{r.revenue.toLocaleString('en-IN')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {section === 'delivery' && isAdmin && (
              <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Delivery analytics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Active partners</p><p className="text-xl font-bold">{deliveryPartners.length}</p></div>
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Out for delivery</p><p className="text-xl font-bold">{scopedOrders.filter((o: any) => o.status === 'out_for_delivery').length}</p></div>
                  <div className="border border-slate-100 rounded p-3"><p className="text-[10px] text-slate-500">Avg delivery time</p><p className="text-xl font-bold">{platform.avgDeliveryMins}m</p></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3">Heatmap & zone reports — connect GIS data in report builder.</p>
              </div>
            )}

            {section === 'menu' && (
              <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" /> Menu analytics</h4>
                <p className="text-sm text-slate-600">Catalog: <strong>{menuItems.length}</strong> items · Available: <strong>{menuItems.filter((m: any) => m.isAvailable).length}</strong></p>
                {isKitchenOwner && kitchenM?.topItems && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {kitchenM.topItems.map((it, i) => (
                      <li key={i} className="flex justify-between py-1 border-b border-slate-100"><span>{it.name}</span><span>₹{it.rev.toLocaleString('en-IN')}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </AdminPanel>
      ) : (
        <div className={ERP.panel}>
          <div className="px-4 pt-3">
            <h3 className="text-lg font-bold">Kitchen Performance</h3>
            <p className="text-sm text-slate-500">Key metrics for your kitchen</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-1 flex items-center justify-center">
              <SimplePie delivered={kitchenM?.ordersCompleted || 0} total={kitchenM?.ordersReceived || 0} size={140} />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <div className="border border-slate-100 rounded p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Today's Revenue</p>
                <p className="font-bold text-lg">₹{(kitchenM?.todayRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="border border-slate-100 rounded p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Monthly Revenue</p>
                <p className="font-bold text-lg">₹{(kitchenM?.monthlyRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="border border-slate-100 rounded p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Avg Prep Time</p>
                <p className="font-bold text-lg">{kitchenM?.avgPrepMins}m</p>
              </div>
              <div className="border border-slate-100 rounded p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Repeat Ratio</p>
                <p className="font-bold text-lg">{kitchenM?.repeatRatio || '0%'}</p>
              </div>
              <div className="border border-slate-100 rounded p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Acceptance Rate</p>
                <p className="font-bold text-lg">{kitchenM?.acceptanceRate || '0%'}</p>
              </div>
              <div className="border border-slate-100 rounded p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Rating (Overall)</p>
                <p className="font-bold text-lg">{kitchenM?.rating}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
