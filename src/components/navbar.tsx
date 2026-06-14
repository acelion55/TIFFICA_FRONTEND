'use client';

import Link from 'next/link';
import { Home, Calendar, CreditCard, RotateCcw, ShoppingBag, UtensilsCrossed, Store, TrendingUp, MoreHorizontal, User, Bell, X, Tag, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

const userNavItems = [
  { href: '/home',          label: 'HOME',         icon: Home },
  { href: '/schedule',      label: 'SCHEDULE',     icon: Calendar },
  { href: '/subscriptions', label: 'SUBSCRIPTION', icon: CreditCard },
  { href: '/reorder',       label: 'REORDER',      icon: RotateCcw },
];

const adminNavItems = [
  { href: '/admin?tab=orders',      label: 'ORDERS',     icon: ShoppingBag },
  { href: '/admin?tab=menu',        label: 'MENU',       icon: UtensilsCrossed },
  { href: '/admin?tab=kitchens',    label: 'KITCHEN',    icon: Store },
  { href: '/admin?tab=stats',       label: 'ANALYTICS',  icon: TrendingUp },
];

const adminMoreItems = [
  { href: '/admin?tab=users',         label: 'USERS',         icon: User },
  { href: '/admin?tab=subscriptions', label: 'SUBSCRIPTIONS', icon: CreditCard },
  { href: '/admin?tab=schedules',     label: 'SCHEDULES',     icon: Calendar },
  { href: '/admin?tab=notifications', label: 'NOTIFICATIONS', icon: Bell },
  { href: '/admin?tab=coupons',       label: 'COUPONS',       icon: Tag },
  { href: '/admin?tab=legal',         label: 'LEGAL',         icon: FileText },
  { href: '/admin?tab=homestyles',    label: 'HOMESTYLES',    icon: Home },
  { href: '/profile',                 label: 'PROFILE',       icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { token, user } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // All useEffect hooks should be at the top level
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close more menu when route changes
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  // Close more menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMore(false);
      }
    };
    
    if (showMore) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMore]);

  if (!isClient) return null;

  // Hide navbar on auth-related pages to avoid flashing UI while auth state resolves
  const hideOn = ['/login', '/signup', '/forgot-password', '/onboarding', '/checkout'];
  if (hideOn.includes(pathname || '')) return null;

  // Only show navbar for authenticated users (Capacitor app users)
  if (!token) return null;

  // Admin dashboard has its own sidebar (desktop) and floating nav (mobile)
  if (pathname?.startsWith('/admin')) return null;

  const toggleMore = () => {
    setShowMore(!showMore);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'kitchen-owner';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const moreItems = isAdmin ? adminMoreItems : []; // Remove more items for regular users
  const showMoreButton = moreItems.length > 0;

  return (
    <>
      {/* More Items Overlay & Panel - For both Admin and Users */}
      {showMore && showMoreButton && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setShowMore(false)}
          />
          
          {/* More Items Panel */}
          <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-200 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">More Options</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            
            {/* Items Grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {moreItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname?.startsWith(href.split('?')[0]);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-orange-50 border border-orange-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <Icon
                        size={24}
                        className={isActive ? 'text-orange-500' : 'text-gray-600'}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                      <span className={`text-xs font-medium mt-2 text-center leading-tight ${
                        isActive ? 'text-orange-500' : 'text-gray-600'
                      }`}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Navigation */}
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
                className="flex flex-col items-center justify-center flex-1 gap-1 relative"
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
                )}
                
                <Icon
                  size={22}
                  className={isActive ? 'text-orange-500' : 'text-gray-400'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-[9px] font-bold tracking-wide leading-none ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
          
          {/* More Button - Only for Admins */}
          {showMoreButton && isAdmin && (
            <button
              onClick={toggleMore}
              className="flex flex-col items-center justify-center flex-1 gap-1 relative"
            >
              {/* Active indicator for more button */}
              {showMore && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
              )}
              
              <div className={`transition-transform duration-200 ${
                showMore ? 'rotate-90' : 'rotate-0'
              }`}>
                <MoreHorizontal
                  size={22}
                  className={showMore ? 'text-orange-500' : 'text-gray-400'}
                  strokeWidth={showMore ? 2.5 : 1.8}
                />
              </div>
              <span className={`text-[9px] font-bold tracking-wide leading-none ${
                showMore ? 'text-orange-500' : 'text-gray-400'
              }`}>
                MORE
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}