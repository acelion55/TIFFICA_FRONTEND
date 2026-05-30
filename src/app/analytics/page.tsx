'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShoppingBag, Calendar, Wallet, Award, Activity, ArrowUp, ArrowDown, Users, Zap, LogOut } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function AnalyticsPage() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'kitchen-owner';

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, [token, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      if (isAdmin) {
        // Admin analytics
        const [statsRes, ordersRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/stats`, { headers }),
          fetch(`${API_URL}/admin/orders`, { headers }),
          fetch(`${API_URL}/admin/users`, { headers })
        ]);

        const [statsData, ordersData, usersData] = await Promise.all([
          statsRes.json(),
          ordersRes.json(),
          usersRes.json()
        ]);

        const orders = ordersData.orders || [];
        const users = usersData.users || [];
        const stats = statsData.stats || {};

        // Calculate admin analytics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
        const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing').length;
        const totalUsers = users.length;
        const activeUsers = users.filter((u: any) => u.isActive !== false).length;

        // Monthly revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = orders
          .filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        // Last month revenue
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonthRevenue = orders
          .filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
          })
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        const revenueTrend = lastMonthRevenue > 0 
          ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
          : 0;

        // Average order value
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;

        // Recent orders
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrders = orders.filter((o: any) => new Date(o.createdAt) >= sevenDaysAgo).length;

        setAnalytics({
          isAdmin: true,
          totalOrders,
          totalRevenue,
          deliveredOrders,
          pendingOrders,
          totalUsers,
          activeUsers,
          monthlyRevenue,
          revenueTrend,
          avgOrderValue,
          recentOrders,
          orders: orders.slice(0, 10),
          stats: stats
        });
      } else {
        // User analytics
        const [ordersRes, subscriptionsRes, walletRes] = await Promise.all([
          fetch(`${API_URL}/orders/my-orders`, { headers }),
          fetch(`${API_URL}/subscriptions/my-subscriptions`, { headers }),
          fetch(`${API_URL}/users/profile`, { headers })
        ]);

        const [ordersData, subscriptionsData, profileData] = await Promise.all([
          ordersRes.json(),
          subscriptionsRes.json(),
          walletRes.json()
        ]);

        const orders = ordersData.orders || [];
        const subscriptions = subscriptionsData.subscriptions || [];
        
        // Calculate user analytics
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
        const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing').length;
        const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length;
        const walletBalance = profileData.user?.walletBalance || 0;

        // Monthly spending
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySpent = orders
          .filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        // Last month spending
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonthSpent = orders
          .filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
          })
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        const spendingTrend = lastMonthSpent > 0 
          ? ((monthlySpent - lastMonthSpent) / lastMonthSpent * 100).toFixed(1)
          : 0;

        // Average order value
        const avgOrderValue = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(0) : 0;

        // Recent orders
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrders = orders.filter((o: any) => new Date(o.createdAt) >= sevenDaysAgo).length;

        setAnalytics({
          isAdmin: false,
          totalOrders,
          totalSpent,
          deliveredOrders,
          pendingOrders,
          activeSubscriptions,
          walletBalance,
          monthlySpent,
          spendingTrend,
          avgOrderValue,
          recentOrders,
          orders: orders.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-v-screen bg-[#030712] text-slate-200 selection:bg-orange-500/30 font-premium overflow-x-hidden pb-[10vh]">
        {/* Background Mesh Gradient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10vh] -left-[10vw] w-[40vw] h-[40vh] bg-orange-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20vh] -right-[15vw] w-[50vw] h-[50vh] bg-amber-600/10 rounded-full blur-[150px]" />
          <div className="absolute -bottom-[10vh] left-[20vw] w-[35vw] h-[35vh] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        {/* Header Section */}
        <div className="relative z-10 px-[5vw] pt-[4vh] pb-[6vh]">
          <div className="flex items-center justify-between mb-[4vh]">
            <div className="animate-fade-in">
              <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-white tracking-tighter leading-none mb-[1vh]">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Intelligence</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-[clamp(0.7rem,1.2vw,0.9rem)] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Business Overview</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="w-[12vw] h-[12vw] max-w-[60px] max-h-[60px] rounded-2xl glass-card flex items-center justify-center group hover:bg-red-500/20 transition-colors duration-500"
            >
              <LogOut className="w-[5vw] h-[5vw] max-w-[24px] max-h-[24px] text-slate-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[3vw] mb-[6vh]">
            {[
              { label: 'Total Orders', value: analytics?.totalOrders, icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
              { label: 'Net Revenue', value: `₹${analytics?.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
              { label: 'Active Users', value: analytics?.activeUsers, icon: Users, color: 'from-orange-500 to-amber-600' },
              { label: 'Growth', value: `${analytics?.revenueTrend}%`, icon: Zap, color: 'from-purple-500 to-pink-600' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="glass-card rounded-[2.5vw] p-[4vw] lg:p-[2vw] animate-fade-in" 
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-[10vw] h-[10vw] lg:w-[3vw] lg:h-[3vw] max-w-[48px] max-h-[48px] rounded-[1.5vw] lg:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-[2vh] shadow-lg`}>
                  <stat.icon className="w-[5vw] lg:w-[1.5vw] text-white" />
                </div>
                <p className="text-[2.5vw] lg:text-[0.7vw] font-black text-slate-500 uppercase tracking-widest mb-[0.5vh]">{stat.label}</p>
                <p className="text-[5vw] lg:text-[1.8vw] font-black text-white tracking-tight">{stat.value || 0}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-[4vw] z-10 relative">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-[4vh]">
              {/* Monthly Revenue Card */}
              <div className="glass-panel rounded-[4vw] lg:rounded-[2vw] p-[6vw] lg:p-[3vw] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[30vw] h-[30vh] bg-orange-500/5 rounded-full blur-[80px] -mr-[10vw] -mt-[10vh]" />
                <div className="flex items-center justify-between mb-[3vh]">
                  <div>
                    <h3 className="text-[4vw] lg:text-[1.4vw] font-black text-white">Performance Velocity</h3>
                    <p className="text-[2.5vw] lg:text-[0.8vw] text-slate-400 font-bold">Revenue streams for current cycle</p>
                  </div>
                  <div className={`flex items-center gap-1 px-[3vw] py-[1vh] lg:px-[1vw] lg:py-[0.5vh] rounded-full border ${
                    Number(analytics?.revenueTrend) >= 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {Number(analytics?.revenueTrend) >= 0 ? <ArrowUp className="w-[3vw] lg:w-[1vw]" /> : <ArrowDown className="w-[3vw] lg:w-[1vw]" />}
                    <span className="text-[2.5vw] lg:text-[0.8vw] font-black">{Math.abs(Number(analytics?.revenueTrend))}%</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-[2vw]">
                  <p className="text-[10vw] lg:text-[4vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                    ₹{analytics?.monthlyRevenue?.toLocaleString() || 0}
                  </p>
                  <p className="text-[3vw] lg:text-[1vw] text-slate-500 font-bold uppercase tracking-tighter">Gross Month-to-date</p>
                </div>
                
                {/* Visual "Graph" placeholder using bars */}
                <div className="mt-[4vh] flex items-end gap-[1vw] lg:gap-[0.5vw] h-[10vh]">
                  {[40, 60, 45, 90, 65, 80, 50, 70, 85, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-orange-500/10 to-orange-500/50 rounded-t-lg"
                      style={{ height: `${h}%`, transition: 'all 1s ease-out' }}
                    />
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-2 gap-[3vw]">
                {[
                  { label: 'Processed', value: analytics?.deliveredOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'High Priority', value: analytics?.pendingOrders, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((item, i) => (
                  <div key={i} className="glass-card rounded-[3vw] lg:rounded-[1.5vw] p-[5vw] lg:p-[2vw] flex items-center gap-[4vw] lg:gap-[1.5vw]">
                    <div className={`w-[12vw] h-[12vw] lg:w-[3.5vw] lg:h-[3.5vw] rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <item.icon className={`w-[6vw] lg:w-[1.8vw] ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-[6vw] lg:text-[2vw] font-black text-white leading-none">{item.value || 0}</p>
                      <p className="text-[2.2vw] lg:text-[0.7vw] font-bold text-slate-500 uppercase mt-[0.5vh]">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Column */}
            <div className="lg:col-span-1">
              <div className="glass-panel rounded-[4vw] lg:rounded-[2vw] h-full flex flex-col relative overflow-hidden">
                <div className="p-[6vw] lg:p-[2vw] border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-[4vw] lg:text-[1.2vw] font-black text-white tracking-tight">Recent Activity</h3>
                  <div className="w-[2vw] h-[2vw] rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                
                <div className="flex-1 overflow-y-auto p-[4vw] lg:p-[1.5vw] space-y-[2vh] scrollbar-hide max-h-[60vh] lg:max-h-none">
                  {analytics?.orders && analytics.orders.length > 0 ? (
                    analytics.orders.map((order: any, i: number) => (
                      <div 
                        key={order._id} 
                        className="p-[4vw] lg:p-[1.2vw] rounded-[3vw] lg:rounded-2xl bg-white/[0.03] border border-white/[0.02] hover:bg-white/[0.06] transition-all hover:translate-x-1"
                        style={{ animation: `fadeIn 0.5s ease-out forwards ${i * 0.1}s`, opacity: 0 }}
                      >
                        <div className="flex items-center justify-between mb-[1vh]">
                          <p className="text-[3.5vw] lg:text-[0.9vw] font-bold text-white">
                            #{order._id?.slice(-6).toUpperCase()}
                          </p>
                          <span className={`text-[2vw] lg:text-[0.6vw] font-black px-[2vw] py-[0.4vh] lg:px-[0.6vw] rounded-full uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                            order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[2.5vw] lg:text-[0.7vw] text-slate-500 font-bold">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-[3.5vw] lg:text-[1vw] font-black text-orange-400">₹{order.totalAmount}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-[10vh] opacity-30">
                      <ShoppingBag className="w-[10vw] h-[10vw] mb-[2vh]" />
                      <p className="text-[3vw] lg:text-[0.9vw] font-bold">No Recent Artifacts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-v-screen bg-[#fcfcfc] text-slate-900 font-premium selection:bg-orange-100 overflow-x-hidden pb-[12vh]">
      {/* Dynamic Header Section */}
      <div className="relative h-[40vh] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 px-[6vw] pt-[6vh] rounded-b-[4rem] shadow-2xl shadow-orange-200/50 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-5vh] right-[-5vw] w-[40vw] h-[40vw] bg-white/10 rounded-full blur-[60px] animate-pulse" />
        <div className="absolute bottom-[-10vh] left-[-10vw] w-[60vw] h-[60vw] bg-black/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="animate-fade-in">
            <h1 className="text-[8vw] lg:text-[3vw] font-black text-white tracking-tighter leading-tight">
              My <span className="opacity-80">Insights</span>
            </h1>
            <p className="text-[3.5vw] lg:text-[1vw] font-bold text-orange-100/80 uppercase tracking-[0.2em] mt-[0.5vh]">Order Intelligence</p>
          </div>
          <div className="w-[14vw] h-[14vw] max-w-[64px] max-h-[64px] rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-inner">
            <Activity className="w-[7vw] lg:w-[2vw] text-white" />
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] grid grid-cols-2 gap-[4vw]">
          <div className="bg-white/10 backdrop-blur-md rounded-[4vw] p-[4vw] border border-white/20 shadow-lg">
            <p className="text-orange-100/70 text-[2.5vw] lg:text-[0.7vw] font-black uppercase tracking-widest mb-[0.5vh]">Total Orders</p>
            <p className="text-[7vw] lg:text-[2.5vw] font-black text-white">{analytics?.totalOrders || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-[4vw] p-[4vw] border border-white/20 shadow-lg">
            <p className="text-orange-100/70 text-[2.5vw] lg:text-[0.7vw] font-black uppercase tracking-widest mb-[0.5vh]">Total Spent</p>
            <p className="text-[7vw] lg:text-[2.5vw] font-black text-white">₹{analytics?.totalSpent?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="px-[6vw] -mt-[4vh] space-y-[4vh] relative z-20">
        {/* Spending Analysis Card */}
        <div className="bg-white rounded-[5vw] p-[6vw] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[20vw] h-[20vw] bg-orange-50 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center justify-between mb-[3vh]">
            <div>
              <h3 className="text-[4.5vw] lg:text-[1.2vw] font-black text-slate-900 tracking-tight">Spending Velocity</h3>
              <p className="text-[3vw] lg:text-[0.8vw] text-slate-400 font-bold uppercase tracking-wider">Current billing cycle</p>
            </div>
            <div className={`flex items-center gap-1 px-[3vw] py-[1vh] rounded-full ${
              Number(analytics?.spendingTrend) >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {Number(analytics?.spendingTrend) >= 0 ? <ArrowUp className="w-[3vw]" /> : <ArrowDown className="w-[3vw]" />}
              <span className="text-[3vw] lg:text-[0.8vw] font-black">{Math.abs(Number(analytics?.spendingTrend))}%</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-[2vw]">
            <p className="text-[10vw] lg:text-[3.5vw] font-black text-orange-600 tracking-tighter">₹{analytics?.monthlySpent?.toLocaleString() || 0}</p>
            <p className="text-[3vw] lg:text-[0.8vw] text-slate-400 font-bold uppercase">this month</p>
          </div>
        </div>

        {/* Interactive Matrix Grid */}
        <div className="grid grid-cols-2 gap-[4vw]">
          {[
            { label: 'Fulfilled', value: analytics?.deliveredOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Transit', value: analytics?.pendingOrders, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Plans', value: analytics?.activeSubscriptions, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Avg Ticket', value: `₹${analytics?.avgOrderValue}`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[4vw] p-[5vw] shadow-lg shadow-slate-100 border border-slate-50 hover:border-orange-200 transition-colors">
              <div className={`w-[12vw] h-[12vw] max-w-[48px] max-h-[48px] rounded-2xl ${stat.bg} flex items-center justify-center mb-[2vh]`}>
                <stat.icon className={`w-[6vw] lg:w-[1.5vw] ${stat.color}`} />
              </div>
              <p className="text-[6vw] lg:text-[1.8vw] font-black text-slate-900 leading-none">{stat.value || 0}</p>
              <p className="text-[2.8vw] lg:text-[0.7vw] font-bold text-slate-400 uppercase tracking-widest mt-[1vh]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Wealth Management (Wallet) */}
        <div className="bg-slate-900 rounded-[6vw] p-[6vw] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-orange-500/10 rounded-full blur-[60px] group-hover:bg-orange-500/20 transition-colors duration-700" />
          <div className="flex items-center justify-between pointer-events-none">
            <div>
              <p className="text-slate-400 text-[2.8vw] lg:text-[0.7vw] font-bold uppercase tracking-[0.2em] mb-[1vh]">Available Liquidity</p>
              <p className="text-[10vw] lg:text-[3vw] font-black tracking-tighter">₹{analytics?.walletBalance?.toLocaleString() || 0}</p>
            </div>
            <div className="w-[16vw] h-[16vw] max-w-[64px] max-h-[64px] rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10">
              <Wallet className="w-[8vw] lg:w-[2vw] text-orange-400" />
            </div>
          </div>
          <button 
            onClick={() => router.push('/profile')}
            className="w-full mt-[4vh] py-[4vw] lg:py-[1.5vw] bg-white text-slate-900 rounded-[3vw] text-[3.5vw] lg:text-[1vw] font-black uppercase tracking-[0.1em] hover:bg-orange-50 transition-colors shadow-lg active:scale-95"
          >
            Refill Balance
          </button>
        </div>

        {/* Recent Ledger (Activity) */}
        <div className="bg-white rounded-[5vw] p-[6vw] shadow-xl border border-slate-100 pb-[10vh]">
          <div className="flex items-center justify-between mb-[4vh]">
            <h3 className="text-[5vw] lg:text-[1.2vw] font-black text-slate-900 tracking-tight">Timeline</h3>
            <span className="text-[2.5vw] lg:text-[0.7vw] font-black text-orange-600 bg-orange-50 px-[3vw] py-[0.8vh] rounded-full uppercase tracking-wider">
              {analytics?.recentOrders || 0} Events
            </span>
          </div>
          
          <div className="space-y-[3vh]">
            {analytics?.orders && analytics.orders.length > 0 ? (
              analytics.orders.map((order: any, i: number) => (
                <div 
                  key={order._id} 
                  className="flex items-center justify-between p-[4vw] bg-slate-50 rounded-[4vw] border border-slate-100 group hover:border-orange-100 hover:bg-white transition-all"
                  style={{ animation: `fadeIn 0.5s ease-out forwards ${i * 0.1}s`, opacity: 0 }}
                >
                  <div className="flex-1">
                    <p className="text-[3.8vw] lg:text-[1vw] font-black text-slate-900 group-hover:text-orange-600 transition-colors truncate pr-[2vw]">
                      {order.items?.[0]?.menuItem?.name || 'Artifact'}
                      {order.items?.length > 1 && <span className="text-slate-400 font-bold ml-1">+{order.items.length - 1}</span>}
                    </p>
                    <p className="text-[3vw] lg:text-[0.8vw] text-slate-400 font-bold uppercase mt-[0.5vh]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[4vw] lg:text-[1.1vw] font-black text-slate-900">₹{order.totalAmount}</p>
                    <span className={`text-[2.2vw] lg:text-[0.6vw] font-black px-[2vw] py-[0.4vh] rounded-full uppercase tracking-widest ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-[8vh] grayscale opacity-20">
                <ShoppingBag className="w-[12vw] h-[12vw] mx-auto mb-[2vh]" />
                <p className="text-[3.5vw] lg:text-[1vw] font-bold">No Recent Activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
