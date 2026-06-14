'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartBar() {
  const { cart, total } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Hide on checkout page or if cart is empty
  const hideOn = ['/checkout', '/login', '/signup', '/admin', '/menu', '/schedule'];
  const shouldHide = hideOn.some(path => pathname?.startsWith(path)) || cart.length === 0;

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <button
          onClick={() => router.push('/checkout')}
          className="w-full bg-orange-500 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between group active:scale-95 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
              <ShoppingBag size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-orange-100 uppercase tracking-wider leading-none mb-1">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'} Added
              </span>
              <span className="text-lg font-black leading-none">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl group-hover:bg-white/20 transition-colors border border-white/10">
            <span className="font-bold text-sm tracking-tight">Checkout</span>
            <ArrowRight size={18} strokeWidth={3} />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
