const CACHE = "spotimization-v1";
const STATIC_CACHE = "spotimization-static-v1";
const API_CACHE = "spotimization-api-v1";

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/pwa-icon.svg",
  "/apple-touch-icon.png",
];

const API_PATTERNS = [
  /\/api\/auth\/me/,
  /\/api\/matches\/my/,
  /\/api\/pairing\/find/,
  /\/api\/schedules/,
  /\/api\/premium\/status/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE && k !== CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isApiRequest(url) {
  return API_PATTERNS.some((p) => p.test(url));
}

function isStaticAsset(url) {
  const { pathname } = new URL(url);
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/fonts/") ||
    /\.(js|css|woff2?|png|svg|ico|json)$/.test(pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // API requests: network-first with cache fallback
  if (isApiRequest(url.toString())) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(url.toString())) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithFallback(request, CACHE));
    return;
  }
});

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigation, return offline page
    if (request.mode === "navigate") {
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Offline — Spotimization</title>
        <style>body{background:#0F172A;color:#FFF;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}
        h1{font-size:24px;margin-bottom:8px}p{color:#94A3B8;max-width:320px;line-height:1.5}
        .retry{margin-top:16px;background:#2563EB;color:#FFF;border:none;border-radius:8px;padding:12px 24px;font-size:14px;cursor:pointer}
        </style></head>
        <body>
        <h1>You're offline</h1>
        <p>Spotimization needs a connection to find nearby parking spots. Check your connection and try again.</p>
        <button class="retry" onclick="window.location.reload()">Retry</button>
        </body></html>`,
        { headers: { "Content-Type": "text/html;charset=UTF-8" } },
      );
    }
    return new Response("Offline", { status: 503 });
  }
}

// ── Background Sync ──────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-matches") {
    event.waitUntil(syncMatches());
  }
  if (event.tag === "sync-location") {
    event.waitUntil(syncLocation());
  }
});

async function syncMatches() {
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();
  for (const request of keys) {
    if (request.url.includes("/api/matches/my")) {
      try {
        await fetch(request);
      } catch {}
    }
  }
}

async function syncLocation() {}

// ── Push Notifications ──────────────────────────────

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {
    title: "Spotimization",
    body: "You have a new notification",
  };

  const options = {
    body: data.body,
    icon: "/pwa-icon.svg",
    badge: "/pwa-icon.svg",
    vibrate: [200, 100, 200],
    tag: data.tag || "default",
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url ?? "/matches",
      type: data.type,
      matchId: data.matchId,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/matches";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      return clients.openWindow(url);
    }),
  );
});
