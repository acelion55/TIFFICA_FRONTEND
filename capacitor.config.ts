import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tiffica.app',
  appName: 'Tiffica',
  webDir: 'out',
  ios: {
    contentInset: 'automatic',
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#fff8f0',
      showSpinner: true,
      spinnerColor: '#f97316',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
