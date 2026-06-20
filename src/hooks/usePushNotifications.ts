'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { API_URL } from '@/lib/config';

// Convert VAPID key for pushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── NATIVE: Save FCM Token ──────────────────────────────────────────
async function saveFcmToken(authToken: string, fcmToken: string, platform: string) {
  await fetch(`${API_URL}/notifications/fcm-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ fcmToken, platform, deviceId: `${platform}-${navigator.userAgent}` }),
  }).catch(err => console.error('Failed to save FCM token:', err));
}

// ── WEB (PWA): Save Web Push Subscription ──────────────────────────
async function saveWebPushSubscription(authToken: string, subscription: PushSubscription) {
  await fetch(`${API_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ subscription }),
  }).catch(err => console.error('Failed to save Web Push subscription:', err));
}

export function usePushNotifications(token: string | null) {
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;

    // ── CASE 1: NATIVE PLATFORM (Android/iOS) ───────────────────────
    if (Capacitor.isNativePlatform()) {
      let cancelled = false;
      const listenerHandles: PluginListenerHandle[] = [];

      const registerNative = async () => {
        try {
          const registrationListener = await PushNotifications.addListener('registration', async r => {
            if (cancelled || !r.value) return;
            localStorage.setItem('tiffica_fcm_token', r.value);
            await saveFcmToken(token, r.value, Capacitor.getPlatform());
          });
          listenerHandles.push(registrationListener);

          const permission = await PushNotifications.checkPermissions();
          if (permission.receive !== 'granted') await PushNotifications.requestPermissions();
          await PushNotifications.register();
        } catch (err) {
          console.error('FCM init failed:', err);
        }
      };

      registerNative();
      return () => {
        cancelled = true;
        listenerHandles.forEach(h => h.remove());
      };
    }

    // ── CASE 2: WEB PLATFORM (PWA) ──────────────────────────────────
    const registerWebPush = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('Push messaging is not supported in this browser');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Get VAPID public key from server
          const vapidRes = await fetch(`${API_URL}/notifications/vapid-public-key`);
          const { publicKey } = await vapidRes.json();
          
          if (!publicKey) return;

          // Request browser permission
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          // Subscribe
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          });
        }

        if (subscription) {
          await saveWebPushSubscription(token, subscription);
          console.log('✅ Web Push subscription saved');
        }
      } catch (err) {
        console.error('Web Push registration failed:', err);
      }
    };

    registerWebPush();
  }, [token]);
}
