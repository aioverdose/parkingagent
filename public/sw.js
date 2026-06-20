self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "Parking Agent", body: "You have a new notification" };

  const options = {
    body: data.body,
    icon: "/pwa-icon.svg",
    badge: "/pwa-icon.svg",
    vibrate: [200, 100, 200],
    data: {
      url: data.url ?? "/dashboard",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients.openWindow(url),
  );
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
