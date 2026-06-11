import { useEffect, useState, useCallback } from 'react';

interface UpdateInfo {
  available: boolean;
  version: string;
  message: string;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    available: false,
    version: '',
    message: ''
  });
  const [updateReady, setUpdateReady] = useState(false);

  // Check for updates every 2 minutes (more frequently)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkForUpdates = async () => {
      try {
        // Fetch version.json from server with cache busting
        const response = await fetch('/version.json?t=' + Date.now(), {
          cache: 'no-store',
          headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' }
        });
        
        if (!response.ok) {
          console.log('[Update Check] Version check failed:', response.status);
          return;
        }

        const data = await response.json();
        const currentVersion = localStorage.getItem('appVersion') || '0.0.0';

        console.log('[Update Check] Current:', currentVersion, 'Available:', data.version);

        // If versions don't match, update is available
        if (data.version !== currentVersion) {
          console.log('[Update Check] Update available!');
          setUpdateInfo({
            available: true,
            version: data.version,
            message: data.message || 'A new version is available'
          });

          // Update service worker cache
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'UPDATE_CACHE_VERSION',
              version: data.version
            });
          }
        }
      } catch (error) {
        console.log('[Update Check] Failed:', error);
      }
    };

    // Check immediately on load
    checkForUpdates();

    // Check every 2 minutes (120 seconds) instead of 5
    const interval = setInterval(checkForUpdates, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for service worker updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleServiceWorkerUpdate = () => {
      console.log('[Update Check] Service worker updated');
      setUpdateReady(true);
      setUpdateInfo(prev => ({
        ...prev,
        available: true,
        message: 'App update ready! Please refresh to apply changes.'
      }));
    };

    // Also listen for controller change
    const handleControllerChange = () => {
      console.log('[Update Check] Controller changed');
      setUpdateReady(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    
    // Check if there's already a waiting service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg.waiting) {
          console.log('[Update Check] Waiting service worker found');
          setUpdateReady(true);
        }
      });
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    console.log('[Update Check] Applying update...');
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const sw = navigator.serviceWorker.controller;
      console.log('[Update Check] Sending SKIP_WAITING to service worker');
      sw.postMessage({ type: 'SKIP_WAITING' });
    }

    // Store new version
    if (updateInfo.version) {
      localStorage.setItem('appVersion', updateInfo.version);
    }

    // Force reload after a short delay to ensure SW is updated
    setTimeout(() => {
      console.log('[Update Check] Reloading page...');
      window.location.reload();
    }, 500);
  }, [updateInfo.version]);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo({
      available: false,
      version: '',
      message: ''
    });
  }, []);

  return {
    updateAvailable: updateInfo.available,
    updateVersion: updateInfo.version,
    updateMessage: updateInfo.message,
    updateReady,
    applyUpdate,
    dismissUpdate
  };
}
