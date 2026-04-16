'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Loader2, LogOut, ChevronRight, Home, Briefcase, Hotel, MoreHorizontal, Plus, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TYPE_ICONS: Record<string, any> = {
  Home, Work: Briefcase, Hotel, Other: MoreHorizontal,
};

export default function ProfileClient() {
  const { user: ctxUser, token, logout, updateUser } = useAuth();
  const { unreadCount } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData]   = useState<any>(null);
  const [initial, setInitial]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setUserData(d); setInitial(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: userData.name, phone: userData.phone }),
    });
    if (res.ok) {
      const d = await res.json();
      setUserData(d); setInitial(d); updateUser(d); setIsEditing(false);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-20 bg-gray-100 rounded-2xl" />
      {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-2xl" />)}
    </div>
  );

  const u = userData || ctxUser;
  if (!u) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">Please log in.</p>
      <button onClick={() => router.push('/login')} className="text-orange-500 font-semibold">Go to Login</button>
    </div>
  );

  return (
    <div className="p-5 space-y-5">

      {/* Avatar card */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-white text-xl font-extrabold">{u.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-900 truncate">{u.name}</p>
          <p className="text-sm text-gray-500 truncate">{u.email}</p>
          {u.walletBalance !== undefined && (
            <p className="text-xs font-bold text-green-600 mt-0.5">💰 ₹{u.walletBalance?.toFixed(0)} wallet</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl bg-white shadow-sm">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => { logout(); router.push('/login'); }}
            className="p-2 rounded-xl bg-red-50">
            <LogOut className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition active:scale-98"
        >
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 relative">
            <Bell className="w-4 h-4 text-orange-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs text-orange-500 font-bold">{unreadCount} unread</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        
        {[
          { icon: User,  label: 'Name',  key: 'name',  type: 'text',  editable: true },
          { icon: Mail,  label: 'Email', key: 'email', type: 'email', editable: false },
          { icon: Phone, label: 'Phone', key: 'phone', type: 'tel',   editable: true },
        ].map(({ icon: Icon, label, key, type, editable }, i, arr) => (
          <div key={key} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
              <input
                type={type}
                value={u[key] || ''}
                onChange={e => editable && setUserData((p: any) => ({ ...p, [key]: e.target.value }))}
                disabled={!isEditing || !editable}
                className={`w-full text-sm font-semibold text-gray-900 bg-transparent focus:outline-none mt-0.5 ${
                  isEditing && editable ? 'border-b border-orange-400 text-orange-700' : ''
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save / Cancel */}
      {isEditing && (
        <div className="flex gap-3">
          <button onClick={() => { setUserData(initial); setIsEditing(false); }}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {/* Addresses section */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="font-extrabold text-gray-900 text-sm">Saved Addresses</span>
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {u.addresses?.length || 0}
            </span>
          </div>
          <button onClick={() => router.push('/addresses')}
            className="flex items-center gap-1 text-orange-500 text-xs font-bold">
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {u.addresses?.length > 0 ? (
          <div>
            {u.addresses.slice(0, 3).map((addr: any, i: number) => {
              const Icon = TYPE_ICONS[addr.addressType] || MapPin;
              return (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i < Math.min(u.addresses.length, 3) - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-4 h-4 ${addr.isDefault ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-800">{addr.addressType}</p>
                      {addr.isDefault && <span className="text-[9px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full">DEFAULT</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {addr.fullAddress || [addr.houseNo, addr.area].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
            {u.addresses.length > 3 && (
              <button onClick={() => router.push('/addresses')}
                className="w-full text-center text-xs text-orange-500 font-bold py-3 border-t border-gray-50">
                View all {u.addresses.length} addresses →
              </button>
            )}
          </div>
        ) : (
          <button onClick={() => router.push('/addresses')}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm text-gray-400 font-medium">
            <Plus className="w-4 h-4" /> Add your first address
          </button>
        )}
      </div>
    </div>
  );
}


