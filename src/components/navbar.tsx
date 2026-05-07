'use client';

import Link from 'next/link';
import { Home, Calendar, CreditCard, RotateCcw, ShoppingBag, UtensilsCrossed, Store, Truck, TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const userNavItems = [
  { href: '/home',          label: 'HOME',         icon: Home },
  { href: '/schedule',      label: 'SCHEDULE',     icon: Calendar },
  { href: '/subscriptions', label: 'SUBSCRIPTION', icon: CreditCard },
  { href: '/reorder',       label: 'REORDER',      icon: RotateCcw },
];

const adminNavItems = [
  { href: '/admin?tab=orders',      label: 'ORDERS',     icon: ShoppingBag },
  { href: '/admin?tab=menu',        label: 'MENU',       icon: UtensilsCrossed },
  { href: '/admin?tab=kitchens',    label: 'KITCHEN',    icon: Store, isCenter: true },
  { href: '/admin?tab=deliveries',  label: 'DELIVERY',   icon: Truck },
  { href: '/admin/analytics',       label: 'ANALYTICS',  icon: TrendingUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const { token, user } = useAuth();

  if (!token) return null;

  const isAdmin = user?.role === 'admin' || user?.role === 'kitchen-owner';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]"
    >
      <div className="flex items-stretch justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname?.startsWith(href.split('?')[0]);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 gap-1"
            >
              {typeof Icon === 'string' ? (
                <div className={`text-2xl ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {/* Fallback for any remaining string icons */}
                </div>
              ) : (
                <Icon
                  size={22}
                  className={isActive ? 'text-orange-500' : 'text-gray-400'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              )}
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
