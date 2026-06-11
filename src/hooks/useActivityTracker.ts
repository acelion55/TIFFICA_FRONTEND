'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';

export function useActivityTracker() {
  const { user } = useAuth();
  const lastActivityRef = useRef<number>(0);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    // Track user as active when component mounts
    trackActivity(true);
    console.log(`📈 Started tracking user activity for ${user.name} (${user._id})`);

    // Set up activity tracking
    const handleActivity = () => {
      const now = Date.now();
      // Only send update if more than 30 seconds have passed
      if (now - lastActivityRef.current > 30000) {
        trackActivity(true);
        lastActivityRef.current = now;
      }
    };

    // Listen for user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set up heartbeat to keep user active (every 90 seconds)
    heartbeatRef.current = setInterval(() => {
      trackActivity(true);
    }, 90000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackActivity(true);
      } else {
        trackActivity(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track user as inactive when component unmounts
    return () => {
      console.log(`📉 Stopped tracking user activity for ${user.name}`);
      trackActivity(false);
      
      // Clear event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clear heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [user?._id]);

  const trackActivity = async (isActive: boolean) => {
    if (!user?._id) return;

    try {
      await fetch(`${API_URL}/track-user-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          isActive: isActive,
          source: 'front-app', // Identify this as coming from front folder
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Activity tracking failed:', error);
    }
  };

  return null; // This hook doesn't return anything visible
}