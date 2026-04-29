'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import Navbar from '@/components/navbar';
import WalletBar from '@/components/wallet-bar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { isPWA } from '@/lib/pwaDetect';
import { useEffect, useState } from 'react';

const HIDE_SHELL_ROUTES = ['/login', '/signup', '/forgot-password', '/onboarding', '/admin', '/delivery-partner'];
const SHOW_WALLETBAR_ROUTES = ['/home', '/search', '/menu', '/orders', '/subscriptions', '/schedule', '/reorder', '/profile', '/plan', '/subscribe', '/addresses'];
const HIDE_CARTBAR_ROUTES = ['/checkout', '/schedule/menu'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { token } = useAuth();
  const { cart, total } = useCart();
  const [isPWAMode, setIsPWAMode] = useState(false);
  
  const hideShell   = HIDE_SHELL_ROUTES.some(r => pathname?.startsWith(r));
  const showWalletBar = SHOW_WALLETBAR_ROUTES.some(r => pathname?.startsWith(r));
  const hideCartBar = HIDE_CARTBAR_ROUTES.some(r => pathname?.startsWith(r));

  usePushNotifications(token);

  useEffect(() => {
    setIsPWAMode(isPWA());
  }, []);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (hideShell) return <>{children}</>;

  return (
    <div className="relative flex flex-col min-h-screen bg-[#F8F9FB]">
      {showWalletBar && <WalletBar />}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Cart Bar */}
      {totalItems > 0 && !hideCartBar && (
        <div className="fixed bottom-[72px] left-4 right-4 z-[60]">
          <button
            onClick={() => router.push('/checkout')}
            className="w-full flex items-center justify-between bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl active:scale-95 transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {totalItems}
              </div>
              <span className="font-bold text-sm">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base">₹{total.toFixed(0)}</span>
              <ShoppingBag size={18} className="text-orange-400" />
            </div>
          </button>
        </div>
      )}

      {isPWAMode && <Navbar />}
    </div>
  );
}
