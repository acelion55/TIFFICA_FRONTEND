'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { openRazorpay } from '@/hooks/useRazorpay';
import { MapPin, Phone, User, AlertCircle, Loader2, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !token) {
      addToast('Please login to proceed with checkout', 'error');
      router.push('/login');
    }
  }, [token, authLoading, router, addToast]);

  // Set default address
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user]);

  // Empty cart check
  if (!authLoading && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout</p>
          <Link 
            href="/menu"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress) {
        addToast('Please select a delivery address', 'error');
        return;
      }

      setIsProcessing(true);

      const orderData = {
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          addOns: item.selectedAddOns || []
        })),
        deliveryAddress: selectedAddress,
        deliveryFee,
        paymentMethod,
        specialInstructions,
        scheduledFor: null
      };

      // Create order first
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || 'Failed to create order');
      }

      const orderResponse = await orderRes.json();
      const orderId = orderResponse.orderId || orderResponse.order?._id;

      if (paymentMethod === 'razorpay') {
        // Proceed with Razorpay payment
        await openRazorpay({
          amount: total + deliveryFee,
          description: `Order #${orderId}`,
          token,
          userName: user?.name,
          userEmail: user?.email,
          userPhone: user?.phone,
          onSuccess: async (paymentId) => {
            addToast('Payment successful! Order placed.', 'success');
            clearCart();
            router.push(`/orders/${orderId}`);
          },
          onFailure: async (err) => {
            addToast('Payment failed. Order saved as pending.', 'error');
            router.push(`/orders/${orderId}`);
          },
          onError: (error) => {
            addToast(error.message || 'Payment error', 'error');
          }
        });
      } else {
        // Cash payment - order already created
        addToast('Order placed successfully! Pay with cash at delivery.', 'success');
        clearCart();
        router.push(`/orders/${orderId}`);
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to place order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const finalTotal = total + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Add-ons: {item.selectedAddOns.map(a => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Delivery Address
              </h2>
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors"
                           style={{ borderColor: selectedAddress?.label === addr.label ? '#f97316' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?.label === addr.label}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{addr.label || 'Home'}</p>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                        <p className="text-xs text-gray-500 mt-1">{addr.city}, {addr.state} {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4">No address found. <Link href="/addresses" className="text-orange-500 font-bold">Add one</Link></p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors"
                       style={{ borderColor: paymentMethod === 'razorpay' ? '#f97316' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <div>
                    <p className="font-bold">Online Payment</p>
                    <p className="text-sm text-gray-600">Pay with Razorpay (Card, UPI, Netbanking)</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors"
                       style={{ borderColor: paymentMethod === 'cash' ? '#f97316' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <div>
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Special Instructions</h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Extra spicy, no onions, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <h3 className="text-lg font-bold mb-4">Order Total</h3>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-bold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold">₹{deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-900 mb-6">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              {user && (
                <div className="mb-6 pb-6 border-b border-gray-200 text-sm">
                  <p className="text-gray-600 mb-2">Delivering to:</p>
                  <div className="flex items-start gap-2">
                    <Phone size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-gray-600">{user.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddress}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order • ₹${finalTotal.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
