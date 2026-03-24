'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Plus, CheckCircle, Zap, Shield, Loader2 } from 'lucide-react';
import { openRazorpay } from '@/hooks/useRazorpay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PLANS = [
  { amount: 199,  bonus: 0,   popular: false },
  { amount: 499,  bonus: 25,  popular: true  },
  { amount: 999,  bonus: 75,  popular: false },
  { amount: 1999, bonus: 200, popular: false },
];
const QUICK = [100, 200, 500, 1000];

export default function SubscriptionsPage() {
  const { token, user, updateUser } = useAuth();
  const router = useRouter();
  const [balance, setBalance]       = useState(user?.walletBalance ?? 0);
  const [recharging, setRecharging] = useState<number | null>(null);
  const [customAmt, setCustomAmt]   = useState('');
  const [success, setSuccess]       = useState<number | null>(null);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setBalance(d.walletBalance ?? 0))
      .catch(() => {});
  }, [token, router]);

  const handleRecharge = async (amount: number) => {
    if (!token || recharging !== null) return;
    setRecharging(amount);
    setError('');

    try {
      await openRazorpay({
        amount,
        description: `Tiffica Wallet Recharge ₹${amount}`,
        token,
        userName:  user?.name,
        userEmail: user?.email,
        userPhone: user?.phone,
        onSuccess: async (paymentId, amt) => {
          // Credit wallet on backend
          const res = await fetch(`${API_URL}/payments/wallet-credit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ amount: amt, paymentId }),
          });
          if (res.ok) {
            const d = await res.json();
            setBalance(d.walletBalance);
            updateUser(d.user);
            setSuccess(amt);
            setTimeout(() => setSuccess(null), 4000);
          }
          setRecharging(null);
        },
        onFailure: (err) => {
          if (err !== 'dismissed') setError('Payment failed. Please try again.');
          setRecharging(null);
        },
      });
    } catch {
      setError('Something went wrong. Please try again.');
      setRecharging(null);
    }
  };

  const handleCustom = () => {
    const amt = parseInt(customAmt);
    if (!amt || amt < 10) { setError('Minimum recharge is ₹10'); return; }
    setCustomAmt('');
    handleRecharge(amt);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-5 pt-16 pb-10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-semibold mb-1">Wallet Balance</p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-4xl font-extrabold text-white">₹{Math.floor(balance)}</span>
            <span className="text-white/70 text-lg mb-0.5">.{String(balance.toFixed(2)).split('.')[1]}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2 w-fit">
            <Wallet className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold">Tiffica Wallet</span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-5">

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-bold text-sm">₹{success} added to your wallet!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Quick recharge */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" /> Quick Recharge
          </h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {QUICK.map(amt => (
              <button key={amt} onClick={() => handleRecharge(amt)}
                disabled={recharging !== null}
                className="py-3 rounded-2xl border-2 border-orange-200 text-orange-600 font-extrabold text-sm active:scale-95 transition disabled:opacity-50">
                ₹{amt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <span className="text-gray-500 font-bold">₹</span>
              <input type="number" placeholder="Enter amount" value={customAmt}
                onChange={e => setCustomAmt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustom()}
                className="flex-1 bg-transparent text-sm font-bold text-gray-800 focus:outline-none placeholder:text-gray-400"
                min={10} />
            </div>
            <button onClick={handleCustom} disabled={!customAmt || recharging !== null}
              className="px-5 py-3 bg-orange-500 text-white font-extrabold rounded-2xl disabled:opacity-50 active:scale-95 transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plans */}
        <div>
          <h3 className="font-extrabold text-gray-900 mb-3">Recharge Plans</h3>
          <div className="space-y-3">
            {PLANS.map(plan => {
              const total = plan.amount + plan.bonus;
              const isLoading = recharging === total;
              return (
                <div key={plan.amount}
                  className={`bg-white rounded-3xl p-4 shadow-sm border-2 relative overflow-hidden ${plan.popular ? 'border-orange-500' : 'border-transparent'}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-2xl">
                      BEST VALUE
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-extrabold text-gray-900">₹{plan.amount}</span>
                        {plan.bonus > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
                            +₹{plan.bonus} bonus
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {plan.bonus > 0 ? `Get ₹${total} total in wallet` : 'Added directly to wallet'}
                      </p>
                    </div>
                    <button onClick={() => handleRecharge(total)}
                      disabled={recharging !== null}
                      className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                        plan.popular ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recharge'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-extrabold text-gray-900 mb-4">How it works</h3>
          <div className="space-y-3">
            {[
              { icon: '💳', text: 'Recharge your wallet with any amount' },
              { icon: '🍱', text: 'Use wallet balance to schedule & lock meals' },
              { icon: '🔒', text: 'Locked meals are deducted from wallet instantly' },
              { icon: '↩️', text: 'Cancelled meals are refunded to wallet' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{icon}</span>
                <p className="text-sm text-gray-600 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
          <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500">Payments secured by Razorpay. Wallet balance never expires.</p>
        </div>
      </div>
    </div>
  );
}
