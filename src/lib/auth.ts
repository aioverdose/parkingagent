import { api, type AuthUser } from "./api";

const AUTH_KEY = "parking_agent_auth";

function storeUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  try {
    const data = await api.post<{ user: AuthUser }>("/api/auth/login", {
      email,
      password,
    });
    storeUser(data.user);
    return data.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    clearAuth();
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await api.get<{ user: AuthUser }>("/api/auth/me");
    if (data.user) {
      storeUser(data.user);
    }
    return data.user;
  } catch {
    clearAuth();
    return null;
  }
}

export async function signup(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  completedModuleIds?: string[];
}): Promise<AuthUser | null> {
  try {
    const data = await api.post<{ user: AuthUser }>("/api/auth/register", params);
    storeUser(data.user);
    return data.user;
  } catch {
    return null;
  }
}

export { getStoredUser, clearAuth };

export function isLoggedIn(): boolean {
  return getStoredUser() !== null;
}

export function currentUserIsAdmin(): boolean {
  const user = getStoredUser();
  return user !== null && user.isAdmin;
}

// Re-export for convenience
export type { AuthUser } from "./api";
