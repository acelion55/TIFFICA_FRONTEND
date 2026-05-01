'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, ShoppingBag, Clock, Truck, CheckCircle, Package } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';

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
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      try {
        // Fetch regular orders
        const ordersRes = await fetch(`${API_URL}/orders/my-orders`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const ordersData = await ordersRes.json();
        console.log('📦 My orders response:', ordersData);
        setOrders(ordersData.orders || []);

        // Fetch scheduled meals
        console.log('🔍 Fetching schedule history...');
        const schedulesRes = await fetch(`${API_URL}/schedule/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📅 Schedule response status:', schedulesRes.status);
        
        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json();
          console.log('📅 Scheduled meals response:', schedulesData);
          console.log('📅 Number of schedules:', schedulesData.schedules?.length || 0);
          setSchedules(schedulesData.schedules || []);
        } else {
          const errorText = await schedulesRes.text();
          console.error('❌ Schedule fetch failed:', errorText);
        }
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
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900">Reorder</h1>
        <p className="text-sm text-gray-400 mt-1">Quickly reorder from past deliveries</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
        ))}

        {!loading && orders.length === 0 && schedules.length === 0 && (
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

        {!loading && (orders.length > 0 || schedules.length > 0) && (
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">
              {schedules.length} Scheduled Meal{schedules.length !== 1 ? 's' : ''} · {orders.length} Delivered Order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Scheduled Meals */}
        {!loading && schedules.map(schedule => (
          <div key={`schedule-${schedule._id}`} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {schedule.meals?.length} meal(s) scheduled
                  </p>
                  <p className="text-xs text-gray-400">
                    📅 {fmt(schedule.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-gray-900">
                    ₹{schedule.meals?.reduce((sum: number, m: any) => sum + (m.mealPrice || m.menuItem?.price || 0), 0)}
                  </p>
                </div>
              </div>

              {/* Meals List */}
              <div className="space-y-3 mb-4">
                {schedule.meals?.map((meal: any, i: number) => {
                  const deliveryStatus = getDeliveryStatus(schedule.date, meal.deliveryTime || '08:00');
                  const StatusIcon = deliveryStatus.icon;
                  
                  return (
                    <div key={i} className="border border-gray-100 rounded-2xl p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={meal.menuItem?.image || FALLBACK}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {meal.menuItem?.name || 'Item'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {meal.mealType} · {meal.deliveryTime || '08:00'}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            ₹{meal.mealPrice || meal.menuItem?.price || 0}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={`w-3.5 h-3.5 text-${deliveryStatus.color}-500`} />
                            <span className={`text-xs font-bold text-${deliveryStatus.color}-600`}>
                              {deliveryStatus.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{deliveryStatus.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r transition-all duration-500 ${
                              deliveryStatus.color === 'green' ? 'from-green-400 to-green-500' :
                              deliveryStatus.color === 'blue' ? 'from-blue-400 to-blue-500' :
                              deliveryStatus.color === 'orange' ? 'from-orange-400 to-orange-500' :
                              'from-gray-300 to-gray-400'
                            }`}
                            style={{ width: `${deliveryStatus.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reorder Button */}
              <button
                onClick={() => router.push('/home')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reorder
              </button>
            </div>
          </div>
        ))}

        {/* Regular Delivered Orders */}
        {!loading && orders.map(order => (
          <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {order.items?.length} item(s)
                  </p>
                  <p className="text-xs text-gray-400">
                    {fmt(order.createdAt)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'delivered' ? '✅ Delivered' :
                     order.status === 'pending' ? '🕒 Pending' :
                     order.status === 'preparing' ? '🍳 Preparing' :
                     order.status}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-gray-900">₹{order.totalAmount}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 mb-4">
                {order.items?.map((orderItem: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2">
                    <img
                      src={orderItem.menuItem?.image || FALLBACK}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {orderItem.menuItem?.name || 'Item'}
                      </p>
                      <p className="text-xs text-gray-400">
                        ×{orderItem.quantity} · ₹{orderItem.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reorder Button */}
              <button
                onClick={() => router.push('/home')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reorder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
