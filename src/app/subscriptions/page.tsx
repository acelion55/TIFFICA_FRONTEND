'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Wallet, Plus, CheckCircle, Zap, Shield, Loader2, TrendingUp } from 'lucide-react';
import { openRazorpay } from '@/hooks/useRazorpay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

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

  const balanceRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setBalance(d.walletBalance ?? 0))
      .catch(() => {});
  }, [token, router]);

  useEffect(() => {
    if (balanceRef.current) {
      gsap.fromTo(balanceRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }, []);

  useEffect(() => {
    if (plansRef.current) {
      const cards = plansRef.current.querySelectorAll('.plan-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F5] to-orange-50/30 pb-24">

      <div className="px-6 pt-20 space-y-5">

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl px-5 py-4 flex items-center gap-3 shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              </motion.div>
              <p className="text-green-700 font-bold text-sm">₹{success} added to your wallet!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-2 border-red-200 rounded-3xl px-5 py-4 shadow-md"
            >
              <p className="text-red-600 text-sm font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick recharge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100"
        >
          <h3 className="font-extrabold text-gray-900 text-lg mb-5 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Zap className="w-5 h-5 text-orange-500" />
            </motion.div>
            Quick Recharge
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {QUICK.map((amt, i) => (
              <motion.button 
                key={amt} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRecharge(amt)}
                disabled={recharging !== null}
                className="py-3.5 rounded-2xl border-2 border-orange-200 bg-orange-50 text-orange-600 font-extrabold text-sm transition disabled:opacity-50 shadow-sm"
              >
                ₹{amt}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-3">
            <motion.div 
              whileFocus={{ scale: 1.02 }}
              className="flex-1 flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-orange-300 transition-colors"
            >
              <span className="text-gray-500 font-bold text-lg">₹</span>
              <input type="number" placeholder="Enter amount" value={customAmt}
                onChange={e => setCustomAmt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustom()}
                className="flex-1 bg-transparent text-sm font-bold text-gray-800 focus:outline-none placeholder:text-gray-400"
                min={10} />
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCustom} 
              disabled={!customAmt || recharging !== null}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold rounded-2xl disabled:opacity-50 shadow-lg shadow-orange-200"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Plans */}
        <div>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Recharge Plans
          </motion.h3>
          <div ref={plansRef} className="space-y-4">
            {PLANS.map((plan, index) => {
              const total = plan.amount + plan.bonus;
              const isLoading = recharging === total;
              return (
                <motion.div 
                  key={plan.amount}
                  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  transition={{ duration: 0.2 }}
                  className={`plan-card bg-white rounded-3xl p-5 shadow-lg border-2 relative overflow-hidden ${
                    plan.popular ? 'border-orange-500 bg-gradient-to-br from-white to-orange-50/30' : 'border-gray-100'
                  }`}
                >
                  {plan.popular && (
                    <motion.div 
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl shadow-lg"
                    >
                      ⭐ BEST VALUE
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-extrabold text-gray-900">₹{plan.amount}</span>
                        {plan.bonus > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                            className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-extrabold px-3 py-1 rounded-full border border-green-200"
                          >
                            +₹{plan.bonus} bonus
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {plan.bonus > 0 ? `Get ₹${total} total in wallet` : 'Added directly to wallet'}
                      </p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRecharge(total)}
                      disabled={recharging !== null}
                      className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm transition disabled:opacity-50 flex items-center gap-2 shadow-md ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recharge'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-6 shadow-lg border border-blue-100"
        >
          <h3 className="font-extrabold text-gray-900 text-lg mb-5">How it works</h3>
          <div className="space-y-4">
            {[
              { icon: '💳', text: 'Recharge your wallet with any amount' },
              { icon: '🍱', text: 'Use wallet balance to schedule & lock meals' },
              { icon: '🔒', text: 'Locked meals are deducted from wallet instantly' },
              { icon: '↩️', text: 'Cancelled meals are refunded to wallet' },
            ].map(({ icon, text }, i) => (
              <motion.div 
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 transition-colors"
              >
                <span className="text-2xl w-10 text-center">{icon}</span>
                <p className="text-sm text-gray-700 font-semibold">{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-5 py-4 border border-gray-200"
        >
          <Shield className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <p className="text-xs text-gray-600 font-medium">Payments secured by Razorpay. Wallet balance never expires.</p>
        </motion.div>
      </div>
    </div>
  );
}
