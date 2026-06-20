export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface ScoredOffer {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address: string | null;
  status: string;
  createdAt: string;
  expectedDeparture: string | null;
  vehicleType: string | null;
  vehicleSize: string | null;
  distanceKm: number;
  rankingScore: number;
  compositeScore: number;
}

export function scoreOffers(
  offers: Array<{ id: string; userId: string; latitude: number; longitude: number; address: string | null; status: string; createdAt: string; expectedDeparture: string | null; vehicleType: string | null; vehicleSize: string | null }>,
  userLat: number,
  userLng: number,
  rankingScores: Map<string, number>,
): ScoredOffer[] {
  const maxRanking = Math.max(...rankingScores.values(), 1);

  return offers
    .map((offer) => {
      const distanceKm = haversineDistance(
        userLat,
        userLng,
        offer.latitude,
        offer.longitude,
      );
      const rankingScore = rankingScores.get(offer.userId) ?? 0;
      const normalizedRanking = rankingScore / maxRanking;

      // Composite: lower is better.
      // distance weight = 0.7, ranking weight = 0.3
      // Normalize distance to km — within Long Beach (< 20 km) this works directly.
      const compositeScore = 0.7 * distanceKm + 0.3 * (1 - normalizedRanking);

      return { ...offer, distanceKm, rankingScore, compositeScore };
    })
    .sort((a, b) => a.compositeScore - b.compositeScore);
}
