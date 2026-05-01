'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, MapPin, ChevronDown, CheckCircle2, Home, Briefcase, Hotel, MoreHorizontal } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { openRazorpay } from '@/hooks/useRazorpay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';

const TYPE_ICONS: Record<string, any> = {
  Home, Work: Briefcase, Hotel, Other: MoreHorizontal,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [paying, setPaying] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/home');
    }
  }, [cart.length, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const addrs = d.addresses || [];
        setAddresses(addrs);
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        setSelectedAddress(def);
      })
      .catch(() => {});
  }, [token]);

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
        amount: total,
        description,
        token,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        onSuccess: async (paymentId) => {
          addToast('✅ Payment successful! Order placed.', 'success');
          
          // Send order to backend
          try {
            const orderData = {
              items: cart.map(item => ({
                menuItemId: item._id,
                quantity: item.quantity
              })),
              deliveryAddress: selectedAddress,
              deliveryFee: 0,
              discount: 0,
              paymentMethod: 'razorpay',
              paymentId: paymentId,
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
            
            if (!response.ok) {
              console.error('Order creation failed:', result);
              addToast('⚠️ Payment successful but order save failed', 'error');
            }
          } catch (e) {
            console.error('Order save failed:', e);
            addToast('⚠️ Payment successful but order save failed', 'error');
          }

          clearCart();
          setTimeout(() => router.push('/orders'), 1500);
        },
        onFailure: () => {
          addToast('❌ Payment failed. Please try again.', 'error');
          setPaying(false);
        },
      });
    } catch (e) {
      addToast('❌ Error processing payment', 'error');
      setPaying(false);
    }
  };

  if (cart.length === 0) {
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
      {/* Header */}
      <div className="bg-white px-5 pt-3 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">Checkout</h1>
            <p className="text-xs text-gray-400">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
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
                    <p className="text-xs text-orange-300 mb-2">🏠 {item.cloudKitchen.name}</p>
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

        {/* Bill Summary */}
        <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 mb-3">Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-100 pt-3">
              <span>Total Amount</span>
              <span className="text-orange-600">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Payment Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl px-5 py-4 z-40">
        <button
          onClick={handlePayment}
          disabled={paying || !selectedAddress}
          className={`w-full py-4 mb-9 rounded-2xl font-extrabold text-white transition flex items-center justify-center gap-2 ${
            paying || !selectedAddress
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-linear-to-r from-orange-500 to-amber-500 active:scale-95 shadow-lg shadow-orange-200'
          }`}
        >
          {paying ? '⏳ Processing...' : `Pay ₹${total.toFixed(0)}`}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          🔒 Secure payment powered by Razorpay
        </p>
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
                        className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition text-left ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-100 bg-white hover:border-orange-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-orange-500' : 'bg-gray-100'
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
    </div>
  );
}
