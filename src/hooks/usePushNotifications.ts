'use client';

import { useEffect } from 'react';

const API_URL = 'https://tifficaapp-1.onrender.com/api';

export function usePushNotifications(token: string | null) {
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;

    // Service workers and push notifications are not available in Capacitor apps
    // Skip service worker setup
  }, [token]);
}
