'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { isPWA } from '@/lib/pwaDetect';

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Don't show if already in PWA mode
    if (isPWA()) return;

    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    // Show banner after 3 seconds
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 3000);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support the install prompt
      alert('To install the app:\n\n1. Look for "Add to Home Screen" in your browser menu\n2. Or use the install button in your address bar');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 shadow-2xl border border-orange-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              📱
            </div>
            <div className="flex-1">
              <p className="font-black text-sm leading-tight">Install Tiffica App</p>
              <p className="text-xs text-white/80 mt-0.5">Get faster access & offline features</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-orange-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-orange-50 transition active:scale-95 flex items-center gap-1"
            >
              <Download size={14} />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}