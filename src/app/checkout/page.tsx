'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { openRazorpay } from '@/hooks/useRazorpay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/home');
    }
  }, [cart.length, router]);

  const handlePayment = async () => {
    if (!token || !user) return;
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
              deliveryAddress: user.addresses?.find(a => a.isDefault) || {},
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Cart is empty</h1>
          <p className="text-gray-500 mb-6">Add some delicious meals to get started</p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 px-5 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">Your Order</h1>
            <p className="text-xs text-gray-500">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {cart.map(item => (
          <motion.div
            key={item._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          >
            <div className="flex gap-4 p-4">
              {/* Image */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                {item.cloudKitchen && (
                  <p className="text-xs text-orange-500 mt-1">🏠 {item.cloudKitchen.name}</p>
                )}
                <p className="text-sm font-extrabold text-orange-600 mt-2">
                  ₹{(item.price * item.quantity).toFixed(0)} ({item.quantity} × ₹{item.price})
                </p>
              </div>

              {/* Quantity Control */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary - Fixed Bottom */}
      <div className="bg-white border-t border-gray-100 shadow-2xl flex-shrink-0">
        <div className="max-w-md mx-auto px-5 py-3 space-y-3">
          {/* Promo */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-orange-700">Express Delivery</p>
              <p className="text-[10px] text-orange-600">30 min or free! • 0 delivery charge</p>
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="space-y-2 border-t border-gray-100 pt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-orange-600">₹{total.toFixed(0)}</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={paying}
            className={`w-full py-3 rounded-2xl font-extrabold text-white transition ${
              paying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg active:scale-95'
            }`}
          >
            {paying ? '⏳ Processing...' : `Pay ₹${total.toFixed(0)} with RazorPay`}
          </button>

          <p className="text-center text-[10px] text-gray-400">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
