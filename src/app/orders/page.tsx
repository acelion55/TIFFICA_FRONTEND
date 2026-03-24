'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_ICON: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Clock,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, router]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Track your meal deliveries</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading && (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1">Your order history will appear here</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow"
            >
              Browse Menu
            </button>
          </div>
        )}

        {!loading && orders.map(order => {
          const Icon = STATUS_ICON[order.status] || Clock;
          const isOpen = expanded === order._id;
          return (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : order._id)}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-3 h-3" />
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{order.items?.length} item(s)</p>
                  <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-orange-600">₹{order.totalAmount}</p>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto mt-1" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Payment</span><span className="font-semibold capitalize">{order.paymentMethod} · {order.paymentStatus}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee</span><span>₹{order.deliveryFee || 0}</span></div>
                  <div className="flex justify-between"><span>Final Amount</span><span className="font-bold text-gray-900">₹{order.finalAmount}</span></div>
                  {order.specialInstructions && (
                    <div className="flex justify-between"><span>Note</span><span className="text-right max-w-[60%]">{order.specialInstructions}</span></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
