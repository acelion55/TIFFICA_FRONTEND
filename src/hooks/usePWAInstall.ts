'use client';

// Stub hook - PWA install not needed for Capacitor apps
export function usePWAInstall() {
  return {
    canInstall: false,
    install: () => {
      console.log('Using Capacitor app - install not needed');
    }
  };
}
