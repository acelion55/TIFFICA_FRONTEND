'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPWA } from '@/lib/pwaDetect';
import { useInstallApp } from '@/hooks/useInstallApp';

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

// Routes that browser users can access (SEO-ranking marketing pages)
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
  
  // IMPORTANT: Call hooks at the top level, before any conditional returns
  const { handleInstall, isInstalling } = useInstallApp();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <>{children}</>;

  const isPWAMode = isPWA();
  
  // Check if current route is a protected/app-only route
  const isAppOnlyRoute = PWA_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

  // BLOCK app-only routes in browser (both mobile and desktop)
  // ONLY allow app routes in PWA mode
  if (isAppOnlyRoute && !isPWAMode) {
    // Show install prompt for app-only routes accessed from browser
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg text-white">
            📱
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">App Required</h2>
          <p className="text-gray-600 mb-8 leading-relaxed font-medium">
            To login and order your tiffin, please install the Tiffica app. The website is for viewing menus and company info only.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-5 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase disabled:opacity-70"
            >
              {isInstalling ? '🚀 Installing...' : '🚀 Install Tiffica App'}
            </button>
            
            <button
              onClick={() => window.location.href = 'https://tiffica.xyz'}
              className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all uppercase"
            >
              ← Back to Web Pages
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
              💡 Tip: Click "Add to Home Screen" in your browser menu to install.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Allow all other routes (web pages) in browser
  return <>{children}</>;
}
