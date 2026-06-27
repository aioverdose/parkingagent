"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Check for updates every 30 minutes
        setInterval(() => {
          if (!cancelled) registration.update();
        }, 30 * 60 * 1000);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (installing) {
            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                // New version available — show update prompt
                const event = new CustomEvent("sw-update", {
                  detail: { registration },
                });
                window.dispatchEvent(event);
              }
            });
          }
        });

        console.log("[SW] Registered");
      } catch (err) {
        console.warn("[SW] Registration failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
