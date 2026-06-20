import { NextResponse } from "next/server";

interface Window {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Window>();

const FIVE_MIN = 5 * 60 * 1000;

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function rateLimit(
  req: Request,
  limit: number,
  windowMs: number = FIVE_MIN,
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getIp(req);
  const key = `${ip}:${new URL(req.url).pathname}`;

  const now = Date.now();
  let entry = stores.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    stores.set(key, entry);
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  entry.count++;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function rateLimitedResponse(resetAt: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    },
  );
}

// Periodically evict expired entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of stores) {
      if (now >= entry.resetAt) stores.delete(key);
    }
  }, 60_000);
  if (stores.size > 10000) stores.clear();
}
