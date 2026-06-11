import { Store, Eye, EyeOff } from 'lucide-react';
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
    latitude: '',
    longitude: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    mpin: ''
  });

  useEffect(() => {
    if (kitchenModal.data) {
      setFormData({
        name: kitchenModal.data?.name || '',
        latitude: kitchenModal.data?.location?.coordinates?.[1] || '',
        longitude: kitchenModal.data?.location?.coordinates?.[0] || '',
        ownerName: kitchenModal.data?.ownerName || '',
        ownerPhone: kitchenModal.data?.ownerPhone || '',
        ownerEmail: kitchenModal.data?.ownerEmail || '',
        mpin: '' // Clear mpin on edit for security and to avoid overwriting with hash
      });
    } else {
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        mpin: ''
      });
    }
  }, [kitchenModal.data, kitchenModal.open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    e.preventDefault();
    saveKitchen(e);
  };

  if (!kitchenModal.open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 my-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-amber-100 flex items-center justify-center text-amber-500 mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="font-black text-slate-900 text-xl tracking-tight">
            {kitchenModal.data ? 'Configure Node' : 'Initialize Kitchen'}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
            Operational Node
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          {/* Kitchen Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Kitchen Details
              </p>
            </div>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Kitchen Name"
              className={inputCls}
            />
          </div>

          {/* Geo-Spatial Coordinates Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Geo-Spatial Coordinates
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 px-2">Latitude</label>
                <input
                   name="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  required
                  placeholder="Lat"
                  type="number"
                  step="0.000001"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 px-2">Longitude</label>
                <input
                  name="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  required
                  placeholder="Long"
                  type="number"
                  step="0.000001"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Owner Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Owner Details
              </p>
            </div>
            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
              required
              placeholder="Owner Name"
              className={inputCls}
            />
            <input
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
              required
              placeholder="Owner Phone (10 digits)"
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              className={inputCls}
            />
            <input
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
              required
              placeholder="Owner Email"
              type="email"
              className={inputCls}
            />
            <div className="relative">
              <input
                name="mpin"
                value={formData.mpin}
                onChange={(e) => setFormData({...formData, mpin: e.target.value})}
                placeholder={kitchenModal.data ? "MPIN (Optional - Leave blank to keep current)" : "MPIN (4-6 digits)"}
                type={showMpin ? "text" : "password"}
                pattern="[0-9]*"
                maxLength={6}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowMpin(!showMpin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showMpin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={() => setKitchenModal({ open: false, data: null })}
              className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
            >
              {saving ? 'Syncing…' : 'Initialize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
