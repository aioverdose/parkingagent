self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Spot Mining', body: 'You have a new notification' };

  const notification = {
    title: data.title,
    body: data.body,
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url ?? '/profile',
    },
  };

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/profile';
  event.waitUntil(
    clients.openWindow(url)
  );
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
