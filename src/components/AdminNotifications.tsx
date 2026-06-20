'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, X, Volume2, VolumeX, UtensilsCrossed, CreditCard, Calendar, Circle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const API_URL = 'https://tifficaapp-1.onrender.com/api';

interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'subscription' | 'schedule' | 'info';
  playSound: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  isRead?: boolean;
}

export default function AdminNotifications() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin || !token) return;

    // Load sound preference
    const savedSoundPref = localStorage.getItem('adminSoundEnabled');
    if (savedSoundPref !== null) {
      setSoundEnabled(JSON.parse(savedSoundPref));
    }

    // Subscribe to push notifications
    subscribeToNotifications();

    // Setup WebSocket for real-time notifications
    setupWebSocket();

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAdmin, token]);

  const setupWebSocket = () => {
    if (!token) return;

    try {
      const wsHost = API_URL.replace('http', 'ws').replace('/api', '');
      wsRef.current = new WebSocket(`${wsHost}/admin-notifications`);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        // Send authentication
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle auth responses
          if (data.type === 'auth_success') {
            console.log('✅ Admin authenticated on WebSocket');
            setIsSubscribed(true);
            return;
          }
          
          if (data.type === 'auth_error') {
            console.error('❌ WebSocket auth failed:', data.message);
            return;
          }
          
          // Handle notifications
          if (data.type === 'notification') {
            handleNewNotification(data);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn('WebSocket connection error - notifications may be delayed', error);
        setIsSubscribed(false);
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsSubscribed(false);
        // Reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
      };
    } catch (error) {
      console.warn('Failed to setup WebSocket:', error);
      // Fallback to polling
      setTimeout(setupWebSocket, 5000);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      // Service workers are not available in Capacitor apps
      // Notifications will work through WebSocket polling instead
      console.log('Using WebSocket for notifications (service workers not supported in Capacitor)');
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        // Count unread notifications
        const unread = data.notifications?.filter((n: AdminNotification) => !n.isRead).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNewNotification = (notification: AdminNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Play sound if enabled
    if (soundEnabled && notification.playSound && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    // Show browser notification (browser only)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: `admin-${notification.type}`,
        requireInteraction: notification.priority === 'high'
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('adminSoundEnabled', JSON.stringify(newSoundEnabled));
  };

  const testNotification = async () => {
    try {
      await fetch(`${API_URL}/notifications/admin/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  if (!isAdmin) return null;

  const getNotificationIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'order': return UtensilsCrossed;
      case 'subscription': return CreditCard;
      case 'schedule': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return 'border-orange-200 bg-orange-50';
      case 'subscription': return 'border-purple-200 bg-purple-50';
      case 'schedule': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <>
      {/* Audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          title="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[10px] text-white font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute top-full right-0 mt-2 w-96 max-h-[80vh] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-amber-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white">Admin Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-white" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Circle className={`w-2.5 h-2.5 fill-current ${isSubscribed ? 'text-green-500' : 'text-red-500'}`} />
                  {isSubscribed ? 'Connected' : 'Disconnected'}
                </span>
              </span>
              <button
                onClick={testNotification}
                className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold hover:bg-orange-600 transition"
              >
                Test
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      {(() => {
                        const Icon = getNotificationIcon(notification.type);
                        return <Icon className="w-5 h-5 text-orange-600" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 shrink-0 ml-2">
                          {new Date(notification.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-line">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.priority}
                        </span>
                        {notification.playSound && (
                          <Volume2 className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}