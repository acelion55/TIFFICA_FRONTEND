'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Bell, Package, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TYPE_ICON: Record<string, any> = {
  offer: Tag,
  order: Package,
  info: Info,
  alert: AlertCircle,
};

export default function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchData();
    }
  }, [isOpen, token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [notifRes, couponRes] = await Promise.all([
        fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/coupons/user/popup`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const notifData = await notifRes.json();
      const couponData = await couponRes.json();
      
      if (notifData.success) setNotifications(notifData.notifications || []);
      if (couponData.success && couponData.coupon) setCoupons([couponData.coupon]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const allItems = [
    ...coupons.map(c => ({ type: 'coupon', data: c })),
    ...notifications.map(n => ({ type: 'notification', data: n }))
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-black text-gray-900">Notifications</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : allItems.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No notifications</p>
                </div>
              ) : (
                allItems.map((item, idx) => {
                  if (item.type === 'coupon') {
                    const c = item.data;
                    return (
                      <div key={`coupon-${idx}`} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Tag className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-purple-600 font-bold mb-1">🎉 New Coupon</p>
                            <p className="text-sm font-black text-gray-900 mb-1">
                              {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">{c.description}</p>
                            <div className="bg-white rounded-lg px-3 py-2 border border-purple-300">
                              <p className="text-xs text-gray-500 mb-0.5">Code</p>
                              <p className="text-sm font-black text-purple-600">{c.code}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    const n = item.data;
                    const Icon = TYPE_ICON[n.type] || Bell;
                    return (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markAsRead(n._id)}
                        className={`rounded-xl p-4 border cursor-pointer transition ${
                          n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            n.isRead ? 'bg-gray-100' : 'bg-blue-500'
                          }`}>
                            <Icon className={`w-5 h-5 ${n.isRead ? 'text-gray-400' : 'text-white'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 mb-1">{n.title}</p>
                            <p className="text-xs text-gray-600">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
