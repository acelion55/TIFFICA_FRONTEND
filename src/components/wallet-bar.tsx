'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter, usePathname } from 'next/navigation';
import { Wallet, MapPin, ChevronDown, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileClient from '@/app/profile/profile-client';

const HERO_PAGES = ['/home'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TYPE_EMOJI: Record<string, string> = { info: 'ℹ️', offer: '🎁', order: '📦', alert: '⚠️' };

export default function WalletBar() {
  const { user }                   = useAuth();
  const { location, setShowModal } = useLocation();
  const router                     = useRouter();
  const pathname                   = usePathname();
  const [scrolled, setScrolled]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifs, setNotifs]         = useState<any[]>([]);
  const [notifLoaded, setNotifLoaded] = useState(false);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const isHeroPage = HERO_PAGES.some(p => pathname?.startsWith(p));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    setScrolled(window.scrollY > 10);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile on route change
  useEffect(() => { setProfileOpen(false); }, [pathname]);

  if (!user) return null;

  const showBg = !isHeroPage || scrolled;
  const initials = user.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background:     showBg ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: showBg ? 'blur(12px)' : 'none',
          boxShadow:      showBg ? '0 1px 12px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5">

          {/* Address pill */}
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 active:scale-95 transition-all duration-300 ${
              showBg ? 'bg-gray-100 border border-gray-200' : 'bg-white/15 border border-white/25 backdrop-blur-md'
            }`}
          >
            <MapPin size={14} className={`flex-shrink-0 transition-colors duration-300 ${showBg ? 'text-orange-500' : 'text-orange-400'}`} />
            <div className="min-w-0 max-w-[140px]">
              <p className={`text-[9px] font-bold uppercase tracking-wide leading-none ${showBg ? 'text-gray-400' : 'text-white/60'}`}>
                Deliver to
              </p>
              <p className={`text-xs font-extrabold truncate leading-tight ${showBg ? 'text-gray-900' : 'text-white'}`}>
                {location?.locationName?.split(',')[0] || 'Set location'}
              </p>
            </div>
            <ChevronDown size={13} className={`flex-shrink-0 ${showBg ? 'text-gray-500' : 'text-white/70'}`} />
          </button>

          {/* Right side: wallet + profile (profile only on home) */}
          <div className="flex items-center gap-2">

            {/* Wallet pill */}
            <button
              onClick={() => router.push('/subscriptions')}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 active:scale-95 transition-all duration-300 ${
                showBg ? 'bg-gray-100 border border-gray-200' : 'bg-white/15 border border-white/25 backdrop-blur-md'
              }`}
            >
              <div className="w-5 h-5 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="w-3 h-3 text-white" />
              </div>
              <div className="leading-none">
                <p className={`text-[9px] font-bold uppercase tracking-wide ${showBg ? 'text-gray-400' : 'text-white/60'}`}>
                  Wallet
                </p>
                <p className={`text-sm font-extrabold ${showBg ? 'text-gray-900' : 'text-white'}`}>
                  ₹{(user.walletBalance ?? 0).toFixed(0)}
                </p>
              </div>
            </button>

            {/* Profile avatar — only on home */}
            {isHeroPage && (
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-md active:scale-95 transition flex-shrink-0"
              >
                <span className="text-white text-xs font-extrabold">{initials}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile slide-in panel */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="flex justify-end p-4 border-b border-gray-100">
                <button onClick={() => setProfileOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <ProfileClient />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
