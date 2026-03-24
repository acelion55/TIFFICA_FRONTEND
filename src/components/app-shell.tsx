'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import WalletBar from '@/components/wallet-bar';
import { useAuth } from '@/context/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const HIDE_SHELL_ROUTES = ['/login', '/signup', '/forgot-password', '/onboarding', '/admin'];
const SHOW_WALLETBAR_ROUTES = ['/home', '/search', '/menu', '/orders', '/subscriptions', '/schedule', '/reorder', '/profile', '/plan', '/subscribe', '/addresses'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const { token } = useAuth();
  const hideShell = HIDE_SHELL_ROUTES.some(r => pathname?.startsWith(r));
  const showWalletBar = SHOW_WALLETBAR_ROUTES.some(r => pathname?.startsWith(r));

  usePushNotifications(token);

  if (hideShell) return <>{children}</>;

  return (
    <div className="relative flex flex-col min-h-screen bg-[#F8F9FB]">
      {showWalletBar && <WalletBar />}
      <main className="flex-1 pb-20">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
