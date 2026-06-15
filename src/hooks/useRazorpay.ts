'use client';

import { API_URL } from '@/config/api';

const RZP_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SOo4j7OHUYTDfq';

interface PayOptions {
  amount: number;          // in rupees
  description: string;
  token: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (paymentId: string, amount: number) => void;
  onFailure?: (err: unknown) => void;
  onError?: (error: { message?: string }) => void;
}

export async function openRazorpay(opts: PayOptions) {
  const { amount, description, token, userName, userEmail, userPhone, onSuccess, onFailure, onError } = opts;

  try {
    // 1. Create Razorpay order on backend
    const res = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount, description }),
    });

    if (!res.ok) {
      const err = await res.json();
      onFailure?.(err);
      return;
    }

    const data = await res.json();
    const order = data.order;

    // 2. Open Razorpay checkout with order_id
    const options = {
      key: RZP_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'Tiffica',
      description,
      image: '/icon-192.svg',
      order_id: order.id,
      prefill: {
        name:    userName  || '',
        email:   userEmail || '',
        contact: userPhone || '',
      },
      theme: { 
        color: '#f97316',
        hide_topbar: false 
      },
      modal: {
        ondismiss: () => onFailure?.('dismissed'),
        escape: false,
        backdropclose: false
      },
      retry: {
        enabled: false // Recommended for mobile apps/PWAs to avoid payment loops
      },
      timeout: 300, // 5 minutes
      send_sms_hash: true, // For autofilling OTP on Android
      handler: (response: any) => {
        onSuccess(response.razorpay_payment_id, amount);
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (response: { error?: { description?: string } }) => {
      console.error('Payment failed:', response);
      onError?.({ message: response?.error?.description || 'Payment failed' });
      onFailure?.(response);
    });

    rzp.open();
  } catch (err) {
    console.error('Razorpay Error:', err);
    onError?.({ message: 'Error initializing payment' });
    onFailure?.(err);
  }
}
