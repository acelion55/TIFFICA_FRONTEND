'use client';

const API_URL = 'https://tifficaapp-1.onrender.com/api';
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
  const rzp = new (window as any).Razorpay({
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
    theme: { color: '#f97316' },
    handler: (response: any) => {
      onSuccess(response.razorpay_payment_id, amount);
    },
    modal: {
      ondismiss: () => onFailure?.('dismissed'),
    },
  });

  rzp.on('payment.failed', (response: { error?: { description?: string } }) => {
    onError?.({ message: response?.error?.description || 'Payment failed' });
    onFailure?.(response);
  });

  rzp.open();
}
