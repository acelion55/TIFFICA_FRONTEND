'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CouponPopup() {
  const { token } = useAuth();
  const { location } = useLocation();
  const [coupon, setCoupon] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCoupon = async () => {
    if (!token || !location) return;

    try {
      const area = location.locationName?.split(',')[0]?.trim();
      const res = await fetch(`${API_URL}/coupons/user/popup?area=${encodeURIComponent(area || '')}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.coupon) {
        setCoupon(data.coupon);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Failed to fetch coupon:', error);
    }
  };

  useEffect(() => {
    if (!token || !location) return;

    // Check immediately
    fetchCoupon();

    // Check frequently every 5 seconds for new coupons
    const interval = setInterval(() => {
      fetchCoupon();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [token, location]);

  const handleCopy = () => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && coupon && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Coupon Image or Gradient */}
              {coupon.couponImage ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={coupon.couponImage}
                    alt="Coupon"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 opacity-20"
                  >
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="relative z-10"
                  >
                    <Tag className="w-20 h-20 text-white drop-shadow-lg" />
                  </motion.div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">
                      🎉 Special Offer
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}% OFF` 
                      : `₹${coupon.discountValue} OFF`}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    {coupon.description}
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                    <p className="text-xs text-blue-700 font-semibold">
                      🛍️ Valid on all instant orders
                    </p>
                  </div>

                  {coupon.minOrderAmount > 0 && (
                    <p className="text-xs text-gray-500 mb-4">
                      Min order: ₹{coupon.minOrderAmount}
                    </p>
                  )}

                  {/* Coupon Code */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-2xl p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-1 text-center">Use Code</p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-2xl font-black text-purple-600 tracking-wider">
                        {coupon.code}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={() => {
                        handleCopy();
                        setTimeout(handleClose, 1000);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition"
                    >
                      Copy & Use
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
