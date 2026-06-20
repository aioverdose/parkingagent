import type { NextConfig } from "next";

const REQUIRED_ENV_VARS = [
  "DATABASE_URL", "JWT_SECRET", "RESEND_API_KEY",
  "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_ANNUAL",
  "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY",
  "NEXT_PUBLIC_BASE_URL",
] as const;

// Validate env vars at server start (not during build)
if (process.env.NEXT_PHASE !== "phase-production-build") {
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]?.trim()) {
      console.error(`[ENV] Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
