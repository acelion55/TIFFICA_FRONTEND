'use client';
import { useEffect, useState } from 'react';

export default function PWAUpdater() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [autoUpdateTimer, setAutoUpdateTimer] = useState<number>(5);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('[PWA] Service Worker registered');
        setRegistration(reg);
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          console.log('[PWA] Update found!');
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version installed, showing prompt');
                setShowPrompt(true);
              }
            });
          }
        });

        // Check for updates every 30 seconds
        const updateInterval = setInterval(() => {
          console.log('[PWA] Checking for updates...');
          reg.update();
        }, 30000);

        // Initial update check
        reg.update();

        return () => clearInterval(updateInterval);
      }).catch(err => {
        console.error('[PWA] Service Worker registration failed:', err);
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Controller changed, reloading page...');
        window.location.reload();
      });
    }
  }, []);

  // Auto-update countdown
  useEffect(() => {
    if (showPrompt && autoUpdateTimer > 0) {
      const timer = setTimeout(() => {
        setAutoUpdateTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showPrompt && autoUpdateTimer === 0) {
      // Auto update after countdown
      updateApp();
    }
  }, [showPrompt, autoUpdateTimer]);

  const updateApp = () => {
    console.log('[PWA] Updating app...');
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // The page will reload automatically via controllerchange event
    }
  };

  const dismissUpdate = () => {
    setShowPrompt(false);
    setAutoUpdateTimer(5);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl shadow-2xl z-[9999] animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-bold text-lg mb-1">🎉 New Update Available!</p>
          <p className="text-sm opacity-90">
            Auto-updating in {autoUpdateTimer} seconds...
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={dismissUpdate} 
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-semibold text-sm transition-all"
          >
            Later
          </button>
          <button 
            onClick={updateApp} 
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-50 transition-all"
          >
            Update Now
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${((5 - autoUpdateTimer) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
