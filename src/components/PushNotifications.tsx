"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function PushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    } catch {
      // Not supported
    }
  }

  async function subscribe() {
    if (!supported) return;
    setLoading(true);

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          await fetchVapidKey(),
        ) as unknown as string,
      });

      await api.post("/api/push/subscribe", {
        endpoint: sub.endpoint,
        auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
        p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
        userAgent: navigator.userAgent,
      });

      setSubscribed(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        alert("Please allow notifications in your browser settings.");
      }
    }
    setLoading(false);
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.post("/api/push/unsubscribe", { endpoint: sub.endpoint });
        await sub.unsubscribe();
        setSubscribed(false);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function fetchVapidKey(): Promise<string> {
    const { publicKey } = await api.get<{ publicKey: string }>("/api/push/vapid-key");
    return publicKey;
  }

  if (!supported) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-left mt-4">
      <h3 className="font-semibold text-sm text-[#202124] mb-2">Push Notifications</h3>
      <p className="text-xs text-[#757575] mb-3">
        Get instant alerts when you&apos;re matched with a spot or a member is arriving.
      </p>
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
          subscribed
            ? "bg-gray-100 text-[#757575] hover:bg-gray-200"
            : "bg-[#4285F4] text-white hover:bg-[#1A73E8]"
        } disabled:opacity-50`}
      >
        {loading ? "..." : subscribed ? "Disable Notifications" : "Enable Notifications"}
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
