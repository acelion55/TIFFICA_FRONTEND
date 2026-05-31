import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export async function initializeCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Hide splash screen after 3 seconds
    await SplashScreen.hide();
  } catch (error) {
    console.log('Error hiding splash screen:', error);
  }

  try {
    // Set status bar style and color
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#f97316' });
  } catch (error) {
    console.log('Error setting status bar:', error);
  }

  // Handle app pause/resume
  App.addListener('pause', () => {
    console.log('App paused');
  });

  App.addListener('resume', () => {
    console.log('App resumed');
  });

  // Handle back button
  App.addListener('backButton', () => {
    console.log('Back button pressed');
  });
}

export function isNative() {
  return Capacitor.isNativePlatform();
}

export function getPlatform() {
  return Capacitor.getPlatform();
}
