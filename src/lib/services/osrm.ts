import { env, type RoutingBackend } from "@/lib/env";

const ROUTING_TIMEOUT = 5000;

export interface OsrmResult {
  durationSeconds: number;
  distanceMeters: number;
  durationMinutes: number;
}

async function routeOsrm(
  originLat: number, originLng: number,
  destLat: number, destLng: number,
): Promise<OsrmResult | null> {
  const base = env.OSRM_URL;
  const url = `${base}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ROUTING_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;
    const route = data.routes[0];
    return {
      durationSeconds: route.duration,
      distanceMeters: route.distance,
      durationMinutes: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function routeValhalla(
  originLat: number, originLng: number,
  destLat: number, destLng: number,
): Promise<OsrmResult | null> {
  const base = env.VALHALLA_URL;
  const body = {
    costing: "auto",
    locations: [
      { lat: originLat, lon: originLng },
      { lat: destLat, lon: destLng },
    ],
    directions_options: { units: "kilometres" },
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ROUTING_TIMEOUT);
  try {
    const res = await fetch(`${base}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const leg = data.trip?.legs?.[0];
    if (!leg) return null;
    return {
      durationSeconds: leg.summary?.time ?? 0,
      distanceMeters: (leg.summary?.length ?? 0) * 1000,
      durationMinutes: Math.round((leg.summary?.time ?? 0) / 60),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function getRouter(): typeof routeOsrm {
  switch (env.ROUTING_BACKEND) {
    case "valhalla":
      return routeValhalla;
    case "osrm":
    default:
      return routeOsrm;
  }
}

export async function getRouteEta(
  originLat: number, originLng: number,
  destLat: number, destLng: number,
): Promise<OsrmResult | null> {
  return getRouter()(originLat, originLng, destLat, destLng);
}

export async function getRouteEtaBatch(
  origins: Array<{ lat: number; lng: number }>,
  destination: { lat: number; lng: number },
  concurrency = 8,
): Promise<Array<{ originIndex: number; eta: OsrmResult | null }>> {
  const results: Array<{ originIndex: number; eta: OsrmResult | null }> = [];
  for (let i = 0; i < origins.length; i += concurrency) {
    const batch = origins.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((o) => getRouteEta(o.lat, o.lng, destination.lat, destination.lng)),
    );
    batch.forEach((_, idx) => {
      results.push({ originIndex: i + idx, eta: batchResults[idx] });
    });
  }
  return results;
}

export const ETA_TOLERANCE_MINUTES = 15;

export function computeTimeFitScore(
  etaMinutes: number,
  expectedDepartureMinutes: number,
  toleranceMinutes: number = ETA_TOLERANCE_MINUTES,
): number {
  const diff = Math.abs(etaMinutes - expectedDepartureMinutes);
  if (diff <= toleranceMinutes) {
    return 1 - diff / (toleranceMinutes * 2);
  }
  return 0;
}
