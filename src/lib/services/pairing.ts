import { haversineDistanceKm } from "@/lib/geo";

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
      const distanceKm = haversineDistanceKm(
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
