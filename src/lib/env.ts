function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export type RoutingBackend = "osrm" | "valhalla";

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  RESEND_API_KEY: required("RESEND_API_KEY"),
  STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_MONTHLY: required("STRIPE_PRICE_MONTHLY"),
  STRIPE_PRICE_ANNUAL: required("STRIPE_PRICE_ANNUAL"),
  VAPID_PUBLIC_KEY: required("VAPID_PUBLIC_KEY"),
  VAPID_PRIVATE_KEY: required("VAPID_PRIVATE_KEY"),
  NEXT_PUBLIC_BASE_URL: required("NEXT_PUBLIC_BASE_URL"),
  CRON_SECRET: optional("CRON_SECRET", ""),
  ROUTING_BACKEND: optional("ROUTING_BACKEND", "osrm") as RoutingBackend,
  VALHALLA_URL: optional("VALHALLA_URL", "http://localhost:8002"),
  OSRM_URL: optional("OSRM_URL", "https://router.project-osrm.org"),
} as const;
