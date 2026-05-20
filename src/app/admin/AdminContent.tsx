'use client';
import React from 'react';
import { ChevronDown, ChevronUp, Search, Trash2, Plus, Activity, Tag, TrendingUp, Award, Users, ShoppingBag, UtensilsCrossed, CreditCard, ChevronRight, Calendar, ArrowUpDown, Mail, Phone, MapPin, Truck } from 'lucide-react';
import AdminNotifications from '@/components/AdminNotifications';

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
    <>
      {/* Admin Notifications */}
      <AdminNotifications />
      
      <div className="space-y-10">
      {/* Stats Grid - High Impact Pill Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Market Users', value: stats.users, color: 'text-orange-600', icon: Users, gradient: 'from-orange-100/50 to-amber-100/50' },
          { label: 'Flow Volume', value: stats.orders, color: 'text-amber-600', icon: ShoppingBag, gradient: 'from-amber-100/50 to-yellow-100/50' },
          { label: 'Cloud Catalog', value: stats.menuItems, color: 'text-yellow-600', icon: UtensilsCrossed, gradient: 'from-yellow-100/50 to-orange-100/50' },
          { label: 'Recurring Sub', value: stats.subscriptions, color: 'text-orange-600', icon: CreditCard, gradient: 'from-orange-100/50 to-amber-100/50' },
          { label: 'Total Capital', value: `₹${(stats.totalWalletBalance || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600', icon: TrendingUp, gradient: 'from-emerald-100/50 to-teal-100/50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br ${s.gradient} border border-white/50`}>
            <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-bl-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 lg:-mr-12 lg:-mt-12 opacity-30 group-hover:scale-110 transition-transform duration-700`} />
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1 sm:mb-2">{s.label}</p>
              <p className="text-base sm:text-lg lg:text-2xl font-black text-white tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Analytics with Date Filter */}
      <div className="bg-white rounded-[3rem] shadow-lg overflow-hidden relative border-2 border-slate-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50/30 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="p-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg ring-4 ring-orange-100">
                📊
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-2xl tracking-tight">Ecosystem Intelligence</h3>
                <p className="text-slate-600 font-bold text-sm mt-1">Real-time analytics dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-full px-6 py-4 flex items-center gap-4">
                 <div className="flex flex-col">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Start Window</p>
                   <input type="date" value={performanceDateFrom} onChange={e => setPerformanceDateFrom(e.target.value)} className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none" />
                 </div>
                 <div className="w-px h-6 bg-slate-200" />
                 <div className="flex flex-col">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">End Window</p>
                   <input type="date" value={performanceDateTo} onChange={e => setPerformanceDateTo(e.target.value)} className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none" />
                 </div>
              </div>
              {(performanceDateFrom || performanceDateTo) && (
                <button onClick={() => { setPerformanceDateFrom(''); setPerformanceDateTo(''); }} className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition shadow-lg active:scale-95">
                  <Activity className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Avg Order Rating</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-black text-slate-900">{((orders.filter((o: any) => o.status === 'delivered').length / Math.max(orders.length, 1)) * 100).toFixed(1)}%</p>
                  <span className="text-emerald-600 text-xs font-black">✓ Delivered</span>
                </div>
                <div className="mt-6 flex gap-1 items-end h-8">
                  {orders.slice(-7).map((o: any, i: number) => {
                    const isDelivered = o.status === 'delivered' ? 100 : o.status === 'pending' ? 30 : 60;
                    return <div key={i} className="flex-1 bg-emerald-300 rounded-t-sm" style={{ height: `${isDelivered}%` }} />;
                  })}
                </div>
             </div>
             <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Total Transactions</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-black text-slate-900">{stats.orders}</p>
                  <span className="text-orange-600 text-xs font-black">Orders</span>
                </div>
                <div className="mt-6 flex gap-1 items-end h-8">
                  {orders.slice(-7).map((o: any, i: number) => {
                    const height = Math.max(20, Math.min(100, (o.items?.length || 0) * 15));
                    return <div key={i} className="flex-1 bg-orange-400 rounded-t-sm" style={{ height: `${height}%` }} />;
                  })}
                </div>
             </div>
             <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Active Users</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-black text-slate-900">{stats.users}</p>
                  <span className="text-blue-600 text-xs font-black">Total</span>
                </div>
                <div className="mt-6 flex gap-1 items-end h-8">
                  {Array(7).fill(0).map((_, i) => {
                    const height = Math.max(30, (stats.users / 7) * (50 + Math.random() * 50) / stats.users);
                    return <div key={i} className="flex-1 bg-blue-400 rounded-t-sm" style={{ height: `${Math.min(100, height)}%` }} />;
                  })}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Today's Momentum Card */}
      {today && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-orange-100/20 p-10 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl -ml-40 -mb-40 opacity-40 group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Live Engine
                  </span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Today's Pulse</h2>
                <p className="text-slate-400 font-bold text-base mt-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {today.date}
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center px-10 py-6 rounded-[2.5rem] bg-orange-50 border border-orange-100 shadow-inner">
                  <p className="text-orange-600 font-black text-4xl">₹{today.summary.revenue.toLocaleString()}</p>
                  <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mt-2">Daily Revenue</p>
                </div>
                <div className="text-center px-10 py-6 rounded-[2.5rem] bg-slate-100 border border-slate-200 shadow-inner">
                  <p className="text-slate-900 font-black text-4xl">{today.summary.totalOrders + today.summary.scheduledMeals}</p>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-2">Meals Dispatched</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Direct Orders', value: today.summary.totalOrders, icon: '⚡', color: 'orange' },
                { label: 'Subscriptions', value: today.summary.scheduledMeals, icon: '📅', color: 'blue' },
                { label: 'Delivered', value: today.summary.delivered, icon: '✅', color: 'emerald' },
                { label: 'On-Hold', value: today.summary.pending, icon: '⏳', color: 'amber' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-50">{s.icon}</div>
                    <div>
                      <p className="text-slate-900 font-black text-2xl leading-none">{s.value}</p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{s.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mixed Activity Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {today?.scheduledOrders?.length > 0 && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Subscription Pipeline
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Automated fulfillment queue</p>
              </div>
              <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest">{today.summary.scheduledMeals} ACTIVE</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto scrollbar-hide">
              {today.scheduledOrders.map((s: any) => (
                <div key={s._id} className="px-10 py-7 hover:bg-slate-50/80 transition-all group">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                        {s.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{s.user?.name}</p>
                        <p className="text-xs font-bold text-slate-400">#SCH-{s._id.slice(-4).toUpperCase()}</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:border-blue-100 transition-all shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.meals.map((m: any, i: number) => (
                      <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${
                        m.mealType === 'Breakfast' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                        m.mealType === 'Lunch' ? 'bg-orange-50 border-orange-100 text-orange-700' : 
                        'bg-indigo-50 border-indigo-100 text-indigo-700'
                      }`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">{m.mealType}</span>
                        <div className="w-1 h-3 bg-current/20 rounded-full" />
                        <span className="text-[11px] font-bold truncate max-w-[150px]">{m.menuItem?.name || 'Meal Plan'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {today?.instantOrders?.length > 0 && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Live Dispatch
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">On-demand transactions</p>
              </div>
              <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest">{today.instantOrders.length} LIVE</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto scrollbar-hide">
              {today.instantOrders.map((o: any) => (
                <div key={o._id} className="px-10 py-7 flex items-center justify-between hover:bg-slate-50/80 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                      {o.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{o.user?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{o.items?.length || 0} ITEMS</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-lg">₹{o.totalAmount}</p>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest mt-2 inline-block ${
                      o.status === 'delivered' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      o.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      'bg-orange-50 border-orange-100 text-orange-600'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1">
          <h3 className="font-black text-slate-900 text-xl mb-2">Historical Footprint</h3>
          <p className="text-slate-400 font-bold text-sm">Aggregated metrics across the entire lifecycle of the platform.</p>
        </div>
        <div className="flex gap-4">
          {[
            { label: 'Active Hubs', value: kitchens.length, icon: '🏠' },
            { label: 'Active Menu', value: menuItems.filter((i: any) => i.isAvailable).length, icon: '🍱' },
            { label: 'LTV Yield', value: `₹${orders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0).toLocaleString()}`, icon: '💰' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center min-w-[140px] hover:shadow-lg transition-all">
              <span className="text-2xl mb-3 block">{s.icon}</span>
              <p className="text-xl font-black text-slate-900 tracking-tight">{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}

export function UsersTab({ users, search, setSearch, expandedRow, setExpandedRow, setUserModal, openEditUserModal }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white rounded-full border border-slate-200 px-6 py-3.5 shadow-sm focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search market participants…" 
            className="flex-1 text-sm font-bold focus:outline-none text-slate-700 placeholder:text-slate-400 bg-transparent" 
          />
        </div>
        <button onClick={() => setUserModal({ open: true, data: null })} className="flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition active:scale-95">
          <Plus className="w-5 h-5" /> Enlist User
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authentication Registry</p>
          <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{users.length} TOTAL ENTITIES</span>
        </div>
        <div className="divide-y divide-slate-50">
          {users.filter((u: any) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)).map((u: any) => (
            <div key={u._id} className="group">
              <button 
                className="w-full flex items-center gap-6 px-10 py-6 hover:bg-slate-50 transition-all text-left" 
                onClick={() => setExpandedRow(expandedRow === u._id ? null : u._id)}
              >
                <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-base leading-none mb-1.5">{u.name}</p>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <span className="text-base text-slate-300">📱</span> {u.phone}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{u.role || 'Consumer'}</p>
                  <p className="text-sm font-black text-slate-700">{u.email || 'No Identity Linked'}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  expandedRow === u._id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-500'
                }`}>
                  {expandedRow === u._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              {expandedRow === u._id && (
                <div className="px-10 pb-8 pt-2 bg-slate-50/50 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Current Liquidity', value: `₹${u.walletBalance || 0}`, cls: 'text-emerald-600', icon: '💰' },
                      { label: 'Dispatch Points', value: `${u.addresses?.length || 0} nodes`, icon: '📍' },
                      { label: 'Market Tier', value: u.isPremium ? 'Premium Elite' : 'Standard Tier', cls: u.isPremium ? 'text-amber-600' : '', icon: '💎' },
                      { label: 'Registry Date', value: fmt(u.createdAt), icon: '🗓️' },
                    ].map(row => (
                      <div key={row.label} className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{row.icon}</span>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
                        </div>
                        <p className={`font-black text-slate-800 text-sm ${row.cls}`}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditUserModal ? openEditUserModal(u) : setUserModal({ open: true, data: u }); }}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition active:scale-95"
                    >
                      🛠️ Command User Profile
                    </button>
                    <div className="bg-white px-6 py-4 rounded-full border border-slate-100 flex-1">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Internal Reference</p>
                       <p className="text-[10px] font-bold text-slate-400 font-mono truncate">{u._id}</p>
                    </div>
                  </div>
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
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

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

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const toggleSort = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white rounded-full border border-slate-200 px-6 py-3.5 shadow-sm focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, ID, or phone..." 
            className="flex-1 text-sm font-bold focus:outline-none text-slate-700 placeholder:text-slate-400 bg-transparent" 
          />
        </div>
        <div className="flex items-center gap-4 bg-white rounded-full border border-slate-200 px-6 py-3.5 shadow-sm">
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date Selector</p>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className="text-xs font-bold focus:outline-none text-slate-700 bg-transparent"
            />
          </div>
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-orange-500 hover:text-orange-600 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabular List Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header - Hidden on mobile if preferred, but styled for both */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-slate-900 transition" onClick={toggleSort}>
            Date <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-3 text-center">Status</div>
          <div className="col-span-2 text-right">Details</div>
        </div>

        <div className="divide-y divide-slate-50">
          {sortedOrders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-200" />
              </div>
              <p className="font-black text-slate-400 uppercase text-xs tracking-widest">No order data found</p>
            </div>
          ) : (
            sortedOrders.map((o: any) => (
              <div key={o._id} className={`group transition-all ${expandedRow === o._id ? 'bg-orange-50/10' : 'hover:bg-slate-50/50'}`}>
                {/* Main Row Content */}
                <div 
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 items-center cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)}
                >
                  {/* Date Column */}
                  <div className="col-span-2">
                    <p className="text-xs font-black text-slate-900">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                  </div>

                  {/* Customer Column */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-100 group-hover:scale-105 transition-transform">
                      {o.user?.name?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate uppercase">{o.user?.name || 'Guest'}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{o.user?.phone}</p>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="col-span-2">
                    <p className="text-sm font-black text-emerald-600">₹{o.totalAmount || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{o.items?.length || 0} Items</p>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-3 flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      o.status === 'delivered' ? 'bg-green-50 border-green-100 text-green-600' :
                      o.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      o.status === 'out_for_delivery' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                      'bg-orange-50 border-orange-100 text-orange-600'
                    }`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Toggle Column */}
                  <div className="col-span-2 flex justify-end">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      expandedRow === o._id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'
                    }`}>
                      {expandedRow === o._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRow === o._id && (
                  <div className="px-6 md:px-8 pb-10 pt-2 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Customer Details Column */}
                      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Users className="w-16 h-16 text-slate-900" />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Users className="w-3 h-3" /> Customer Intelligence
                        </h4>
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-5 h-5" /></div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Email Address</p>
                              <p className="text-xs font-bold text-slate-800">{o.user?.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-5 h-5" /></div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Registered Mobile</p>
                              <p className="text-xs font-bold text-slate-800">{o.user?.phone || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><MapPin className="w-5 h-5" /></div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Dispatch Target</p>
                              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                {[o.deliveryAddress?.street, o.deliveryAddress?.city, o.deliveryAddress?.landmark].filter(Boolean).join(', ') || 'No Address Data'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items & Manifest Column */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <ShoppingBag className="w-3 h-3" /> Delivery Manifest
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {o.items?.map((item: any, i: number) => (
                              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <img 
                                  src={item.menuItem?.image || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                                  className="w-14 h-14 rounded-xl object-cover border border-slate-50 shadow-sm"
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'; }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-slate-900 uppercase truncate">{item.menuItem?.name || item.name || 'Unknown Item'}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">x{item.quantity || 1}</span>
                                    <span className="text-[10px] font-bold text-slate-400 italic">₹{item.price || 0} / unit</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Admin Action Control Center */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Truck className="w-3 h-3" /> Logistics Assignment
                            </p>
                            <select 
                              value={o.deliveryPartner?._id || o.deliveryPartner || ''} 
                              onChange={async (e) => { 
                                const res = await fetch(`${API_URL}/admin/orders/${o._id}/assign-delivery`, { 
                                  method: 'PATCH', 
                                  headers: { ...headers, 'Content-Type': 'application/json' }, 
                                  body: JSON.stringify({ deliveryPartnerId: e.target.value }) 
                                }); 
                                if ((await res.json()).success) fetchAll(); 
                              }} 
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer"
                            >
                              <option value="">STANDBY</option>
                              {deliveryPartners?.map((dp: any) => (
                                <option key={dp._id} value={dp._id}>{dp.name} ({dp.phone})</option>
                              ))}
                            </select>
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              🛡️ Status Authorization
                            </p>
                            <select 
                              value={o.status} 
                              onChange={async e => { 
                                const res = await fetch(`${API_URL}/admin/orders/${o._id}/status`, { 
                                  method: 'PATCH', 
                                  headers: { ...headers, 'Content-Type': 'application/json' }, 
                                  body: JSON.stringify({ status: e.target.value }) 
                                }); 
                                if ((await res.json()).success) fetchAll(); 
                              }} 
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer"
                            >
                              <option value="pending">PENDING</option>
                              <option value="confirmed">CONFIRMED</option>
                              <option value="preparing">PREPARING</option>
                              <option value="out_for_delivery">OUT FOR DELIVERY</option>
                              <option value="delivered">DELIVERED</option>
                              <option value="cancelled">CANCELLED</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
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
        <div className="flex-1 flex items-center gap-3 bg-white rounded-full border border-slate-200 px-5 py-3 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…" className="flex-1 text-sm focus:outline-none placeholder:text-slate-400" />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all ${
              showFilters ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>🔍 Filters</span>
            {(nameFilter || kitchenFilter) && (
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
        <button onClick={() => { setMenuModal({ open: true, data: null }); setImgPreview(''); }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full text-sm font-black shadow-lg shadow-orange-200 transition shrink-0 active:scale-95">
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-7 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory List</p>
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{filteredItems.length} items matched</span>
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
                        <p className="font-semibold text-slate-800 mt-0.5 text-xs truncate" title={m.mealTypes?.join(', ') || m.mealType}>
                          {m.mealTypes?.length > 0 ? m.mealTypes.join(', ') : m.mealType || 'None'}
                        </p>
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setKitchenModal({ open: true, data: null })} className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full text-sm font-black shadow-lg shadow-orange-100 transition active:scale-95">
          <Plus className="w-5 h-5" /> Onboard Kitchen
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.map((k: any) => (
          <div key={k._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/20 transition-all duration-500 overflow-hidden group">
            <div className="p-7">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-orange-100 to-yellow-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">🏠</div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setKitchenModal({ open: true, data: k })} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{k.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Hub</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Menu Size</p>
                    <p className="text-sm font-black text-slate-700">{menuItems.filter((m: any) => m.cloudKitchen?._id === k._id || m.cloudKitchen === k._id).length} Items</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 inline-block">Online</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                    <span className="text-base text-slate-300">📍</span>
                    <span className="truncate">{k.location?.coordinates ? `${k.location.coordinates[1].toFixed(4)}°N, ${k.location.coordinates[0].toFixed(4)}°E` : 'GPS Coordinates Pending'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-7 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center gap-3">
              <button 
                onClick={() => setKitchenModal({ open: true, data: k })} 
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
                onClick={async () => { 
                  if (!confirm('Permanent shutdown kitchen?')) return; 
                  const res = await fetch(`${API_URL}/admin/cloudkitchens/${k._id}`, { method: 'DELETE', headers }); 
                  if ((await res.json()).success) fetchAll(); 
                }} 
                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscriptionsTab({ subscriptions, expandedRow, setExpandedRow, fetchAll, headers, API_URL }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Memberships</p>
            <p className="text-[10px] font-bold text-orange-500 mt-0.5">{subscriptions.length} recurring records</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <CreditCard className="w-4 h-4 text-orange-500" />
          </div>
        </div>
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">💳</div>
            <p className="text-xl font-black text-slate-900">No active subscriptions</p>
            <p className="text-sm mt-1">New memberships will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {subscriptions.map((s: any) => (
              <div key={s._id} className="group">
                <div className="flex items-center gap-5 px-8 py-6 hover:bg-slate-50 transition-all duration-300">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform">
                    {s.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
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
                      className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all ${
                        expandedRow === s._id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                      } shadow-sm`}
                    >
                      {expandedRow === s._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedRow === s._id && (
                  <div className="px-8 pb-8 pt-2 bg-slate-50/50 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Selected Plan', value: s.plan || s.planName || 'Standard', icon: '💎' },
                        { label: 'Time Horizon', value: `${s.duration || s.days || '0'} Days`, icon: '🗓️' },
                        { label: 'Commencement', value: s.startDate ? fmt(s.startDate) : 'N/A', icon: '🚀' },
                        { label: 'Termination', value: s.endDate ? fmt(s.endDate) : 'N/A', icon: '🏁' },
                      ].map(row => (
                        <div key={row.label} className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{row.icon}</span>
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

export function NotificationsTab({ notifications, setNotifications, notifForm, setNotifForm, notifSaving, setNotifSaving, headers, API_URL }: any) {
  const typeEmoji: Record<string, string> = { info: 'ℹ️', offer: '🎁', order: '📦', alert: '⚠️' };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">📢</span>
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
              <option value="info">ℹ️ Announcement</option>
              <option value="offer">🎁 Marketing/Offer</option>
              <option value="order">📦 Order Update</option>
              <option value="alert">⚠️ Urgent Alert</option>
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
              {notifSaving ? 'Broadcasting…' : '🚀 Push Broadcast'}
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
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔔</div>
            <p className="text-xl font-black text-slate-900">Silence is Golden</p>
            <p className="text-slate-400 text-sm mt-1">No notifications dispatched yet</p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div key={n._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shrink-0 group-hover:bg-orange-50 transition-colors">
                  {typeEmoji[n.type] || 'ℹ️'}
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
          <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl">📄</span>
          Terms & Conditions
        </h3>
        <textarea rows={10} value={legal.terms} onChange={e => setLegal((l: any) => ({ ...l, terms: e.target.value }))} placeholder="Enter Legal Terms…" className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none" />
      </div>
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">🔒</span>
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
        {legalSaving ? 'Syncing Docs…' : '💾 Commit Legal Updates'}
      </button>
    </div>
  );
}

export function HomestyleTab({ hsVideos, setHsVideos, hsVideoUploading, hsSaving, saveHomestyle, uploadVideo }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg">🎬 Cinema & Reels</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hero Section Media</p>
          </div>
          <label className="cursor-pointer px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-100 transition active:scale-95">
            {hsVideoUploading ? 'Uploading Reel…' : '+ Add Reel'}
            <input type="file" accept="video/*" className="hidden" disabled={hsVideoUploading} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const url = await uploadVideo(file); setHsVideos((v: string[]) => [...v, url]); } catch { alert('Upload failed'); } }} />
          </label>
        </div>

        {hsVideos.length === 0 ? (
          <div className="text-center py-20 border-4 border-dashed border-slate-50 rounded-[2.5rem]">
            <p className="text-4xl mb-4">🎥</p>
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
      <button 
        onClick={saveHomestyle} 
        disabled={hsSaving} 
        className="w-full py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition active:scale-95"
      >
        {hsSaving ? 'Saving Scene…' : '💾 Save Cinematic Layout'}
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
                  <span className="text-xl">👤</span>
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
                  className={`flex-1 py-3.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                    c.isActive ? 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
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
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📅</div>
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
                      <p className="text-xs font-black text-slate-700">📱 {s.user?.phone}</p>
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
                               <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                 m.mealType === 'Breakfast' ? 'bg-amber-100 text-amber-700' : 
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
                        <span className="text-lg">📍</span>
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

  const customerTypeEmoji: Record<string, string> = {
    Student: '🎓',
    Corporate: '🏢',
    Employee: '👔',
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
                          <span>📱</span> {lead.number}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <span>📧</span> {lead.email}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <span>📍</span> {lead.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full mb-2 inline-block ${mealTypeColors[lead.mealType] || 'bg-slate-100'}`}>
                        {lead.mealType}
                      </span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {customerTypeEmoji[lead.customerType]} {lead.customerType}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      expandedRow === lead._id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-500'
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
                            {customerTypeEmoji[lead.customerType]} {lead.customerType}
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
                              <span className="text-base">📧</span>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-xs font-bold text-slate-700">{lead.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-base">📱</span>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                <p className="text-xs font-bold text-slate-700">{lead.number}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-base">📍</span>
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
                      className={`w-10 h-10 rounded-lg font-black text-sm transition ${
                        page === i + 1 ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
