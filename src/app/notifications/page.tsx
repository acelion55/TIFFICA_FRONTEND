'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag, Bell, Package, Info, AlertCircle, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

const TYPE_ICON: Record<string, any> = {
  offer: Tag,
  order: Package,
  info: Info,
  alert: AlertCircle,
  coupon: Gift,
};

const TYPE_COLOR: Record<string, string> = {
  offer: 'bg-orange-500',
  order: 'bg-blue-500',
  info: 'bg-gray-500',
  alert: 'bg-red-500',
  coupon: 'bg-purple-500',
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">
      <div className="bg-white px-4 pt-14 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-orange-500 font-semibold">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const Icon = TYPE_ICON[n.type] || Bell;
              const colorClass = TYPE_COLOR[n.type] || 'bg-gray-500';
              
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`rounded-2xl p-4 border cursor-pointer transition active:scale-98 ${
                    n.isRead
                      ? 'bg-white border-gray-100'
                      : 'bg-orange-50 border-orange-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.isRead ? 'bg-gray-100' : colorClass
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          n.isRead ? 'text-gray-400' : 'text-white'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-extrabold text-gray-900">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{n.message}</p>
                      
                      {n.type === 'coupon' && n.couponId && (
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mt-2 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-purple-600 font-bold mb-0.5">
                                Coupon Code
                              </p>
                              <p className="text-sm font-black text-purple-700">
                                {n.couponId.code}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-purple-700">
                                {n.couponId.discountType === 'percentage'
                                  ? `${n.couponId.discountValue}% OFF`
                                  : `₹${n.couponId.discountValue} OFF`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
