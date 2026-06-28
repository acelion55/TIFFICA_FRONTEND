import { Store, Eye, EyeOff, MapPin, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';

export function KitchenModal({ 
  kitchenModal, 
  setKitchenModal, 
  saveKitchen, 
  saving,
  inputCls 
}: any) {
  const [showMpin, setShowMpin] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    mpin: '',
    profilePhoto: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    if (kitchenModal.data) {
      setFormData({
        name: kitchenModal.data?.name || '',
        ownerName: kitchenModal.data?.ownerName || '',
        ownerPhone: kitchenModal.data?.ownerPhone || '',
        ownerEmail: kitchenModal.data?.ownerEmail || '',
        mpin: '', // Clear mpin on edit for security and to avoid overwriting with hash
        profilePhoto: kitchenModal.data?.profilePhoto || '',
        street: kitchenModal.data?.address?.street || '',
        area: kitchenModal.data?.address?.area || '',
        city: kitchenModal.data?.address?.city || '',
        state: kitchenModal.data?.address?.state || '',
        pincode: kitchenModal.data?.address?.pincode || '',
        landmark: kitchenModal.data?.address?.landmark || ''
      });
    } else {
      setFormData({
        name: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        mpin: '',
        profilePhoto: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      });
    }
  }, [kitchenModal.data, kitchenModal.open]);

  const handleNavigate = () => {
    if (kitchenModal.data?.location?.coordinates) {
      const [lng, lat] = kitchenModal.data.location.coordinates;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    e.preventDefault();
    saveKitchen(e);
  };

  if (!kitchenModal.open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500" style={{ maxHeight: '95vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          {formData.profilePhoto ? (
            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src={formData.profilePhoto} 
                alt="Kitchen Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-slate-900 text-lg tracking-tight">
              {kitchenModal.data ? 'Configure Node' : 'Initialize Kitchen'}
            </h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Operational Node
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Kitchen Details Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-3 bg-orange-500 rounded-full" />
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                Kitchen Details
              </p>
            </div>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Kitchen Name"
              className={`${inputCls} text-sm py-2`}
            />
          </div>

          {/* Address Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-3 bg-orange-500 rounded-full" />
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                Kitchen Address
              </p>
            </div>
            <input
              name="street"
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              placeholder="Street Address"
              className={`${inputCls} text-sm py-2`}
            />
            <input
              name="area"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              placeholder="Area / Locality"
              className={`${inputCls} text-sm py-2`}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="City"
                className={`${inputCls} text-sm py-2`}
              />
              <input
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="State"
                className={`${inputCls} text-sm py-2`}
              />
              <input
                name="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                placeholder="Pincode"
                type="tel"
                maxLength={6}
                className={`${inputCls} text-sm py-2`}
              />
            </div>
            <input
              name="landmark"
              value={formData.landmark}
              onChange={(e) => setFormData({...formData, landmark: e.target.value})}
              placeholder="Landmark"
              className={`${inputCls} text-sm py-2`}
            />
            {kitchenModal.data && (
              <button
                type="button"
                onClick={handleNavigate}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[7px] font-bold uppercase tracking-widest hover:bg-blue-100 transition flex items-center justify-center gap-1 border border-blue-200"
              >
                <MapPin size={12} />
                Navigate to Location
              </button>
            )}
          </div>

          {/* Owner Details Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-3 bg-orange-500 rounded-full" />
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                Owner Details
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                required
                placeholder="Owner Name"
                className={`${inputCls} text-sm py-2`}
              />
              <input
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                required
                placeholder="Phone (10 digits)"
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                className={`${inputCls} text-sm py-2`}
              />
            </div>
            <input
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
              required
              placeholder="Owner Email"
              type="email"
              className={`${inputCls} text-sm py-2`}
            />
            <div className="relative">
              <input
                name="mpin"
                value={formData.mpin}
                onChange={(e) => setFormData({...formData, mpin: e.target.value})}
                placeholder={kitchenModal.data ? "MPIN (optional)" : "MPIN (4-6 digits)"}
                type={showMpin ? "text" : "password"}
                pattern="[0-9]*"
                maxLength={6}
                className={`${inputCls} text-sm py-2`}
              />
              <button
                type="button"
                onClick={() => setShowMpin(!showMpin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showMpin ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t border-slate-100">
            <button
              type="button"
              onClick={() => setKitchenModal({ open: false, data: null })}
              className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 transition border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
            >
              {saving ? 'Syncing…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
