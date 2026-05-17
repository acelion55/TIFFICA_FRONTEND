'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPWA } from '@/lib/pwaDetect';

const PWA_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/home',
  '/profile',
  '/addresses', 
  '/notifications',
  '/checkout',
  '/plan',
  '/schedule',
  '/subscriptions',
  '/reorder',
  '/search'
];

// Routes that browser users can access (marketing/informational pages)
const BROWSER_ALLOWED_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/menu',
  '/admin'
];

export default function PWAGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const isPWAMode = isPWA();
    const isProtectedRoute = PWA_ONLY_ROUTES.some(route => pathname.startsWith(route));
    const isBrowserAllowed = BROWSER_ALLOWED_ROUTES.some(route => pathname.startsWith(route));

    // Only redirect if it's a PWA-only route and not in PWA mode
    if (isProtectedRoute && !isPWAMode) {
      router.push('/login'); // Redirect to login instead of home
    }
  }, [pathname, router, isClient]);

  if (!isClient) return <>{children}</>;

  const isPWAMode = isPWA();
  const isProtectedRoute = PWA_ONLY_ROUTES.some(route => pathname.startsWith(route));
  const isBrowserAllowed = BROWSER_ALLOWED_ROUTES.some(route => pathname.startsWith(route));

  // Show app installation prompt for PWA-only routes accessed via browser
  if (isProtectedRoute && !isPWAMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-orange-100">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">
            📱
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Install Tiffica App</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            To access your account, place orders, and manage subscriptions, please install our app for the best experience.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                // Try to trigger PWA install prompt
                if ('serviceWorker' in navigator) {
                  window.location.reload();
                } else {
                  alert('Please use Chrome, Safari, or Edge to install the app');
                }
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              📲 Install App Now
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              ← Back to Website
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 <strong>How to install:</strong> Look for "Add to Home Screen" or "Install" option in your browser menu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
