'use client';

import { useState, useEffect } from 'react';
import { isPWA } from '@/lib/pwaDetect';

export function useInstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isPWAMode, setIsPWAMode] = useState(false);

  useEffect(() => {
    setIsPWAMode(isPWA());

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isPWAMode) {
      // Already in PWA mode, redirect to login
      window.location.href = '/login';
      return;
    }

    if (!deferredPrompt) {
      // Fallback: Show manual install instructions
      alert('To install:\n\n1. Click the menu (⋮) in your browser\n2. Select "Install app" or "Add to Home screen"\n3. Follow the prompts');
      return;
    }

    setIsInstalling(true);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Wait a bit for installation
        setTimeout(() => {
          setIsInstalling(false);
          // Redirect will happen automatically when app opens
        }, 2000);
      } else {
        setIsInstalling(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      setIsInstalling(false);
    }
  };

  return { handleInstall, isInstalling, isPWAMode };
}
