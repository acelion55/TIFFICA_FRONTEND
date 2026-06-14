import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export async function initializeCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await SplashScreen.hide();
  } catch (e) {
    console.log('SplashScreen error:', e);
  }

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#f97316' });
  } catch (e) {
    console.log('StatusBar error:', e);
  }

  // Handle app lifecycle events
  try {
    App.addListener('pause', () => console.log('App paused'));
    App.addListener('resume', () => console.log('App resumed'));
    App.addListener('backButton', () => console.log('Back button pressed'));
  } catch (e) {
    console.log('App listener error:', e);
  }
}

export function isNative() {
  return Capacitor.isNativePlatform();
}

export function getPlatform() {
  return Capacitor.getPlatform();
}
