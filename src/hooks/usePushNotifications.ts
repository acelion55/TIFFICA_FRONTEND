'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { API_URL } from '@/lib/config';

async function saveFcmToken(authToken: string, fcmToken: string, platform: string) {
  const response = await fetch(`${API_URL}/notifications/fcm-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      fcmToken,
      platform,
      deviceId: `${platform}-${navigator.userAgent}`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save FCM token');
  }
}

export function usePushNotifications(token: string | null) {
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;
    const listenerHandles: PluginListenerHandle[] = [];

    const registerForPushNotifications = async () => {
      try {
        const registrationListener = await PushNotifications.addListener(
          'registration',
          async registration => {
            if (cancelled || !registration.value) return;

            localStorage.setItem('tiffica_fcm_token', registration.value);
            await saveFcmToken(token, registration.value, Capacitor.getPlatform());
            console.log('FCM token generated and saved:', registration.value);
          }
        );
        listenerHandles.push(registrationListener);

        const errorListener = await PushNotifications.addListener(
          'registrationError',
          error => {
            console.error('FCM token registration failed:', error);
          }
        );
        listenerHandles.push(errorListener);

        const receivedListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          notification => {
            console.log('Push notification received:', notification);
          }
        );
        listenerHandles.push(receivedListener);

        const actionListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          action => {
            console.log('Push notification action performed:', action);
          }
        );
        listenerHandles.push(actionListener);

        const permission = await PushNotifications.checkPermissions();
        const permissionResult =
          permission.receive === 'granted'
            ? permission
            : await PushNotifications.requestPermissions();

        if (permissionResult.receive !== 'granted') {
          console.warn('Push notification permission was not granted.');
          return;
        }

        await PushNotifications.register();
      } catch (error) {
        console.error('Failed to initialize FCM notifications:', error);
      }
    };

    registerForPushNotifications();

    return () => {
      cancelled = true;
      listenerHandles.forEach(handle => {
        handle.remove();
      });
    };
  }, [token]);
}
