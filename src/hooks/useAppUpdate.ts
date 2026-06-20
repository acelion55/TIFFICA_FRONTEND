import { useEffect, useState, useCallback } from 'react';

interface UpdateInfo {
  available: boolean;
  version: string;
  message: string;
  critical?: boolean;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    available: false,
    version: '',
    message: ''
  });
  const [updateReady, setUpdateReady] = useState(false);

  // Register service worker and handle updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Register the service worker
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('[Update Check] Service Worker registered');

      // Check for updates every 30 seconds (more aggressive)
      const interval = setInterval(() => {
        reg.update();
      }, 30000);

      // Listen for updatefound event
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Update Check] New service worker installed and waiting');
              setUpdateReady(true);
              setUpdateInfo(prev => ({
                ...prev,
                available: true,
                message: 'A new update is ready!'
              }));
              
              // AUTOMATIC UPDATE: If a new worker is waiting, trigger it immediately
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      return () => clearInterval(interval);
    }).catch(err => {
      console.error('[Update Check] SW registration failed:', err);
    });

    // Handle controller change (reloading when new SW takes control)
    const handleControllerChange = () => {
      console.log('[Update Check] Controller changed - reloading for new version');
      // For "automatic update", we reload immediately
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Version check logic (using version.json)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkForVersionUpdate = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now(), {
          cache: 'no-store'
        });
        
        if (!response.ok) return;

        const data = await response.json();
        const currentVersion = localStorage.getItem('appVersion') || '0.0.0';

        if (data.version !== currentVersion) {
          console.log('[Update Check] New version detected:', data.version);
          
          // Store the latest version to be set after reload
          localStorage.setItem('pendingVersion', data.version);
          
          setUpdateInfo({
            available: true,
            version: data.version,
            message: data.message || 'Updating to new version...',
            critical: data.critical
          });

          // Trigger Service Worker update check
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) reg.update();
          }
        } else {
          // Sync current version if match
          localStorage.setItem('appVersion', data.version);
        }
      } catch (error) {
        console.log('[Update Check] Version check failed:', error);
      }
    };

    checkForVersionUpdate();
    const interval = setInterval(checkForVersionUpdate, 60000); // Check version.json every minute

    return () => clearInterval(interval);
  }, []);

  // Cleanup pending version after reload
  useEffect(() => {
    const pending = localStorage.getItem('pendingVersion');
    if (pending) {
      localStorage.setItem('appVersion', pending);
      localStorage.removeItem('pendingVersion');
    }
  }, []);

  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          // If no waiting worker, but we know there's an update, just reload
          window.location.reload();
        }
      });
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo(prev => ({ ...prev, available: false }));
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
