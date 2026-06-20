const OSRM_BASE = "https://router.project-osrm.org";
const OSRM_TIMEOUT = 5000;

export interface OsrmResult {
  durationSeconds: number;
  distanceMeters: number;
  durationMinutes: number;
}

export async function getRouteEta(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<OsrmResult | null> {
  const url = `${OSRM_BASE}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT);
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

export async function getRouteEtaBatch(
  origins: Array<{ lat: number; lng: number }>,
  destination: { lat: number; lng: number },
  concurrency = 3,
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
