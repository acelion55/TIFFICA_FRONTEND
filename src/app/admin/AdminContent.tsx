'use client';
import React from 'react';
import { ChevronDown, ChevronUp, Search, Trash2, Plus, Activity, Tag, TrendingUp, Award } from 'lucide-react';

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

export function OverviewTab({ stats, today, liveUsers, kitchens, menuItems, orders, performanceDateFrom, setPerformanceDateFrom, performanceDateTo, setPerformanceDateTo }: any) {
  return (
    <div className="space-y-5">
      {/* Stats Boxes - Top Priority */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500', icon: '👤' },
          { label: 'Total Orders', value: stats.orders, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500', icon: '📦' },
          { label: 'Menu Items', value: stats.menuItems, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500', icon: '🍽️' },
          { label: 'Subscriptions', value: stats.subscriptions, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-500', icon: '💳' },
          { label: 'Wallet Balance', value: `₹${(stats.totalWalletBalance || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500', icon: '💰' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 border-l-4 ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center text-lg`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Analytics with Date Filter - Orange Tab Design */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 md:py-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">Performance Analytics</h3>
                <p className="text-orange-100 text-xs mt-0.5">Filter by date to view detailed insights</p>
              </div>
            </div>
            {(performanceDateFrom || performanceDateTo) && (
              <button
                onClick={() => {
                  setPerformanceDateFrom('');
                  setPerformanceDateTo('');
                }}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition font-bold text-sm"
              >
                Reset
              </button>
            )}
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-white text-xs font-bold uppercase tracking-wide mb-2.5">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={performanceDateFrom}
                  onChange={(e) => setPerformanceDateFrom(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/30 bg-white/95 text-gray-900 font-semibold focus:outline-none focus:border-white focus:ring-4 focus:ring-white/30 transition placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-white text-xs font-bold uppercase tracking-wide mb-2.5">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={performanceDateTo}
                  onChange={(e) => setPerformanceDateTo(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/30 bg-white/95 text-gray-900 font-semibold focus:outline-none focus:border-white focus:ring-4 focus:ring-white/30 transition placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col justify-end">
              <label className="block text-white text-xs font-bold uppercase tracking-wide mb-2.5">Status</label>
              <div className="px-4 py-3.5 rounded-xl bg-white/20 border-2 border-white/50 backdrop-blur-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-white font-bold text-sm">
                  {performanceDateFrom || performanceDateTo ? '🎯 Active Filter' : '⏱️ All Time'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          {(performanceDateFrom || performanceDateTo) && (
            <div className="mt-5 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <p className="text-white font-semibold text-sm">
                📈 <span className="font-bold">Filtered Period:</span> 
                <span className="ml-2">
                  {performanceDateFrom && new Date(performanceDateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {performanceDateFrom && performanceDateTo && ' → '}
                  {performanceDateTo && new Date(performanceDateTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {today && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Today's Performance</p>
              <p className="text-white font-bold text-lg mt-0.5">{today.date}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-200" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Revenue', value: `₹${today.summary.revenue.toLocaleString()}` },
              { label: 'Instant Orders', value: today.summary.totalOrders },
              { label: 'Scheduled Orders', value: today.summary.scheduledMeals },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-orange-100 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pending', value: today.summary.pending },
              { label: 'Delivered', value: today.summary.delivered },
              { label: 'Cancelled', value: today.summary.cancelled },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-lg p-2.5 text-center">
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-orange-100 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instant Orders & Scheduled Orders based on Date Filter */}
      <div className="grid md:grid-cols-2 gap-4">
        {today?.scheduledOrders?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 className="font-bold text-slate-900 text-sm">📅 Scheduled Orders {performanceDateFrom || performanceDateTo ? '' : '(Today)'}</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{today.summary.scheduledMeals} meals</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {today.scheduledOrders.map((s: any) => (
                <div key={s._id} className="px-5 py-3 hover:bg-slate-50 transition">
                  <p className="text-sm font-semibold text-slate-800">{s.user?.name}</p>
                  <p className="text-xs text-slate-400 mb-2">📱 {s.user?.phone}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.meals.map((m: any, i: number) => (
                      <span key={i} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${m.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' : m.mealType === 'Lunch' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {m.menuItem?.name || m.mealType}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {today?.instantOrders?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="font-bold text-slate-900 text-sm">⚡ Instant Orders {performanceDateFrom || performanceDateTo ? '' : '(Today)'}</h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">{today.instantOrders.length}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {today.instantOrders.map((o: any) => (
                <div key={o._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{o.user?.name}</p>
                    <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-600 text-sm">₹{o.totalAmount}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SC[o.status] || 'bg-slate-100 text-slate-600'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">All-Time Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Cloud Kitchens', value: kitchens.length },
            { label: 'Active Menu Items', value: menuItems.filter((i: any) => i.isAvailable).length },
            { label: 'Delivered Revenue', value: `₹${orders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0).toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-lg bg-slate-50">
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UsersTab({ users, search, setSearch, expandedRow, setExpandedRow, setUserModal, openEditUserModal }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone…" className="flex-1 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400" />
        </div>
        <button onClick={() => setUserModal({ open: true, data: null })} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Users</p>
          <span className="text-xs text-slate-400">{users.length} total</span>
        </div>
        <div className="divide-y divide-slate-50">
          {users.filter((u: any) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)).map((u: any) => (
            <div key={u._id}>
              <button className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition text-left" onClick={() => setExpandedRow(expandedRow === u._id ? null : u._id)}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">{u.name?.[0]?.toUpperCase() || '?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">📱 {u.phone}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-600">{u.email || 'No email'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{u.role || 'user'}</p>
                  {u.isPremium && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">Premium</span>}
                </div>
                {expandedRow === u._id ? <ChevronUp className="w-4 h-4 text-slate-300 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />}
              </button>
              {expandedRow === u._id && (
                <div className="px-5 pb-4 pt-2 bg-slate-50 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Wallet', value: `₹${u.walletBalance || 0}`, cls: 'text-green-600 font-bold' },
                      { label: 'Addresses', value: `${u.addresses?.length || 0} saved`, cls: '' },
                      { label: 'Location', value: u.currentLocation?.locationName || 'Not set', cls: '' },
                      { label: 'Joined', value: fmt(u.createdAt), cls: '' },
                    ].map(row => (
                      <div key={row.label} className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">{row.label}</p>
                        <p className={`font-semibold text-slate-800 mt-0.5 text-xs ${row.cls}`}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditUserModal ? openEditUserModal(u) : setUserModal({ open: true, data: u }); }}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Edit User
                  </button>
                  <p className="text-slate-400 font-mono text-[10px] px-1 mt-2">ID: {u._id}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrdersTab({ orders, expandedRow, setExpandedRow, fetchAll, headers, API_URL, search, setSearch, dateFilter, setDateFilter, deliveryPartners }: any) {
  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch = !search || 
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.phone?.includes(search) ||
      o._id?.toLowerCase().includes(search.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(o.createdAt).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, email, phone or order ID…" 
            className="flex-1 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400" 
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Date:</span>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="text-sm focus:outline-none text-slate-700 bg-transparent"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="text-xs text-orange-500 font-bold hover:text-orange-600 shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">All Orders</p>
          <span className="text-xs text-slate-400">{filteredOrders.length} of {orders.length} records</span>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">📦</p>
              <p className="font-semibold">No orders found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredOrders.map((o: any) => (
              <div key={o._id}>
            <div className="flex flex-col gap-3 px-5 py-3.5 hover:bg-slate-50 transition">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)}>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${SC[o.status] || 'bg-slate-100 text-slate-600'}`}>{o.status}</span>
                    <span className="text-slate-400 text-[11px]">{fmtTime(o.createdAt)}</span>
                    {o.deliveryPartner && (
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                        🚚 {deliveryPartners?.find((p: any) => p._id === (o.deliveryPartner?._id || o.deliveryPartner))?.name || 'Assigned'}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{o.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">📱 {o.user?.phone}</p>
                  {o.deliveryAddress && (
                    <p className="text-xs text-slate-400 mt-1">📍 {[o.deliveryAddress.street, o.deliveryAddress.city, o.deliveryAddress.state].filter(Boolean).join(', ')}</p>
                  )}
                </div>
                <div className="text-right shrink-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)}>
                  <p className="font-black text-orange-600">₹{o.totalAmount}</p>
                  <p className="text-xs text-slate-400">{o.items?.length} item(s)</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <select value={o.status} onChange={async e => { const res = await fetch(`${API_URL}/admin/orders/${o._id}/status`, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.target.value }) }); const d = await res.json(); if (d.success) fetchAll(); }} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white flex-1 min-w-[100px]">
                  {['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
                <select 
                  value={o.deliveryPartner?._id || o.deliveryPartner || ''} 
                  onChange={async e => { 
                    const partnerId = e.target.value;
                    if (!partnerId) return;
                    console.log('Assigning delivery partner:', partnerId, 'to order:', o._id);
                    try {
                      const res = await fetch(`${API_URL}/admin/orders/${o._id}/assign-delivery`, { 
                        method: 'PATCH', 
                        headers: { ...headers, 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ deliveryPartnerId: partnerId }) 
                      }); 
                      const d = await res.json();
                      console.log('Assignment response:', d);
                      if (d.success) {
                        alert('Delivery partner assigned successfully!');
                        fetchAll();
                      } else {
                        alert(d.error || 'Failed to assign');
                      }
                    } catch (err) {
                      console.error('Assignment error:', err);
                      alert('Failed to assign delivery partner');
                    }
                  }} 
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white flex-1 min-w-[120px]"
                >
                  <option value="">{o.deliveryPartner ? 'Change...' : 'Assign to...'}</option>
                  {deliveryPartners?.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.isOnline ? '🟢' : '⚫'}
                    </option>
                  ))}
                </select>
                <button onClick={async () => { if (!confirm('Delete order?')) return; const res = await fetch(`${API_URL}/admin/orders/${o._id}`, { method: 'DELETE', headers }); const d = await res.json(); if (d.success) fetchAll(); }} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)} className="shrink-0 text-slate-300">
                  {expandedRow === o._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {expandedRow === o._id && (
              <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { label: 'Payment', value: `${o.paymentMethod} · ${o.paymentStatus}` },
                    { label: 'Delivery Fee', value: `₹${o.deliveryFee || 0}` },
                    { label: 'Discount', value: `₹${o.discount || 0}` },
                    { label: 'Final Amount', value: `₹${o.finalAmount}` },
                  ].map(row => (
                    <div key={row.label} className="bg-white rounded-lg p-2.5">
                      <p className="text-slate-400 text-[10px] uppercase">{row.label}</p>
                      <p className="font-semibold text-slate-800 mt-0.5 text-xs">{row.value}</p>
                    </div>
                  ))}
                </div>
                {o.deliveryAddress && <p className="text-xs text-slate-400 px-1">📍 {[o.deliveryAddress.street, o.deliveryAddress.city, o.deliveryAddress.state].filter(Boolean).join(', ')}</p>}
              </div>
            )}
          </div>
        )))}
      </div>
    </div>
    </div>
  );
}

export function MenuTab({ menuItems, search, setSearch, expandedRow, setExpandedRow, setMenuModal, setImgPreview, kitchens, fetchAll, headers, API_URL }: any) {
  const [kitchenFilter, setKitchenFilter] = React.useState('');
  const [nameFilter, setNameFilter] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  const filteredItems = menuItems.filter((m: any) => {
    const matchesSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    const matchesKitchen = !kitchenFilter || 
      (kitchenFilter === 'no-kitchen' ? !m.cloudKitchen : m.cloudKitchen?._id === kitchenFilter || m.cloudKitchen === kitchenFilter);
    const matchesName = !nameFilter || m.name?.toLowerCase().includes(nameFilter.toLowerCase());
    return matchesSearch && matchesKitchen && matchesName;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…" className="flex-1 text-sm focus:outline-none placeholder:text-slate-400" />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >
            <span>🔍 Filters</span>
            {(nameFilter || kitchenFilter) && (
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-10 min-w-[280px]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Filter by Name</label>
                  <select 
                    value={nameFilter} 
                    onChange={e => setNameFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
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
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Kitchen</label>
                  <select 
                    value={kitchenFilter} 
                    onChange={e => setKitchenFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                  >
                    <option value="">All Kitchens</option>
                    {kitchens?.map((k: any) => (
                      <option key={k._id} value={k._id}>{k.name}</option>
                    ))}
                    <option value="no-kitchen">No Kitchen</option>
                  </select>
                </div>
                <button 
                  onClick={() => { setNameFilter(''); setKitchenFilter(''); }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
        <button onClick={() => { setMenuModal({ open: true, data: null }); setImgPreview(''); }} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition shrink-0">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Menu Items</p>
          <span className="text-xs text-slate-400">{filteredItems.length} of {menuItems.length} items</span>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="font-semibold">No menu items found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredItems.map((m: any) => (
              <div key={m._id}>
                <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition cursor-pointer" onClick={() => setExpandedRow(expandedRow === m._id ? null : m._id)}>
                  <img 
                    src={m.image?.startsWith('http') ? m.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'} 
                    alt={m.name} 
                    className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm" 
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'; }} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                      {m.isTodaySpecial && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⭐ Today's Special</span>}
                      {m.isSpecial && !m.isTodaySpecial && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">✨ Special</span>}
                    </div>
                    <p className="text-xs text-slate-400">{m.cloudKitchen?.name || 'No Kitchen'}</p>
                    {m.cloudKitchen?.location?.coordinates && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        📍 {m.cloudKitchen.location.coordinates[1].toFixed(4)}°N, {m.cloudKitchen.location.coordinates[0].toFixed(4)}°E
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {m.discount > 0 ? (
                      <div>
                        <p className="text-xs text-slate-400 line-through">₹{m.price}</p>
                        <p className="font-black text-orange-600 text-lg">₹{m.price - m.discount}</p>
                        <p className="text-[10px] text-green-600 font-bold">₹{m.discount} OFF</p>
                      </div>
                    ) : (
                      <p className="font-black text-orange-600 text-lg">₹{m.price}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setImgPreview(''); setMenuModal({ open: true, data: m }); }} className="px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition">
                      Edit
                    </button>
                    <button 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (!confirm(`Delete "${m.name}"?\n\nThis will permanently remove this menu item.`)) return; 
                        try {
                          const res = await fetch(`${API_URL}/admin/menu/${m._id}`, { 
                            method: 'DELETE',
                            headers
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert('✅ ' + data.message);
                            fetchAll(); // Refresh data
                          } else {
                            alert('❌ ' + (data.error || 'Failed to delete'));
                          }
                        } catch (err) {
                          console.error('Delete error:', err);
                          alert('❌ Failed to delete menu item');
                        }
                      }} 
                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition"
                      title="Delete menu item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {expandedRow === m._id && (
                  <div className="px-5 pb-4 pt-2 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Category</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs">{m.category}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Meal Type</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs">{m.mealType}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Discount Price</p>
                        <p className="font-semibold text-green-600 mt-0.5 text-xs">₹{m.discount || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Final Price</p>
                        <p className="font-semibold text-orange-600 mt-0.5 text-xs">₹{m.price - (m.discount || 0)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Rating</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs">⭐ {m.rating || 0}/5</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Kitchen</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs truncate">{m.cloudKitchen?.name || 'No Kitchen'}</p>
                        {m.cloudKitchen?.location?.coordinates && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            📍 {m.cloudKitchen.location.coordinates[1].toFixed(4)}°N, {m.cloudKitchen.location.coordinates[0].toFixed(4)}°E
                          </p>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Available Quantity</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs">{m.availableQuantity || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">Available Until</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs">
                          {m.availableUntil ? new Date(m.availableUntil).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 col-span-2">
                        <p className="text-slate-400 text-[10px] uppercase">Special Tags</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {m.isTodaySpecial && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⭐ Today's Special</span>}
                          {m.isSpecial && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">✨ Special Item</span>}
                          {!m.isTodaySpecial && !m.isSpecial && <span className="text-xs text-slate-400">No special tags</span>}
                        </div>
                      </div>
                    </div>
                    {m.description && (
                      <div className="bg-white rounded-lg p-2.5 mb-2">
                        <p className="text-slate-400 text-[10px] uppercase mb-1">Description</p>
                        <p className="text-xs text-slate-600">{m.description}</p>
                      </div>
                    )}
                    {m.ingredients && m.ingredients.length > 0 && (
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase mb-1">Ingredients</p>
                        <div className="flex flex-wrap gap-1">
                          {m.ingredients.map((ing: string, i: number) => (
                            <span key={i} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{ing}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-slate-400 font-mono text-[10px] px-1 mt-2">ID: {m._id}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function KitchensTab({ kitchens, menuItems, setKitchenModal, fetchAll, headers, API_URL }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setKitchenModal({ open: true, data: null })} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition">
          <Plus className="w-4 h-4" /> Add Kitchen
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {kitchens.map((k: any) => (
          <div key={k._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-2xl shadow-sm shrink-0">🏠</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{k.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{k.location?.coordinates ? `${k.location.coordinates[1].toFixed(4)}°N, ${k.location.coordinates[0].toFixed(4)}°E` : 'No location'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{menuItems.filter((m: any) => m.cloudKitchen?._id === k._id || m.cloudKitchen === k._id).length} menu items</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setKitchenModal({ open: true, data: k })} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 transition shrink-0">Edit</button>
                {k.location?.coordinates && (
                  <button 
                    onClick={() => {
                      const [lng, lat] = k.location.coordinates;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition shrink-0 flex items-center gap-1"
                  >
                    <span>🧭</span> Navigate
                  </button>
                )}
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">Added {fmt(k.createdAt)}</span>
              <button onClick={async () => { if (!confirm('Delete kitchen?')) return; const res = await fetch(`${API_URL}/admin/cloudkitchens/${k._id}`, { method: 'DELETE', headers }); const d = await res.json(); if (d.success) fetchAll(); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {kitchens.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400 bg-white rounded-xl shadow-sm">
            <p className="text-5xl mb-3">🏠</p>
            <p className="font-semibold">No cloud kitchens yet</p>
            <p className="text-sm mt-1">Add your first kitchen above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubscriptionsTab({ subscriptions, expandedRow, setExpandedRow, fetchAll, headers, API_URL }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subscriptions</p>
        <span className="text-xs text-slate-400">{subscriptions.length} records</span>
      </div>
      {subscriptions.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><p className="text-5xl mb-3">💳</p><p className="font-semibold">No subscriptions yet</p></div>
      ) : (
        <div className="divide-y divide-slate-50">
          {subscriptions.map((s: any) => (
            <div key={s._id}>
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${SC[s.status || 'active'] || 'bg-slate-100 text-slate-600'}`}>{s.status || 'active'}</span>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{s.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{s.user?.email}</p>
                </div>
                <div className="text-right shrink-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                  <p className="font-black text-purple-600">₹{s.amount || s.totalAmount || 0}</p>
                  <p className="text-xs text-slate-400">{fmt(s.createdAt)}</p>
                </div>
                <button onClick={async () => { if (!confirm('Delete subscription?')) return; const res = await fetch(`${API_URL}/admin/subscriptions/${s._id}`, { method: 'DELETE', headers }); const d = await res.json(); if (d.success) fetchAll(); }} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)} className="shrink-0 text-slate-300">
                  {expandedRow === s._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {expandedRow === s._id && (
                <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Plan', value: s.plan || s.planName || 'N/A' },
                      { label: 'Duration', value: s.duration || s.days || 'N/A' },
                      { label: 'Start', value: s.startDate ? fmt(s.startDate) : 'N/A' },
                      { label: 'End', value: s.endDate ? fmt(s.endDate) : 'N/A' },
                    ].map(row => (
                      <div key={row.label} className="bg-white rounded-lg p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase">{row.label}</p>
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs">{row.value}</p>
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
  );
}

export function NotificationsTab({ notifications, setNotifications, notifForm, setNotifForm, notifSaving, setNotifSaving, headers, API_URL }: any) {
  const typeEmoji: Record<string, string> = { info: 'ℹ️', offer: '🎁', order: '📦', alert: '⚠️' };
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-slate-900">Create Notification</h3>
        <input placeholder="Title" value={notifForm.title} onChange={e => setNotifForm((f: any) => ({ ...f, title: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
        <textarea placeholder="Message" rows={3} value={notifForm.message} onChange={e => setNotifForm((f: any) => ({ ...f, message: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" />
        <select value={notifForm.type} onChange={e => setNotifForm((f: any) => ({ ...f, type: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
          <option value="info">ℹ️ Info</option>
          <option value="offer">🎁 Offer</option>
          <option value="order">📦 Order</option>
          <option value="alert">⚠️ Alert</option>
        </select>
        <button disabled={notifSaving || !notifForm.title || !notifForm.message} onClick={async () => { setNotifSaving(true); try { const res = await fetch(`${API_URL}/notifications/admin`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(notifForm) }); const d = await res.json(); if (d.success) { setNotifForm({ title: '', message: '', type: 'info', targetAll: true }); setNotifications((n: any[]) => [d.notification, ...n]); } else alert(d.error || 'Failed'); } catch { alert('Failed'); } setNotifSaving(false); }} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition">
          {notifSaving ? 'Sending…' : '🚀 Send to All Users'}
        </button>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sent ({notifications.length})</p>
      {notifications.length === 0 && <div className="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm"><p className="text-4xl mb-2">🔔</p><p className="font-semibold">No notifications sent yet</p></div>}
      <div className="space-y-3">
        {notifications.map((n: any) => (
          <div key={n._id} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
            <span className="text-xl shrink-0">{typeEmoji[n.type] || 'ℹ️'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">{n.readBy?.length || 0} read</span>
              </div>
            </div>
            <button onClick={async () => { if (!confirm('Delete?')) return; const res = await fetch(`${API_URL}/notifications/admin/${n._id}`, { method: 'DELETE', headers }); const d = await res.json(); if (d.success) setNotifications((prev: any[]) => prev.filter(x => x._id !== n._id)); }} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LegalTab({ legal, setLegal, legalSaving, setLegalSaving, headers, API_URL }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900">📄 Terms & Conditions</h3>
        <textarea rows={10} value={legal.terms} onChange={e => setLegal((l: any) => ({ ...l, terms: e.target.value }))} placeholder="Enter Terms & Conditions…" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900">🔒 Privacy Policy</h3>
        <textarea rows={10} value={legal.privacy} onChange={e => setLegal((l: any) => ({ ...l, privacy: e.target.value }))} placeholder="Enter Privacy Policy…" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
      </div>
      <button disabled={legalSaving} onClick={async () => { setLegalSaving(true); try { await Promise.all([fetch(`${API_URL}/legalpages/terms`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Terms & Conditions', content: legal.terms }) }), fetch(`${API_URL}/legalpages/privacy`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Privacy Policy', content: legal.privacy }) })]); } catch { alert('Failed'); } setLegalSaving(false); }} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition">
        {legalSaving ? 'Saving…' : '💾 Save Legal Content'}
      </button>
    </div>
  );
}

export function HomestyleTab({ hsVideos, setHsVideos, hsVideoUploading, hsSaving, saveHomestyle, uploadVideo }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">🎬 Hero Videos</h3>
          <label className="cursor-pointer px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition">
            {hsVideoUploading ? 'Uploading…' : '+ Upload Video'}
            <input type="file" accept="video/*" className="hidden" disabled={hsVideoUploading} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const url = await uploadVideo(file); setHsVideos((v: string[]) => [...v, url]); } catch { alert('Upload failed'); } }} />
          </label>
        </div>
        {hsVideos.length === 0 && <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">No videos uploaded yet</p>}
        <div className="space-y-2">
          {hsVideos.map((url: string, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <video src={url} className="w-20 h-12 rounded-lg object-cover shrink-0" />
              <p className="flex-1 text-xs text-slate-500 truncate min-w-0">{url}</p>
              <button onClick={() => setHsVideos((v: string[]) => v.filter((_, idx) => idx !== i))} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <button onClick={saveHomestyle} disabled={hsSaving} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition">
        {hsSaving ? 'Saving…' : '💾 Save Home Page'}
      </button>
    </div>
  );
}

export function CouponsTab({ coupons, userPerformance, setCouponModal, fetchAll, headers, API_URL, performanceDateFrom, setPerformanceDateFrom, performanceDateTo, setPerformanceDateTo }: any) {
  return (
    <div className="space-y-5">
      {/* Performance Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Filter by Date</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-600 mb-2">From Date</label>
            <input
              type="date"
              value={performanceDateFrom}
              onChange={(e) => setPerformanceDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-600 mb-2">To Date</label>
            <input
              type="date"
              value={performanceDateTo}
              onChange={(e) => setPerformanceDateTo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {(performanceDateFrom || performanceDateTo) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPerformanceDateFrom('');
                  setPerformanceDateTo('');
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        {(performanceDateFrom || performanceDateTo) && (
          <p className="text-xs text-gray-500 mt-3">
            📊 Showing performance {performanceDateFrom && `from ${new Date(performanceDateFrom).toLocaleDateString('en-IN')}`} {performanceDateFrom && performanceDateTo && 'to'} {performanceDateTo && new Date(performanceDateTo).toLocaleDateString('en-IN')}
          </p>
        )}
      </div>

      {/* Top Performance Users */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-100 text-xs font-semibold uppercase tracking-wide">Top Performers</p>
            <p className="text-white font-bold text-lg mt-0.5">Reward Your Best Customers</p>
          </div>
          <Award className="w-8 h-8 text-purple-200" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {userPerformance.slice(0, 3).map((user: any, i: number) => (
            <div key={user._id} className="bg-white/15 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-white font-black text-xl">#{i + 1}</p>
              <p className="text-purple-100 text-xs mt-0.5 truncate">{user.name}</p>
              <p className="text-white font-bold text-sm">₹{user.totalSpent.toLocaleString()}</p>
              <p className="text-purple-100 text-[10px]">{user.totalOrders} orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons List */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-gray-900 text-lg">Active Coupons</h3>
        <button onClick={() => setCouponModal({ open: true, data: null })} className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-bold shadow-sm transition">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {coupons.map((c: any) => (
          <div key={c._id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${c.isActive ? 'border-purple-200' : 'border-gray-200'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.isActive ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Tag className={`w-6 h-6 ${c.isActive ? 'text-purple-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-black text-lg text-gray-900">{c.code}</p>
                    <p className="text-xs text-gray-400">{c.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-purple-50 rounded-lg p-2.5">
                  <p className="text-purple-400 text-[10px] uppercase">Discount</p>
                  <p className="font-bold text-purple-600">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-gray-400 text-[10px] uppercase">Min Order</p>
                  <p className="font-bold text-gray-600">₹{c.minOrderAmount}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2.5">
                  <p className="text-blue-400 text-[10px] uppercase">Used</p>
                  <p className="font-bold text-blue-600">{c.usedCount}/{c.usageLimit || '∞'}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2.5">
                  <p className="text-orange-400 text-[10px] uppercase">Valid Until</p>
                  <p className="font-bold text-orange-600 text-xs">{fmt(c.validUntil)}</p>
                </div>
              </div>

              {c.userSpecific && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                  <p className="text-amber-700 text-xs font-semibold">🎁 Exclusive for: {c.userSpecific.name}</p>
                </div>
              )}

              {c.performanceBased && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                  <p className="text-green-700 text-xs font-semibold">⭐ Performance Reward</p>
                  {c.performanceCriteria?.reason && (
                    <p className="text-green-600 text-[10px] mt-0.5">{c.performanceCriteria.reason}</p>
                  )}
                </div>
              )}

              {c.availableForAreas && c.availableForAreas.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                  <p className="text-blue-700 text-xs font-semibold">📍 Available in: {c.availableForAreas.length} area(s)</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.availableForAreas.slice(0, 3).map((area: string) => (
                      <span key={area} className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                        {area}
                      </span>
                    ))}
                    {c.availableForAreas.length > 3 && (
                      <span className="text-[10px] text-blue-600 font-semibold">+{c.availableForAreas.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setCouponModal({ open: true, data: c })} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition">
                  Edit
                </button>
                <button 
                  onClick={async () => {
                    const res = await fetch(`${API_URL}/coupons/${c._id}/toggle`, { method: 'PATCH', headers });
                    const d = await res.json();
                    if (d.success) fetchAll();
                  }}
                  className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition"
                >
                  {c.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={async () => {
                    if (!confirm('Delete coupon?')) return;
                    const res = await fetch(`${API_URL}/coupons/${c._id}`, { method: 'DELETE', headers });
                    const d = await res.json();
                    if (d.success) fetchAll();
                  }}
                  className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow-sm">
          <p className="text-5xl mb-3">🎟️</p>
          <p className="font-semibold">No coupons created yet</p>
          <p className="text-sm mt-1">Create your first coupon above</p>
        </div>
      )}

      {/* User Performance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            User Performance
          </h3>
          <span className="text-xs text-gray-400">{userPerformance.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Orders</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total Spent</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Avg Order</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userPerformance.slice(0, 10).map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-gray-900">{user.totalOrders}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-purple-600">₹{user.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600">₹{Math.round(user.avgOrderValue)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button 
                      onClick={() => setCouponModal({ 
                        open: true, 
                        data: { 
                          userSpecific: user._id, 
                          performanceBased: true,
                          performanceCriteria: {
                            minOrders: user.totalOrders,
                            minSpent: user.totalSpent,
                            reason: `Reward for ${user.totalOrders} orders worth ₹${user.totalSpent.toLocaleString()}`
                          }
                        } 
                      })}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition"
                    >
                      Reward
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, email, phone or schedule ID…" 
            className="flex-1 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400" 
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Date:</span>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="text-sm focus:outline-none text-slate-700 bg-transparent"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="text-xs text-orange-500 font-bold hover:text-orange-600 shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">📅 Schedule Orders</p>
          <span className="text-xs text-slate-400">{filteredOrders.length} of {scheduleOrders.length} records</span>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">📅</p>
              <p className="font-semibold">No schedule orders found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredOrders.map((s: any) => (
              <div key={s._id}>
                <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Schedule</span>
                      <span className="text-slate-400 text-[11px]">{s.meals?.length || 0} meals</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm">{s.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">📱 {s.user?.phone} · {s.user?.email}</p>
                  </div>
                  <div className="text-right shrink-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                    <p className="font-black text-indigo-600">₹{s.meals?.reduce((sum: number, m: any) => sum + (m.mealPrice || 0), 0) || 0}</p>
                    <p className="text-xs text-slate-400">{fmt(s.createdAt)}</p>
                  </div>
                  <button onClick={async () => { if (!confirm('Delete schedule?')) return; const res = await fetch(`${API_URL}/admin/schedules/${s._id}`, { method: 'DELETE', headers }); const d = await res.json(); if (d.success) fetchAll(); }} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)} className="shrink-0 text-slate-300">
                    {expandedRow === s._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {expandedRow === s._id && (
                  <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100 pt-3">
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-slate-400 text-[10px] uppercase mb-2">Customer Details</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="font-semibold text-slate-800 text-sm">{s.user?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="font-semibold text-slate-800 text-sm">{s.user?.phone}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-semibold text-slate-800 text-sm">{s.user?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Wallet Balance</p>
                            <p className="font-semibold text-green-600 text-sm">₹{s.user?.walletBalance || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Location</p>
                            <p className="font-semibold text-slate-800 text-sm">{s.user?.currentLocation?.locationName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3">
                        <p className="text-slate-400 text-[10px] uppercase mb-2">Scheduled Meals</p>
                        <div className="space-y-2">
                          {s.meals?.map((m: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    m.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' : 
                                    m.mealType === 'Lunch' ? 'bg-orange-100 text-orange-700' : 
                                    'bg-indigo-100 text-indigo-700'
                                  }`}>{m.mealType}</span>
                                  <span className="text-xs text-slate-400">{m.date ? new Date(m.date).toLocaleDateString('en-IN') : 'N/A'}</span>
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">{m.menuItem?.name || 'N/A'}</p>
                                <p className="text-xs text-slate-400">🕐 {m.deliveryTime || 'N/A'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-indigo-600">₹{m.mealPrice || 0}</p>
                                {m.status && (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SC[m.status] || 'bg-slate-100 text-slate-600'}`}>
                                    {m.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {s.meals?.[0]?.deliveryAddress && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-slate-400 text-[10px] uppercase mb-2">Delivery Address</p>
                          <p className="text-xs text-slate-600">
                            📍 {[
                              s.meals[0].deliveryAddress.street,
                              s.meals[0].deliveryAddress.city,
                              s.meals[0].deliveryAddress.state,
                              s.meals[0].deliveryAddress.pincode
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-700">Total Amount</p>
                          <p className="text-xl font-black text-indigo-600">₹{s.meals?.reduce((sum: number, m: any) => sum + (m.mealPrice || 0), 0) || 0}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 font-mono text-[10px] px-1 mt-2">ID: {s._id}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
