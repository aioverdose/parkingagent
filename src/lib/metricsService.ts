export interface SystemMetrics {
  totalMembers: number;
  activeMembers: number;
  totalSpotOffers: number;
  activeMatches: number;
  matchesCompletedToday: number;
  matchesExpiredCancelledToday: number;
  averageMatchTimeSeconds: number;
  averageArrivalTimeMinutes: number;
}

let metricsStore: SystemMetrics = {
  totalMembers: 1284,
  activeMembers: 342,
  totalSpotOffers: 8921,
  activeMatches: 156,
  matchesCompletedToday: 43,
  matchesExpiredCancelledToday: 12,
  averageMatchTimeSeconds: 4.2,
  averageArrivalTimeMinutes: 6.8,
};

export function getSystemMetrics(): SystemMetrics {
  return { ...metricsStore };
}

export function updateSystemMetrics(
  updates: Partial<SystemMetrics>
): SystemMetrics {
  metricsStore = { ...metricsStore, ...updates };
  return { ...metricsStore };
}
