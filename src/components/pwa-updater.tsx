'use client';
import { useEffect, useState } from 'react';

export default function PWAUpdater() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowPrompt(true);
              }
            });
          }
        });

        setInterval(() => reg.update(), 60000);
      });
    }
  }, []);

  const updateApp = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      registration.waiting.addEventListener('statechange', e => {
        if ((e.target as ServiceWorker).state === 'activated') window.location.reload();
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
      <span>New version available!</span>
      <button onClick={updateApp} className="bg-white text-orange-500 px-4 py-2 rounded font-semibold">
        Update
      </button>
    </div>
  );
}
