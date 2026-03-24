self.addEventListener('push', event => {
  let data = { title: 'Tiffica', body: 'You have a new notification' };
  try { data = JSON.parse(event.data.text()); } catch {}

  const typeIcons = { offer: '🎁', order: '📦', alert: '⚠️', info: 'ℹ️' };
  const icon = typeIcons[data.type] || 'ℹ️';

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: data.notifId || 'tiffica-notif',
      data: { url: '/home' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/home';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
