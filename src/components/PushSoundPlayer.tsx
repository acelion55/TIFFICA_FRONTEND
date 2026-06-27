'use client';

import { useEffect, useRef } from 'react';

export default function PushSoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Preload audio
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.preload = 'auto';
      audioRef.current = audio;
    } catch (e) {
      console.error('Failed to initialize notification audio:', e);
    }

    const handler = (event: MessageEvent) => {
      try {
        const msg = event.data;
        if (!msg) return;
        // Support both direct message and nested data formats
        const type = msg.type || (msg.data && msg.data.type);
        const payload = msg.payload || msg.data || msg;
        if (type === 'PLAY_NOTIFICATION_SOUND' || payload?.playSound) {
          const audio = audioRef.current;
          if (!audio) return;
          try {
            audio.currentTime = 0;
            audio.play().catch(err => {
              // Autoplay may be blocked until user interacts with page
              console.warn('Notification sound blocked:', err?.message || err);
            });
          } catch (err) {
            console.warn('Failed to play notification sound:', err);
          }
        }
      } catch (err) {
        console.error('Push message handler error:', err);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handler);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handler);
      if (audioRef.current) {
        try { audioRef.current.pause(); audioRef.current.src = ''; } catch (e) {}
        audioRef.current = null;
      }
    };
  }, []);

  return null;
}
