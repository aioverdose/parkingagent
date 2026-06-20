import webPush from "web-push";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    "mailto:support@parkingagent.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export { webPush };

export function generateVapidKeys() {
  return webPush.generateVAPIDKeys();
}

export async function sendPushNotification(
  subscription: { endpoint: string; auth: string; p256dh: string },
  title: string,
  body: string,
  url?: string,
) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.auth,
          p256dh: subscription.p256dh,
        },
      },
      JSON.stringify({ title, body, url }),
    );
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode === 410 || err.statusCode === 404) {
      return "expired";
    }
    console.error("[push] Failed to send notification");
  }
}
