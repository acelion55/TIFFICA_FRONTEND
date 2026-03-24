'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';

export default function ReorderClient() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOrders((d.orders || []).filter((o: any) => o.status === 'delivered')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900">Reorder</h1>
        <p className="text-sm text-gray-400 mt-1">Quickly reorder from past deliveries</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
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

        {!loading && orders.map(order => {
          const isOpen = expanded === order._id;
          return (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : order._id)}
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{order.items?.length} item(s)</p>
                  <p className="text-xs text-gray-400">{fmt(order.createdAt)}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Delivered</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-gray-900">₹{order.totalAmount}</p>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto mt-1" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <img
                          src={item.menuItem?.image || FALLBACK}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.menuItem?.name || 'Item'}</p>
                          <p className="text-xs text-gray-400">×{item.quantity} · ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push('/home')}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow"
                  >
                    <RefreshCw className="w-4 h-4" /> Reorder
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
