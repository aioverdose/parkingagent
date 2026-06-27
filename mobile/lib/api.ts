import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://spotimization.vercel.app";
const TOKEN_KEY = "spotimization_session";

export async function getStoredSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.removeItemAsync(TOKEN_KEY);
}

function parseSetCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/spotimization_session=([^;]+)/);
  return match?.[1] ?? null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getStoredSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Cookie"] = `spotimization_session=${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "omit",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  // Capture session cookie from login response
  if (path === "/api/auth/login" || path === "/api/auth/register") {
    const sessionToken = parseSetCookie(res.headers.get("Set-Cookie"));
    if (sessionToken) {
      await storeSessionToken(sessionToken);
    }
  }

  return data.data ?? data;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...data, completedModuleIds: [] }),
    }),

  me: () => request<any>("/api/auth/me"),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  updateProfile: (data: Partial<any>) =>
    request<any>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  findSpots: (lat: number, lng: number) =>
    request<any[]>(`/api/pairing/find?lat=${lat}&lng=${lng}`),

  offerSpot: (data: {
    latitude: number;
    longitude: number;
    address?: string;
    expectedDeparture?: string;
    vehicleType?: string;
    vehicleSize?: string;
  }) =>
    request<any>("/api/pairing/offer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myMatches: () => request<any[]>("/api/matches/my"),

  acceptMatch: (matchId: string) =>
    request<any>(`/api/matching/confirm/${matchId}`, { method: "POST" }),

  cancelMatch: (matchId: string) =>
    request<any>(`/api/matching/cancel/${matchId}`, { method: "POST" }),

  updateLocation: (matchId: string, lat: number, lng: number) =>
    request<any>("/api/live/location", {
      method: "POST",
      body: JSON.stringify({ matchId, lat, lng }),
    }),

  confirmArrival: (matchId: string) =>
    request<any>("/api/live/confirm-arrival", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    }),

  startDeparture: (matchId: string) =>
    request<any>("/api/live/start-departure", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    }),

  completeExchange: (matchId: string) =>
    request<any>("/api/live/complete-exchange", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    }),

  getSchedules: () => request<any[]>("/api/schedules"),

  createSchedule: (data: Partial<any>) =>
    request<any>("/api/schedules", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  activateBeacon: (data: { departureTime: string; lat: number; lng: number }) =>
    request<any>("/api/beacon/activate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myBeacons: () => request<any[]>("/api/beacon/my-beacons"),

  premiumStatus: () => request<any>("/api/premium/status"),
  createCheckout: () =>
    request<{ url: string }>("/api/stripe/checkout", { method: "POST" }),
  createPortal: () =>
    request<{ url: string }>("/api/stripe/portal", { method: "POST" }),
};
