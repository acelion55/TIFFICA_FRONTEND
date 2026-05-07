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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24 text-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-200 to-amber-200 text-black px-6 pt-8 pb-12 rounded-b-[3rem] shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-black text-sm font-bold mt-1">Complete Business Overview</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
              <p className="text-3xl font-black">{analytics?.totalOrders || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-3xl font-black">₹{analytics?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
              <p className="text-3xl font-black">{analytics?.totalUsers || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Active Users</p>
              <p className="text-3xl font-black">{analytics?.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 -mt-8 space-y-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">This Month Revenue</h3>
                <p className="text-xs text-black font-bold">Your revenue overview</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                Number(analytics?.revenueTrend) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {Number(analytics?.revenueTrend) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-xs font-black">{Math.abs(Number(analytics?.revenueTrend))}%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-orange-600">₹{analytics?.monthlyRevenue?.toLocaleString() || 0}</p>
              <p className="text-sm text-black font-bold">revenue this month</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics?.deliveredOrders || 0}</p>
              <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Delivered</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics?.pendingOrders || 0}</p>
              <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Pending</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">₹{analytics?.avgOrderValue || 0}</p>
              <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Avg Order</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics?.recentOrders || 0}</p>
              <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Last 7 Days</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Recent Orders</h3>
              <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-3 py-1 rounded-full">
                {analytics?.orders?.length || 0} orders
              </span>
            </div>
            
            {analytics?.orders && analytics.orders.length > 0 ? (
              <div className="space-y-3">
                {analytics.orders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        Order #{order._id?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-black font-medium mt-0.5">
                        {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-orange-400">₹{order.totalAmount}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                        order.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-black text-sm font-medium">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-200 to-amber-200 text-black px-6 pt-8 pb-12 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Your Analytics</h1>
            <p className="text-black text-sm font-bold mt-1">Track your food journey</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-black">{analytics?.totalOrders || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-3xl font-black">₹{analytics?.totalSpent?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-8 space-y-6">
        {/* Spending Trend */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">This Month</h3>
              <p className="text-xs text-black font-bold">Your spending overview</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
              Number(analytics?.spendingTrend) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {Number(analytics?.spendingTrend) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-xs font-black">{Math.abs(Number(analytics?.spendingTrend))}%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-orange-600">₹{analytics?.monthlySpent?.toLocaleString() || 0}</p>
            <p className="text-sm text-black font-bold">spent this month</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{analytics?.deliveredOrders || 0}</p>
            <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Delivered</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{analytics?.pendingOrders || 0}</p>
            <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Pending</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{analytics?.activeSubscriptions || 0}</p>
            <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Active Plans</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{analytics?.avgOrderValue || 0}</p>
            <p className="text-xs text-black font-bold uppercase tracking-wider mt-1">Avg Order</p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-3xl p-6 shadow-xl text-black border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-black text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p>
              <p className="text-4xl font-black">₹{analytics?.walletBalance?.toLocaleString() || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Wallet className="w-7 h-7" />
            </div>
          </div>
          <button 
            onClick={() => router.push('/profile')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-black uppercase tracking-wider transition border border-white/20"
          >
            Add Money
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
              Last 7 days: {analytics?.recentOrders || 0} orders
            </span>
          </div>
          
          {analytics?.orders && analytics.orders.length > 0 ? (
            <div className="space-y-3">
              {analytics.orders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {order.items?.[0]?.menuItem?.name || 'Order'} 
                      {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-black font-medium mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-orange-600">₹{order.totalAmount}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-black text-sm font-medium">No recent orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
