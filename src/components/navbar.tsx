'use client';

import Link from 'next/link';
import { Home, CalendarDays, Wallet, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/home',          label: 'HOME',         icon: Home },
  { href: '/schedule',      label: 'SCHEDULE',     icon: CalendarDays },
  { href: '/subscriptions', label: 'SUBSCRIPTION', icon: Wallet },
  { href: '/reorder',       label: 'REORDER',      icon: RefreshCw },
];

export default function Navbar() {
  const pathname = usePathname();
  const { token } = useAuth();

  // Don't show navbar if user is not logged in
  if (!token) return null;

  return (
    <nav
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]"
    >
      <div className="flex items-stretch justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 gap-1"
            >
              <Icon
                size={22}
                className={isActive ? 'text-orange-500' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[9px] font-bold tracking-wide leading-none ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
