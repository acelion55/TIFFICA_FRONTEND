'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/context/DeliveryAuthContext';
import { 
  Power, MapPin, Wallet, Star, Package, TrendingUp, 
  Navigation, Phone, Clock, CheckCircle, Loader2, Menu, X
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws/delivery';

export default function DeliveryDashboard() {
  const router = useRouter();
  const { partner, token, logout, toggleOnline, updatePartner } = useDeliveryAuth();
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!partner || !token) {
      router.push('/login');
      return;
    }

    fetchData();
    connectWebSocket();
    startLocationTracking();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [partner, token]);

  const connectWebSocket = () => {
    if (!token) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        ws.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_delivery') {
          setAvailableDeliveries(prev => [data.delivery, ...prev]);
          playNotificationSound();
        }
        
        if (data.type === 'delivery_assigned') {
          setActiveDelivery(data.delivery);
        }
      };

      ws.onerror = () => {
        // Silently handle WebSocket errors - connection will retry
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected - will retry in 5s');
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      // Silently handle connection errors - will retry
      setTimeout(connectWebSocket, 5000);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.log('ℹ️ Geolocation not supported by browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeDelivery) {
          wsRef.current.send(JSON.stringify({
            type: 'location_update',
            latitude,
            longitude,
            deliveryId: activeDelivery._id
          }));
        }
      },
      () => {
        // Silently handle location errors - user may have denied permission
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/delivery-auth/update-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude })
      });
      if (!res.ok) console.error('Location update failed:', res.status);
    } catch (err) {
      console.error('Location update error:', err);
    }
  };

  const fetchData = async () => {
    if (!token) return;
    
    try {
      const [deliveriesRes, earningsRes, activeRes] = await Promise.all([
        fetch(`${API_URL}/delivery/available`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/delivery/earnings/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/delivery/my-deliveries?status=assigned,accepted,reached_restaurant,picked_up,out_for_delivery`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('📦 Deliveries response status:', deliveriesRes.status);
      console.log('💰 Earnings response status:', earningsRes.status);
      console.log('🚚 Active response status:', activeRes.status);

      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        console.log('📦 Available deliveries data:', deliveriesData);
        if (deliveriesData.success) setAvailableDeliveries(deliveriesData.deliveries || []);
      }
      
      if (earningsRes.ok) {
        const earningsData = await earningsRes.json();
        console.log('💰 Earnings data:', earningsData);
        if (earningsData.success) setEarnings(earningsData.earnings);
      }
      
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        console.log('🚚 Active deliveries data:', activeData);
        if (activeData.success && activeData.deliveries.length > 0) {
          console.log('✅ Setting active delivery:', activeData.deliveries[0]);
          setActiveDelivery(activeData.deliveries[0]);
        } else {
          console.log('ℹ️ No active deliveries');
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/delivery/${deliveryId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setActiveDelivery(data.delivery);
        setAvailableDeliveries(prev => prev.filter(d => d._id !== deliveryId));
      }
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleRejectDelivery = async (deliveryId: string) => {
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/delivery/${deliveryId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAvailableDeliveries(prev => prev.filter(d => d._id !== deliveryId));
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!token || !activeDelivery) return;
    
    try {
      const res = await fetch(`${API_URL}/delivery/${activeDelivery._id}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      if (data.success) {
        setActiveDelivery(data.delivery);
        
        if (status === 'delivered') {
          setActiveDelivery(null);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  };

  const getStatusButton = () => {
    if (!activeDelivery) return null;
    
    const statusMap: Record<string, { next: string; label: string; color: string }> = {
      assigned: { next: 'accepted', label: 'Accept Delivery', color: 'green' },
      accepted: { next: 'reached_restaurant', label: 'Reached Restaurant', color: 'blue' },
      reached_restaurant: { next: 'picked_up', label: 'Picked Up', color: 'purple' },
      picked_up: { next: 'out_for_delivery', label: 'Out for Delivery', color: 'orange' },
      out_for_delivery: { next: 'delivered', label: 'Mark Delivered', color: 'green' }
    };
    
    const current = statusMap[activeDelivery.status];
    if (!current) return null;
    
    return (
      <button
        onClick={() => handleUpdateStatus(current.next)}
        className={`w-full py-4 bg-gradient-to-r from-${current.color}-500 to-${current.color}-600 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition`}
      >
        <CheckCircle className="w-5 h-5" />
        {current.label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🚴</span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-lg">{partner?.name}</h1>
              <p className="text-white/80 text-xs flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                {partner?.rating.toFixed(1)} · {partner?.totalDeliveries} deliveries
              </p>
            </div>
          </div>
          <button onClick={() => setShowMenu(true)} className="text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Online Toggle */}
        <button
          onClick={toggleOnline}
          className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${
            partner?.isOnline
              ? 'bg-white text-orange-500'
              : 'bg-white/20 text-white border-2 border-white/30'
          }`}
        >
          <Power className="w-5 h-5" />
          {partner?.isOnline ? 'You are Online' : 'Go Online'}
        </button>
      </div>

      {/* Earnings Card */}
      <div className="px-5 -mt-3">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Today's Earnings</p>
              <p className="text-2xl font-extrabold text-gray-900">₹{earnings?.today.amount || 0}</p>
              <p className="text-xs text-gray-400">{earnings?.today.deliveries || 0} deliveries</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Wallet</p>
              <p className="text-xl font-extrabold text-green-600">₹{partner?.walletBalance || 0}</p>
              <button className="text-xs text-orange-500 font-bold">Withdraw</button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="px-5 mt-4">
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Active Delivery</h2>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
                {activeDelivery.status?.replace('_', ' ').toUpperCase() || 'ASSIGNED'}
              </span>
              <span className="text-lg font-extrabold text-gray-900">₹{activeDelivery.estimatedEarning || 30}</span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="text-sm font-bold text-gray-900">{activeDelivery.pickupLocation?.restaurantName || 'Restaurant'}</p>
                  <p className="text-xs text-gray-600">{activeDelivery.pickupLocation?.address || 'Address not available'}</p>
                </div>
                <button className="text-green-600">
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Drop</p>
                  <p className="text-sm font-bold text-gray-900">{activeDelivery.dropLocation?.customerName || 'Customer'}</p>
                  <p className="text-xs text-gray-600">{activeDelivery.dropLocation?.address || 'Address not available'}</p>
                </div>
                <button className="text-green-600">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  const coords = activeDelivery.dropLocation?.coordinates;
                  if (coords && coords.length === 2) {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`);
                  } else {
                    alert('Location coordinates not available');
                  }
                }}
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
            </div>

            {getStatusButton()}
          </div>
        </div>
      )}

      {/* Available Deliveries */}
      {!activeDelivery && partner?.isOnline && (
        <div className="px-5 mt-4">
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Available Deliveries</h2>
          {availableDeliveries.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No deliveries available</p>
              <p className="text-xs text-gray-400 mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableDeliveries.map(delivery => (
                <div key={delivery._id} className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-600 rounded-full">
                      {delivery.distance} km
                    </span>
                    <span className="text-lg font-extrabold text-green-600">₹{delivery.estimatedEarning}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{delivery.pickupLocation.restaurantName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{delivery.dropLocation.address?.slice(0, 40)}...</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectDelivery(delivery._id)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAcceptDelivery(delivery._id)}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Sidebar */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold">Menu</h2>
              <button onClick={() => setShowMenu(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <button onClick={() => alert('Earnings page coming soon')} className="w-full py-3 bg-gray-100 rounded-xl font-bold text-left px-4">
                💰 Earnings
              </button>
              <button onClick={() => alert('History page coming soon')} className="w-full py-3 bg-gray-100 rounded-xl font-bold text-left px-4">
                📦 History
              </button>
              <button onClick={() => alert('Profile page coming soon')} className="w-full py-3 bg-gray-100 rounded-xl font-bold text-left px-4">
                👤 Profile
              </button>
              <button onClick={logout} className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold text-left px-4">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
