'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPWA } from '@/lib/pwaDetect';

const PWA_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/profile',
  '/orders',
  '/addresses',
  '/notifications',
  '/schedule',
  '/subscriptions',
  '/checkout',
  '/reorder',
  '/plan',
  '/forgot-password'
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

    if (isProtectedRoute && !isPWAMode) {
      router.push('/');
    }
  }, [pathname, router, isClient]);

  if (!isClient) return <>{children}</>;

  const isPWAMode = isPWA();
  const isProtectedRoute = PWA_ONLY_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isPWAMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Download Our App</h2>
          <p className="text-gray-600 mb-6">
            This feature is only available in our app. Please install Tiffica app to continue.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
