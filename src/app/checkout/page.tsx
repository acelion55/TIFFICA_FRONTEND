'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, MapPin, ChevronDown, CheckCircle2, Home, Briefcase, Hotel, MoreHorizontal, Loader2, Lock, UtensilsCrossed, Wallet, Tag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLocation } from '@/context/LocationContext';
import { openRazorpay } from '@/hooks/useRazorpay';
import { API_URL } from '@/config/api';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';

const TYPE_ICONS: Record<string, any> = {
  Home, Work: Briefcase, Hotel, Other: MoreHorizontal,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, total } = useCart();
  const { user, token } = useAuth();
  const { location, locationSet } = useLocation();
  const { addToast } = useToast();
  const [paying, setPaying] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [settings, setSettings] = useState<{ defaultDeliveryFee: number; corporateDeliveryFee: number; subscriptionDeliveryPerTiffin: number }>({ defaultDeliveryFee: 25, corporateDeliveryFee: 100, subscriptionDeliveryPerTiffin: 20 });

  useEffect(() => {
    if (cart.length === 0 && !isOrderSuccess) {
      router.push('/home');
    }
  }, [cart.length, router, isOrderSuccess]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const addrs = d.addresses || [];
        setAddresses(addrs);
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        setSelectedAddress(def);
        setWalletBalance(d.walletBalance || 0);
        if (d.walletBalance > 0) {
          setUseWallet(true);
        }
      })
      .catch(() => { });
  }, [token]);

  // Fetch menu items for add more section
  useEffect(() => {
    if (!token) return;
    setLoadingMenu(true);
    const headers = { Authorization: `Bearer ${token}` };
    const menuUrl = locationSet ? `${API_URL}/menu/by-location` : `${API_URL}/menu`;

    fetch(menuUrl, { headers })
      .then(r => r.json())
      .then(d => {
        const items = d.items || [];
        // Filter out items already in cart
        const cartIds = new Set(cart.map(i => i._id));
        const available = items.filter((item: any) => !cartIds.has(item._id)).slice(0, 8);
        setMenuItems(available);
      })
      .catch(err => {
        console.error('Error fetching menu:', err);
        setMenuItems([]);
      })
      .finally(() => setLoadingMenu(false));
  }, [token, locationSet, cart]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: total,
          area: selectedAddress?.area
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        addToast('Coupon applied successfully!', 'success');
      } else {
        addToast(data.error || 'Invalid coupon', 'error');
      }
    } catch (err) {
      addToast('Failed to apply coupon', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  // Delivery fee calculation based on cart flags and admin settings
  const hasCorporate = cart.some(i => (i as any).isCorporate);
  const subscriptionCount = cart.filter(i => (i as any).isSubscription).reduce((s, it) => s + (it.quantity || 0), 0);
  const deliveryFee = hasCorporate && cart.length > 0
    ? (settings.corporateDeliveryFee || 100)
    : (subscriptionCount > 0 ? ((settings.subscriptionDeliveryPerTiffin || 20) * subscriptionCount) : (settings.defaultDeliveryFee || 25));

  const finalTotal = Math.max(0, total - discount + (deliveryFee || 0));
  const canUseWallet = useWallet && walletBalance >= finalTotal;

  // Load settings once
  useEffect(() => {
    fetch(`${API_URL}/settings`).then(r => r.json()).then(d => {
      if (d?.success && d.settings) {
        setSettings({
          defaultDeliveryFee: Number(d.settings.defaultDeliveryFee || 25),
          corporateDeliveryFee: Number(d.settings.corporateDeliveryFee || 100),
          subscriptionDeliveryPerTiffin: Number(d.settings.subscriptionDeliveryPerTiffin || 20)
        });
      }
    }).catch(() => {});
  }, []);

  const handlePayment = async () => {
    if (!token || !user) return;
    if (!selectedAddress) {
      addToast('Please select a delivery address', 'error');
      return;
    }
    setPaying(true);

    const description = `Order: ${cart.map(i => i.name).join(', ')}`;

    try {
      await openRazorpay({
        amount: finalTotal,
        description,
        token,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        onSuccess: async (paymentId) => {
          addToast('Payment successful! Processing order...', 'success');

          // Send order to backend
          try {
            console.log('📦 Sending order to backend...');
            const orderData = {
              items: cart.map(item => ({
                menuItemId: item._id,
                quantity: item.quantity
              })),
              deliveryAddress: selectedAddress,
              deliveryFee: deliveryFee || 0,
              couponId: appliedCoupon?._id,
              paymentMethod: 'razorpay',
              paymentId: paymentId,
              specialInstructions: specialInstructions.trim(),
            };

            console.log('📋 Order data:', JSON.stringify(orderData, null, 2));
            console.log('🔑 Using token:', token ? 'Token present' : 'No token');
            console.log('🏠 Selected address:', selectedAddress);

            const response = await fetch(`${API_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(orderData),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            const result = await response.json();
            console.log('📋 Backend response:', result);

            if (!response.ok) {
              console.error('❌ Order creation failed:', result);
              addToast(`Payment successful but order save failed: ${result.error || 'Unknown error'}`, 'error');
              setPaying(false);
            } else {
              setIsOrderSuccess(true);
              setPaying(false);
            }
          } catch (e) {
            console.error('❌ Order save failed:', e);
            const msg = e instanceof Error ? e.message : 'Unknown error';
            addToast(`Payment successful but order save failed: ${msg}`, 'error');
          }

          clearCart();
          setTimeout(() => router.push('/reorder'), 2000);
        },
        onFailure: () => {
          addToast('Payment failed. Please try again.', 'error');
          setPaying(false);
        },
        onError: (error) => {
          console.error('🚫 Payment error:', error);
          addToast(`Payment error: ${error.message || 'Unknown error'}`, 'error');
          setPaying(false);
        },
      });
    } catch (e) {
      addToast('Error processing payment', 'error');
      setPaying(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!token || !user || !selectedAddress) return;
    setPaying(true);

    try {
      console.log('👛 Processing wallet payment...');
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity
        })),
        deliveryAddress: selectedAddress,
        deliveryFee: deliveryFee || 0,
        couponId: appliedCoupon?._id,
        paymentMethod: 'wallet',
        specialInstructions: specialInstructions.trim(),
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log('👛 Wallet order response:', result);

      if (!response.ok) {
        addToast(result.error || 'Failed to place order using wallet', 'error');
        setPaying(false);
      } else {
        console.log('✅ Wallet order successful!');
        // INSTANT DEDUCTION: Update local state immediately
        setWalletBalance(prev => Math.max(0, prev - finalTotal));
        
        setIsOrderSuccess(true);
        setPaying(false);
        addToast('Order placed successfully!', 'success');
        clearCart();
        // Redirect after a short delay to let success animation show
        setTimeout(() => {
          router.push('/reorder');
        }, 3000);
      }
    } catch (e) {
      console.error('❌ Wallet order error:', e);
      addToast('Error placing wallet order', 'error');
      setPaying(false);
    }
  };

  if (cart.length === 0 && !isOrderSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-b from-orange-50 to-white flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Cart is empty</h1>
          <p className="text-gray-500 mb-6">Add some delicious meals to get started</p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">
      {/* Premium Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-md px-5 pt-4 pb-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center active:scale-90 transition-all hover:bg-gray-50"
          >
            <ArrowLeft className="w-6 h-6 text-orange-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">
              {cart.length} {cart.length !== 1 ? 'Items' : 'Item'} in bag
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all duration-300 ${useWallet ? 'bg-orange-500 border-orange-600 shadow-md' : 'bg-orange-50 border-orange-100 shadow-sm'}`}>
              <Wallet className={`w-3.5 h-3.5 ${useWallet ? 'text-white' : 'text-orange-500'}`} />
              <span className={`text-xs font-black ${useWallet ? 'text-white' : 'text-slate-900'}`}>₹{walletBalance.toFixed(0)}</span>
            </div>
            {/* Wallet Toggle Switch */}
            <button
              onClick={() => {
                if (walletBalance > 0) setUseWallet(!useWallet);
                else addToast('Wallet balance is zero', 'error');
              }}
              className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${useWallet ? 'bg-orange-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${useWallet ? 'left-[22px]' : 'left-[2px]'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map(item => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm"
            >
              {/* Full Width Image with linear Overlay */}
              <div className="relative h-48 w-full">
                <img
                  src={item.image || FALLBACK}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                {/* Item Details on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-extrabold text-lg mb-1">{item.name}</h3>
                  {item.cloudKitchen && (
                    <p className="text-xs text-orange-300 mb-2 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 shrink-0" />
                      {item.cloudKitchen.name}
                    </p>
                  )}
                  {/* Show description when available */}
                  {item.description && (
                    <p className="text-sm text-white/90 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                    <div className="flex items-center gap-3">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white/30 rounded-lg active:scale-90 transition"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white/30 rounded-lg active:scale-90 transition"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="w-9 h-9 flex items-center justify-center bg-red-500/90 backdrop-blur-md rounded-xl active:scale-90 transition"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add More Menu Section - Horizontal Scrolling */}
        {menuItems && menuItems.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              Recommended For You
            </h2>
            <div className="overflow-x-auto -mx-5 px-5 pb-2">
              <div className="flex gap-4 min-w-min">
                {menuItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="w-64 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image Section */}
                    <div className="relative h-40 overflow-hidden bg-gray-200">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4 space-y-3">
                      {/* Description */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                          {item.cloudKitchen?.name || 'Special Menu'}
                        </p>
                        <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                          {item.description || item.name}
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-lg font-black text-orange-600">₹{item.price}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (addToCart) {
                              addToCart({ _id: item._id, name: item.name, price: item.price, image: item.image });
                              if (addToast) addToast(`Added ${item.name}`, 'success');
                            }
                          }}
                          className="w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center active:scale-90 transition hover:bg-orange-600 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Address Section */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Delivery Address
            </h2>
          </div>

          {selectedAddress ? (
            <button
              onClick={() => setShowAddressModal(true)}
              className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                {(() => {
                  const Icon = TYPE_ICONS[selectedAddress.addressType] || MapPin;
                  return <Icon className="w-5 h-5 text-orange-500" />;
                })()}
              </div>
              <div className="flex-1  min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-900">{selectedAddress.addressType}</p>
                  {selectedAddress.isDefault && (
                    <span className="text-[9px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">DEFAULT</span>
                  )}
                </div>
                <p className="text-xs  text-gray-600 line-clamp-2">
                  {selectedAddress.fullAddress || [selectedAddress.houseNo, selectedAddress.area].filter(Boolean).join(', ')}
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-2" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/addresses')}
              className="w-full px-5 py-4 text-center text-sm text-orange-500 font-bold"
            >
              + Add Delivery Address
            </button>
          )}
        </div>

        {/* Special Instructions (Optional Note) */}
        <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <MoreHorizontal className="w-4 h-4 text-orange-500" />
            Add a Note
          </h2>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special instructions for the kitchen or delivery partner?"
            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 transition-all resize-none h-20"
          />
        </div>

        {/* Coupon Section */}
        <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-500" />
            Apply Coupon
          </h2>

          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 active:scale-95 transition"
              >
                {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-800">{appliedCoupon.code}</p>
                  <p className="text-[10px] text-emerald-600">₹{appliedCoupon.discountAmount} saved on this order!</p>
                </div>
              </div>
              <button
                onClick={removeCoupon}
                className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 active:scale-90 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 mb-3">Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{total.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-bold">{deliveryFee && deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-100 pt-3">
              <span>Total Amount</span>
              <span className="text-orange-600">₹{finalTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Payment Button - ALWAYS VISIBLE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 px-4 py-3 z-50" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
        <button
          onClick={useWallet ? handleWalletPayment : handlePayment}
          disabled={paying || !selectedAddress || (useWallet && walletBalance < finalTotal)}
          className={`w-full py-3 px-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 ${paying || !selectedAddress || (useWallet && walletBalance < finalTotal)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 active:bg-orange-600 shadow-lg shadow-orange-200 transition'
            }`}
        >
          {paying ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            `${useWallet ? '👛 Pay with Wallet' : '💳 Pay'} ₹${finalTotal.toFixed(0)}`
          )}
        </button>
        <p className="text-center text-[8px] text-gray-500 mt-1">🔒 Secure Payment by Razorpay</p>
      </div>

      {/* Address Selection Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
              onClick={() => setShowAddressModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl mb-16 z-50 max-h-[70vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-gray-900">Select Address</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No saved addresses</p>
                  </div>
                ) : (
                  addresses.map((addr: any, i: number) => {
                    const Icon = TYPE_ICONS[addr.addressType] || MapPin;
                    const isSelected = selectedAddress?._id === addr._id;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressModal(false);
                        }}
                        className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition text-left ${isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100 bg-white hover:border-orange-200'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-orange-500' : 'bg-gray-100'
                          }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900">{addr.addressType}</p>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {addr.fullAddress || [addr.houseNo, addr.area].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-2" />}
                      </button>
                    );
                  })
                )}

                {/* Add Address Button - Always shown */}
                <button
                  onClick={() => router.push('/addresses')}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 transition mt-2"
                >
                  <Plus className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">Add New Address</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Success Overlay */}
      <AnimatePresence>
        {isOrderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Order Successful!</h2>
            <p className="text-slate-600 mb-8">Your meal is being prepared by the kitchen.</p>
            <div className="w-full max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                className="h-full bg-orange-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Redirecting to My Orders...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}