'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, ShoppingBag, Clock, Truck, CheckCircle, Package, Calendar, ChefHat } from 'lucide-react';

const API_URL = 'https://tifficaapp-1.onrender.com/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';

// Helper to format time to 12-hour format
const formatTime12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

// Helper to get delivery status
const getDeliveryStatus = (date: string, deliveryTime: string) => {
  const now = new Date();
  const [hours, minutes] = deliveryTime.split(':').map(Number);
  const deliveryDateTime = new Date(date);
  deliveryDateTime.setHours(hours, minutes, 0, 0);
  
  const hoursUntilDelivery = (deliveryDateTime.getTime() - now.getTime()) / 3600000;
  
  if (hoursUntilDelivery < -2) return { status: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green', progress: 100 };
  if (hoursUntilDelivery < 0) return { status: 'out-for-delivery', label: 'Out for Delivery', icon: Truck, color: 'blue', progress: 75 };
  if (hoursUntilDelivery < 3) return { status: 'in-progress', label: 'In Progress', icon: Package, color: 'orange', progress: 50 };
  return { status: 'pending', label: 'Pending', icon: Clock, color: 'gray', progress: 25 };
};

export default function ReorderClient() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      try {
        const [ordersRes, schedulesRes] = await Promise.all([
          fetch(`${API_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/schedule/history`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const ordersData = await ordersRes.json();
        const schedulesData = schedulesRes.ok ? await schedulesRes.json() : { schedules: [] };

        // Combine both into a single history list
        const combinedOrders = [
          ...(ordersData.orders || []).map((o: any) => ({ ...o, type: 'order', timestamp: new Date(o.createdAt).getTime() })),
          ...(schedulesData.schedules || []).map((s: any) => ({ ...s, type: 'schedule', timestamp: new Date(s.date).getTime() }))
        ];

        // Sort by timestamp desc (latest first)
        combinedOrders.sort((a, b) => b.timestamp - a.timestamp);
        setOrders(combinedOrders);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-24">
      <div className="bg-white px-5 pt-20 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900">Reorder</h1>
        <p className="text-sm text-gray-400 mt-1">Quickly reorder from past deliveries</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
        ))}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20">
            <RefreshCw className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No past orders</h3>
            <p className="text-sm text-gray-400 mt-1">Delivered orders will appear here</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow"
            >
              Order Now
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">
              {orders.length} Past Activity Found
            </p>
          </div>
        )}

        {/* Unified History List */}
        {!loading && orders.map(item => {
          if (item.type === 'schedule') {
            const schedule = item;
            return (
              <div key={`schedule-${schedule._id}`} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {schedule.meals?.length} meal(s) scheduled
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                         {fmt(schedule.date)}
                      </p>
                      <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">Scheduled Plan</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-gray-900">
                        ₹{schedule.meals?.reduce((sum: number, m: any) => sum + (m.mealPrice || m.menuItem?.price || 0), 0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {schedule.meals?.map((meal: any, i: number) => {
                      const deliveryStatus = getDeliveryStatus(schedule.date, meal.deliveryTime || '08:00');
                      const StatusIcon = deliveryStatus.icon;
                      return (
                        <div key={`${schedule._id}-meal-${i}`} className="border border-gray-100 rounded-2xl p-3 bg-gray-50/30">
                          <div className="flex items-center gap-3">
                            <img src={meal.menuItem?.image || FALLBACK} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{meal.menuItem?.name || 'Item'}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">{meal.mealType} · {formatTime12Hour(meal.deliveryTime || '08:00')}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <StatusIcon className="w-3 h-3" />
                                {deliveryStatus.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => router.push('/home')} className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition text-sm">
                    Re-Book Plan
                  </button>
                </div>
              </div>
            );
          } else {
            const order = item;
            return (
              <div key={`order-${order._id}`} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{order.items?.length} item(s) ordered</p>
                      <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 mt-1 uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-gray-900">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items?.map((orderItem: any, i: number) => (
                      <div key={`${order._id}-item-${i}`} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2 bg-gray-50/30">
                        <img src={orderItem.menuItem?.image || FALLBACK} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{orderItem.menuItem?.name || 'Item'}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">×{orderItem.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => router.push('/home')} className="w-full py-3 bg-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition text-sm">
                    Reorder Items
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
