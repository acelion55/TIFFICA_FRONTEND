'use client';

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect IOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('[PWA] beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Always show the button if not standalone, to allow manual install/instructions
    if (!standalone) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      // Show the native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setCanInstall(false);
    } else if (isIOS) {
      alert('To install Tiffica: tap the Share button (square with arrow) and then select "Add to Home Screen"');
    } else {
      // Fallback for other browsers where prompt isn't available
      alert('Open your browser settings/menu and select "Install" or "Add to Home Screen" to get the Tiffica App.');
    }
  };

  return { canInstall: canInstall && !isStandalone, install };
}
