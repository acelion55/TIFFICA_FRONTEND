'use client';

import { useEffect } from 'react';
import { initializeCapacitor } from '@/lib/capacitor';

export default function CapacitorInit() {
  useEffect(() => {
    // Initialize Capacitor on app load
    initializeCapacitor();
  }, []);

  return null;
}
