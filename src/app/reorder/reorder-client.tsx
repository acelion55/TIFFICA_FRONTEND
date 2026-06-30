'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, ShoppingBag, Clock, Truck, CheckCircle, Package, Calendar } from 'lucide-react';

const OrderTrackingMap = dynamic(() => import('./OrderTrackingMap'), { ssr: false });

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
  const [activeOrder, setActiveOrder] = useState<any>(null);

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
        
        // Set first in-progress order as active for tracking map
        // Only show map when there's an active (non-completed) order
        const active = combinedOrders.find(
          (o: any) => o.status !== 'delivered' && o.status !== 'cancelled'
        );
        setActiveOrder(active || null);
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
      <div className="bg-white px-5 pt-10 pb-5 border-b border-gray-100">
        </div>

      {/* Order Tracking Section with Map */}
      {!loading && activeOrder && (
        <div className="w-full">
          <div className="bg-white overflow-hidden shadow-sm border-t-4 border-t-orange-500">
            {/* Map Container - 50vh height */}
            <div className="relative h-[50vh] bg-gray-200 overflow-hidden">
              {(() => {
                // Extract customer location from delivery address (GeoJSON: [lng, lat])
                const addrCoords = activeOrder.deliveryAddress?.location?.coordinates;
                const customerLoc: [number, number] = addrCoords?.length === 2
                  ? [addrCoords[1], addrCoords[0]]
                  : [28.6139, 77.2090];

                // Extract kitchen location from first item's cloudKitchen (GeoJSON: [lng, lat])
                const kitchenCoords = activeOrder.items?.[0]?.menuItem?.cloudKitchen?.location?.coordinates;
                const kitchenLoc: [number, number] = kitchenCoords?.length === 2
                  ? [kitchenCoords[1], kitchenCoords[0]]
                  : customerLoc;

                return (
                  <OrderTrackingMap 
                    customerLocation={customerLoc}
                    kitchenLocation={kitchenLoc}
                    destinationLocation={customerLoc}
                  />
                );
              })()}

              {/* Order Details Overlay - bottom of map */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-20 z-[9999] pointer-events-none">
                {/* Item Preview */}
                {(() => {
                  const firstItem = activeOrder.items?.[0];
                  const itemImage = firstItem?.menuItem?.image || firstItem?.image || FALLBACK;
                  const itemName = firstItem?.menuItem?.name || firstItem?.name || 'Item';
                  const itemDesc = firstItem?.menuItem?.description || firstItem?.description || '';
                  const kitchenName = firstItem?.menuItem?.cloudKitchen?.name || firstItem?.cloudKitchen?.name || '';
                  return (
                    <div className="flex items-center gap-3 mb-3">
                      <img src={itemImage} className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{itemName}</p>
                        {itemDesc && <p className="text-[10px] text-white/60 truncate">{itemDesc}</p>}
                        {kitchenName && (
                          <p className="text-[9px] text-orange-300 font-bold uppercase mt-0.5">{kitchenName}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-white">₹{activeOrder.type === 'schedule' 
                          ? activeOrder.meals?.reduce((sum: number, m: any) => sum + (m.mealPrice || m.menuItem?.price || 0), 0)
                          : (activeOrder.finalAmount || activeOrder.totalAmount)
                        }</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Delivery Status */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    activeOrder.status === 'delivered' ? 'bg-green-500/30 text-green-300' :
                    activeOrder.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                    activeOrder.status === 'confirmed' ? 'bg-blue-500/30 text-blue-300' :
                    'bg-purple-500/30 text-purple-300'
                  }`}>
                    {activeOrder.status || 'Pending'}
                  </span>
                  <span className="text-[9px] text-white/50">{fmt(activeOrder.type === 'schedule' ? activeOrder.date : activeOrder.createdAt)}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${getDeliveryStatus(activeOrder.type === 'schedule' ? activeOrder.date : new Date().toISOString(), activeOrder.type === 'schedule' ? '12:00' : '12:00').progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${!loading && activeOrder ? 'px-4 pt-0' : 'px-4 py-4'} space-y-4`}>
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

        {/* Other Orders Section - filtered to exclude the active order shown on map */}
        {!loading && (activeOrder ? orders.filter(o => o._id !== activeOrder._id) : orders).length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest px-1 mb-3">Other Orders</p>
          </div>
        )}

        {/* Unified History List (excludes active order shown on map) */}
        {!loading && orders.filter(o => o._id !== activeOrder?._id).map(item => {
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
                  <div className="space-y-2 mb-4">
                    {order.items?.map((orderItem: any, i: number) => (
                      <div key={`${order._id}-item-${i}`} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2 bg-gray-50/30">
                        <img src={orderItem.menuItem?.image || FALLBACK} className="w-15 h-15 rounded-lg object-cover" alt="" />
                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-semibold text-gray-800 truncate">{orderItem.cloudKitchen?.name || orderItem.menuItem?.cloudKitchen?.name || orderItem.kitchenName || 'Kitchen'}</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{orderItem.menuItem?.name || 'Item'}</p>
                          <p className="text-[1.3vh] font-semibold text-gray-500 ">{orderItem.menuItem?.description || 'Item'}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">×{orderItem.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">₹{order.finalAmount || order.totalAmount}</p>
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
