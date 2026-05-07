// Admin Notification Sound System
// Place this in: TIFFICA_FRONTEND/src/lib/notificationSound.ts

export class NotificationSound {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio('/sounds/notification.mp3');
      this.audio.preload = 'auto';
      this.audio.volume = 0.7; // Adjust volume (0.0 to 1.0)
    }
  }

  async play() {
    if (!this.audio || !this.isEnabled) return;
    
    try {
      // Reset audio to beginning
      this.audio.currentTime = 0;
      await this.audio.play();
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Notification types and messages
export const NOTIFICATION_TYPES = {
  NEW_ORDER: {
    title: '🍽️ New Order Received!',
    sound: true,
    priority: 'high'
  },
  NEW_SCHEDULE: {
    title: '📅 New Schedule Order!',
    sound: true,
    priority: 'high'
  },
  NEW_SUBSCRIPTION: {
    title: '💳 New Subscription Purchase!',
    sound: true,
    priority: 'medium'
  },
  NEW_USER: {
    title: '👤 New User Registered!',
    sound: true,
    priority: 'low'
  },
  USER_SIGNUP: {
    title: '✨ New User Signup!',
    sound: true,
    priority: 'low'
  }
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

// Singleton instance
export const notificationSound = new NotificationSound();

// Show notification with sound (admin panel only)
export const showAdminNotification = async (type: NotificationType, message: string, count?: number) => {
  const config = NOTIFICATION_TYPES[type];
  
  // Play sound if enabled
  if (config.sound) {
    await notificationSound.play();
  }
  
  // Show browser notification if permission granted
  if (Notification.permission === 'granted') {
    const body = count ? `${count} new ${message}` : message;
    new Notification(config.title, {
      body,
      icon: '/logo.jpeg',
      badge: '/logo.jpeg',
      tag: type, // Prevents duplicate notifications
      requireInteraction: config.priority === 'high'
    });
  }
};