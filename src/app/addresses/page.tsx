'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft, MapPin, Plus, Trash2, Star,
  Home, Briefcase, Hotel, MoreHorizontal, Loader2, Check
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

const ADDRESS_TYPES = ['Home', 'Work', 'Hotel', 'Other'];

const TYPE_ICONS: Record<string, any> = {
  Home: Home, Work: Briefcase, Hotel: Hotel, Other: MoreHorizontal,
};

interface Address {
  _id?: string;
  houseNo: string;
  landmark: string;
  area: string;
  fullAddress: string;
  addressType: string;
  isDefault: boolean;
  location?: { type: string; coordinates: number[] };
}

const EMPTY: Address = {
  houseNo: '', landmark: '', area: '',
  fullAddress: '', addressType: 'Home', isDefault: false,
};

export default function AddressesPage() {
  const { token, updateUser } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editIdx, setEditIdx]     = useState<number | null>(null);
  const [form, setForm]           = useState<Address>(EMPTY);
  const [detecting, setDetecting] = useState(false);
  const [error, setError]         = useState('');

  const fetchProfile = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setAddresses(d.addresses || []);
      updateUser(d);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, [token]);

  const saveAddresses = async (updated: Address[]) => {
    setSaving(true);
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ addresses: updated }),
    });
    if (res.ok) {
      const d = await res.json();
      setAddresses(d.addresses || updated);
      updateUser(d);
    }
    setSaving(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const d = await r.json();
          const parts = d.display_name?.split(',') || [];
          setForm(prev => ({
            ...prev,
            area: parts.slice(0, 3).join(',').trim(),
            fullAddress: d.display_name || '',
            location: { type: 'Point', coordinates: [longitude, latitude] },
          }));
        } catch {}
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 10000 }
    );
  };

  const openAdd = () => {
    setForm(EMPTY);
    setEditIdx(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (idx: number) => {
    setForm({ ...addresses[idx] });
    setEditIdx(idx);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.houseNo.trim() || !form.area.trim()) {
      setError('House No and Area are required');
      return;
    }
    setError('');
    const full = [form.houseNo, form.landmark, form.area].filter(Boolean).join(', ');
    const newAddr: Address = { ...form, fullAddress: form.fullAddress || full };

    let updated: Address[];
    if (editIdx !== null) {
      updated = addresses.map((a, i) => i === editIdx ? newAddr : a);
    } else {
      // If first address, make it default
      if (addresses.length === 0) newAddr.isDefault = true;
      updated = [...addresses, newAddr];
    }
    await saveAddresses(updated);
    setShowForm(false);
  };

  const handleDelete = async (idx: number) => {
    setDeleting(idx);
    const updated = addresses.filter((_, i) => i !== idx);
    // If deleted was default, make first one default
    if (addresses[idx].isDefault && updated.length > 0) updated[0].isDefault = true;
    await saveAddresses(updated);
    setDeleting(null);
  };

  const handleSetDefault = async (idx: number) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
    await saveAddresses(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">

      {/* Header */}
      <div className="bg-white px-4 pt-16 pb-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-gray-900">My Addresses</h1>
            <p className="text-xs text-gray-400">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-2xl active:scale-95 transition">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* Empty state */}
        {addresses.length === 0 && !showForm && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No addresses saved</h3>
            <p className="text-sm text-gray-400 mt-1 mb-6">Add your delivery addresses</p>
            <button onClick={openAdd}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow">
              + Add Address
            </button>
          </div>
        )}

        {/* Address list */}
        {addresses.map((addr, idx) => {
          const Icon = TYPE_ICONS[addr.addressType] || MapPin;
          return (
            <div key={idx} className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-start gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-5 h-5 ${addr.isDefault ? 'text-orange-500' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-extrabold text-gray-900 text-sm">{addr.addressType}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">DEFAULT</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {addr.fullAddress || [addr.houseNo, addr.landmark, addr.area].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-3 flex items-center gap-2 border-t border-gray-50 pt-2">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(idx)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl active:scale-95 transition">
                    <Star className="w-3.5 h-3.5" /> Set Default
                  </button>
                )}
                <button onClick={() => openEdit(idx)}
                  className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-xl active:scale-95 transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(idx)} disabled={deleting === idx}
                  className="flex items-center gap-1.5 text-xs text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-xl active:scale-95 transition ml-auto disabled:opacity-50">
                  {deleting === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Form Sheet ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-t-3xl px-5 pt-5 pb-10 mb-6 shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">
                {editIdx !== null ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-sm font-semibold">Cancel</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">{error}</div>
            )}

            {/* Detect location */}
            <button onClick={handleDetectLocation} disabled={detecting}
              className="w-full flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-5 active:scale-95 transition disabled:opacity-60">
              <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-bold text-orange-700">
                {detecting ? 'Detecting location…' : 'Use current location'}
              </span>
              {detecting && <Loader2 className="w-4 h-4 text-orange-400 animate-spin ml-auto" />}
            </button>

            {/* Address type */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Address Type</label>
              <div className="flex gap-2">
                {ADDRESS_TYPES.map(t => {
                  const Icon = TYPE_ICONS[t];
                  return (
                    <button key={t} onClick={() => setForm(p => ({ ...p, addressType: t }))}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 text-xs font-bold transition active:scale-95 ${
                        form.addressType === t ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'
                      }`}>
                      <Icon className="w-4 h-4" />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {[
                { key: 'houseNo',  label: 'House / Flat No *', placeholder: 'e.g. 42B, 3rd Floor' },
                { key: 'landmark', label: 'Landmark',           placeholder: 'e.g. Near City Mall' },
                { key: 'area',     label: 'Area / Colony *',    placeholder: 'e.g. Koregaon Park' },
                { key: 'fullAddress', label: 'Full Address',    placeholder: 'Auto-filled or type manually' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
                  />
                </div>
              ))}
            </div>

            {/* Default toggle */}
            <button onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
              className={`mt-4 w-full flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition ${
                form.isDefault ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50'
              }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                form.isDefault ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
              }`}>
                {form.isDefault && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm font-bold ${form.isDefault ? 'text-orange-700' : 'text-gray-600'}`}>
                Set as default address
              </span>
            </button>

            {/* Save */}
            <button onClick={handleSubmit} disabled={saving}
              className="mt-5 w-full py-4 bg-orange-500 text-white font-extrabold rounded-3xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {saving ? 'Saving…' : editIdx !== null ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
