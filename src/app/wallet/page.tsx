'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Wallet, Plus, CheckCircle, Zap, Shield, Loader2, TrendingUp, CreditCard, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { openRazorpay } from '@/hooks/useRazorpay';
import { useToast } from '@/context/ToastContext';

const API_URL = 'https://tifficaapp-1.onrender.com/api';

const PLANS = [
  { amount: 199,  bonus: 0,   popular: false },
  { amount: 499,  bonus: 25,  popular: true  },
  { amount: 999,  bonus: 75,  popular: false },
  { amount: 1999, bonus: 200, popular: false },
];
const QUICK = [100, 200, 500, 1000];

export default function WalletPage() {
  const { token, user, updateUser } = useAuth();
  const router = useRouter();
  const [balance, setBalance]       = useState(user?.walletBalance ?? 0);
  const [recharging, setRecharging] = useState<number | null>(null);
  const [customAmt, setCustomAmt]   = useState('');
  const [success, setSuccess]       = useState<number | null>(null);
  const [error, setError]           = useState('');
  const { addToast } = useToast();

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

  const handleRecharge = async (payAmount: number, walletCredit?: number) => {
    if (!token || recharging !== null) return;
    const credit = walletCredit ?? payAmount;
    const bonus = credit - payAmount;
    setRecharging(payAmount);
    setError('');

    const description =
      bonus > 0
        ? `Tiffica Wallet ₹${payAmount} (+₹${bonus} bonus → ₹${credit} in wallet)`
        : `Tiffica Wallet Recharge ₹${payAmount}`;

    try {
      await openRazorpay({
        amount: payAmount,
        description,
        token,
        userName:  user?.name,
        userEmail: user?.email,
        userPhone: user?.phone,
        onSuccess: async (paymentId) => {
          const res = await fetch(`${API_URL}/payments/wallet-credit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              amount: credit,
              payAmount,
              bonus: bonus > 0 ? bonus : 0,
              paymentId,
            }),
          });
          if (res.ok) {
            const d = await res.json();
            setBalance(d.walletBalance);
            updateUser(d.user);
            setSuccess(credit);
            addToast(`Successfully recharged ₹${credit}`, 'success');
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
      <div className="px-6 pt-20 space-y-6">
        
        {/* Balance Card */}
        <div ref={balanceRef} className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-orange-500 rounded-full blur-[80px] opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 opacity-60">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Available Balance</span>
            </div>
            <h1 className="text-5xl font-black mb-1 leading-none tracking-tight">₹{balance.toFixed(0)}</h1>
            <p className="text-xs font-bold text-orange-400">Total savings through wallet: ₹0</p>
          </div>
        </div>

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
          className="bg-white rounded-[2rem] p-6 shadow-lg border border-orange-100"
        >
          <h3 className="font-extrabold text-gray-900 text-lg mb-5 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Quick Recharge
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {QUICK.map((amt) => (
              <motion.button 
                key={amt} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRecharge(amt)}
                disabled={recharging !== null}
                className="py-3.5 rounded-2xl border-2 border-orange-200 bg-orange-50 text-orange-600 font-extrabold text-sm transition disabled:opacity-50"
              >
                ₹{amt}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 focus-within:border-orange-300 transition-colors">
              <span className="text-gray-500 font-bold text-lg">₹</span>
              <input type="number" placeholder="Enter amount" value={customAmt}
                onChange={e => setCustomAmt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustom()}
                className="flex-1 bg-transparent text-sm font-bold text-gray-800 focus:outline-none placeholder:text-gray-400"
                min={10} />
            </div>
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
        <div ref={plansRef} className="space-y-4">
          <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Special Bonus Plans
          </h3>
          {PLANS.map((plan) => {
            const walletTotal = plan.amount + plan.bonus;
            const isLoading = recharging === plan.amount;
            return (
              <motion.div 
                key={plan.amount}
                className={`plan-card bg-white rounded-[2rem] p-5 shadow-lg border-2 relative overflow-hidden ${
                  plan.popular ? 'border-orange-500' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                    Popular
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Pay Amount</p>
                    <p className="font-black text-2xl text-gray-900 leading-none">₹{plan.amount}</p>
                  </div>
                  {plan.bonus > 0 && (
                    <div className="text-right">
                      <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-1">Bonus</p>
                      <p className="font-extrabold text-orange-600 text-lg leading-none">+₹{plan.bonus}</p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center mb-5">
                  <p className="font-black text-gray-900 text-xl flex items-center gap-1">
                    ₹{walletTotal} <span className="text-xs text-gray-500 font-bold">in wallet</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecharge(plan.amount, walletTotal)}
                  disabled={recharging !== null}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'
                  } disabled:opacity-50`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Recharge Now'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-5 py-4 border border-gray-200">
          <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Payments secured by Razorpay · Balance never expires</p>
        </div>
      </div>
    </div>
  );
}
