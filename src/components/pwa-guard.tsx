'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPWA } from '@/lib/pwaDetect';

const PWA_ONLY_ROUTES = [
  '/profile',
  '/addresses', 
  '/notifications',
  '/checkout',
  '/plan'
];

// Routes that browser users can access
const BROWSER_ALLOWED_ROUTES = [
  '/login',
  '/signup', 
  '/forgot-password',
  '/',
  '/about',
  '/contact',
  '/blog',
  '/menu',
  '/schedule',
  '/subscriptions',
  '/reorder',
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

  // Show app download message only for PWA-only routes accessed via browser
  if (isProtectedRoute && !isPWAMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Download Our App</h2>
          <p className="text-gray-600 mb-6">
            This feature is only available in our app. Please install Tiffica app to continue.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
