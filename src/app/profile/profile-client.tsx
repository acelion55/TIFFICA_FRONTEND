'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ProfileSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="h-8 w-48 bg-gray-300 rounded mb-4" />
    <div className="space-y-5 mt-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ProfileClient() {
  const { user: ctxUser, token, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          setInitial(data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: userData.name, phone: userData.phone }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setInitial(data);
        updateUser(data);
        setIsEditing(false);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) return <ProfileSkeleton />;

  const u = userData || ctxUser;
  if (!u) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">Please log in to view your profile.</p>
      <button onClick={() => router.push('/login')} className="text-orange-500 font-semibold">Go to Login</button>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage your information</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition text-sm font-semibold">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-white text-xl font-extrabold">{u.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <p className="font-bold text-gray-900">{u.name}</p>
          <p className="text-sm text-gray-500">{u.email}</p>
          {u.walletBalance !== undefined && (
            <p className="text-xs font-bold text-green-600 mt-0.5">💰 ₹{u.walletBalance?.toFixed(2)} wallet</p>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {[
          { icon: User, label: 'Name', key: 'name', type: 'text', editable: true },
          { icon: Mail, label: 'Email', key: 'email', type: 'email', editable: false },
          { icon: Phone, label: 'Phone', key: 'phone', type: 'tel', editable: true },
        ].map(({ icon: Icon, label, key, type, editable }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                value={u[key] || ''}
                onChange={e => editable && setUserData((prev: any) => ({ ...prev, [key]: e.target.value }))}
                disabled={!isEditing || !editable}
                className={`block w-full mt-0.5 text-sm text-gray-900 bg-transparent focus:outline-none border-b ${isEditing && editable ? 'border-orange-400 text-orange-700' : 'border-transparent'}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Addresses */}
      {u.addresses?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Saved Addresses</h3>
          <div className="space-y-2">
            {u.addresses.map((addr: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 border border-gray-100">
                <span className="font-semibold capitalize text-gray-800">{addr.type}: </span>
                {addr.fullAddress || addr.address}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save / Cancel */}
      {isEditing && (
        <div className="flex gap-3 mt-8">
          <button onClick={() => { setUserData(initial); setIsEditing(false); }}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
