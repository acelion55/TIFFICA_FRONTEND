import { useState } from 'react';

const AVAILABLE_AREAS = [
  'Malviya Nagar',
  'Vaishali Nagar',
  'Mansarovar',
  'Jagatpura',
  'Pratap Nagar',
  'Raja Park',
  'C-Scheme',
  'Bani Park',
  'Tonk Road',
  'Ajmer Road',
  'Sitapura',
  'Sanganer',
  'Sodala',
  'Nirman Nagar',
  'Gopalpura',
  'Jhotwara',
  'Murlipura',
  'Vidyadhar Nagar',
  'Shyam Nagar',
  'Lal Kothi'
];

export function CouponModal({ couponModal, setCouponModal, userPerformance, fetchAll, headers, API_URL, saving, setSaving, inputCls, uploadImage, imgUploading }: any) {
  const [formData, setFormData] = useState({
    code: couponModal.data?.code || '',
    description: couponModal.data?.description || '',
    discountType: couponModal.data?.discountType || 'percentage',
    discountValue: couponModal.data?.discountValue || '',
    minOrderAmount: couponModal.data?.minOrderAmount || 0,
    maxDiscount: couponModal.data?.maxDiscount || '',
    usageLimit: couponModal.data?.usageLimit || '',
    userSpecific: couponModal.data?.userSpecific?._id || couponModal.data?.userSpecific || '',
    availableForAreas: couponModal.data?.availableForAreas || [],
    couponImage: couponModal.data?.couponImage || '',
    showAsPopup: couponModal.data?.showAsPopup !== false,
    validFrom: couponModal.data?.validFrom ? new Date(couponModal.data.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: couponModal.data?.validUntil ? new Date(couponModal.data.validUntil).toISOString().split('T')[0] : '',
    performanceBased: couponModal.data?.performanceBased || false,
    performanceCriteria: couponModal.data?.performanceCriteria || {}
  });

  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const toggleArea = (area: string) => {
    const currentAreas = formData.availableForAreas;
    if (currentAreas.includes(area)) {
      setFormData({ ...formData, availableForAreas: currentAreas.filter(a => a !== area) });
    } else {
      setFormData({ ...formData, availableForAreas: [...currentAreas, area] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isEdit = !!couponModal.data?._id;
    const url = isEdit ? `${API_URL}/coupons/${couponModal.data._id}` : `${API_URL}/coupons`;
    
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    setSaving(false);

    if (data.success) {
      setCouponModal({ open: false, data: null });
      fetchAll();
    } else {
      alert(data.error || 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 my-4 shadow-2xl">
        <h2 className="font-bold text-gray-900 text-lg mb-5">
          {couponModal.data?._id ? 'Edit Coupon' : 'Create Coupon'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Coupon Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Coupon Promotional Image</label>
            <div className="flex items-center gap-3">
              {formData.couponImage && (
                <img 
                  src={formData.couponImage} 
                  alt="Coupon" 
                  className="w-20 h-20 rounded-xl object-cover border-2 border-purple-200" 
                />
              )}
              <label className="cursor-pointer flex-1 py-3 border-2 border-dashed border-purple-300 rounded-xl text-center text-xs font-bold text-purple-500 hover:bg-purple-50 transition">
                {imgUploading ? 'Uploading...' : formData.couponImage ? '📷 Change Image' : '📷 Upload Coupon Image'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const url = await uploadImage(f);
                      setFormData({ ...formData, couponImage: url });
                    } catch {
                      alert('Upload failed');
                    }
                  }} 
                  disabled={imgUploading} 
                />
              </label>
              {formData.couponImage && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, couponImage: '' })}
                  className="px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <input
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            placeholder="Coupon Code (e.g., SAVE20)"
            className={inputCls}
            disabled={!!couponModal.data?._id}
          />
          
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Description"
            rows={2}
            className={`${inputCls} resize-none`}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={formData.discountType}
              onChange={e => setFormData({ ...formData, discountType: e.target.value })}
              className={inputCls}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
            
            <input
              type="number"
              value={formData.discountValue}
              onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
              required
              placeholder={formData.discountType === 'percentage' ? 'Discount %' : 'Amount ₹'}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={formData.minOrderAmount}
              onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
              placeholder="Min Order Amount (₹)"
              className={inputCls}
            />
            
            <input
              type="number"
              value={formData.maxDiscount}
              onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
              placeholder="Max Discount (₹)"
              className={inputCls}
            />
          </div>

          <input
            type="number"
            value={formData.usageLimit}
            onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
            placeholder="Usage Limit (leave empty for unlimited)"
            className={inputCls}
          />

          <select
            value={formData.userSpecific}
            onChange={e => setFormData({ ...formData, userSpecific: e.target.value })}
            className={inputCls}
          >
            <option value="">Available for All Users</option>
            {userPerformance.map((user: any) => (
              <option key={user._id} value={user._id}>
                {user.name} - {user.totalOrders} orders (₹{user.totalSpent})
              </option>
            ))}
          </select>

          {/* Area Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Available for Areas</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className={`${inputCls} text-left flex items-center justify-between`}
              >
                <span className="text-sm">
                  {formData.availableForAreas.length === 0 
                    ? 'All Areas' 
                    : `${formData.availableForAreas.length} area(s) selected`}
                </span>
                <svg className={`w-4 h-4 transition-transform ${showAreaDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAreaDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, availableForAreas: [] })}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded-lg text-purple-600 font-semibold"
                    >
                      ✓ All Areas (Clear Selection)
                    </button>
                  </div>
                  <div className="border-t border-gray-100 p-2 space-y-1">
                    {AVAILABLE_AREAS.map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                          formData.availableForAreas.includes(area)
                            ? 'bg-purple-100 text-purple-700 font-semibold'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {formData.availableForAreas.includes(area) && '✓ '}{area}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {formData.availableForAreas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.availableForAreas.map(area => (
                  <span key={area} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {area}
                    <button
                      type="button"
                      onClick={() => toggleArea(area)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                required
                className={inputCls}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                required
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.performanceBased}
              onChange={e => setFormData({ ...formData, performanceBased: e.target.checked })}
              className="accent-purple-500 w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Performance-Based Reward</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showAsPopup}
              onChange={e => setFormData({ ...formData, showAsPopup: e.target.checked })}
              className="accent-purple-500 w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Show as Popup to Users</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCouponModal({ open: false, data: null })}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition"
            >
              {saving ? 'Saving…' : couponModal.data?._id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
