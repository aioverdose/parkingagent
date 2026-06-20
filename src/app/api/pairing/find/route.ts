import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, spotOffers } from "@/lib/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { scoreOffers } from "@/lib/services/pairing";
import { getRouteEtaBatch, computeTimeFitScore } from "@/lib/services/osrm";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const latParam = req.nextUrl.searchParams.get("lat");
    const lngParam = req.nextUrl.searchParams.get("lng");
    const userLat = latParam ? parseFloat(latParam) : undefined;
    const userLng = lngParam ? parseFloat(lngParam) : undefined;

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const available = await db
      .select()
      .from(spotOffers)
      .where(
        and(
          eq(spotOffers.status, "available"),
          ne(spotOffers.userId, session.userId),
        ),
      );

    if (available.length === 0) {
      return ok({ offers: [] });
    }

    if (userLat === undefined || userLng === undefined) {
      return ok({ offers: available });
    }

    // Filter by vehicle compatibility
    const compatible = currentUser
      ? available.filter((offer) => {
          if (!offer.vehicleType && !offer.vehicleSize) return true;
          if (offer.vehicleType && offer.vehicleType !== currentUser.vehicleType) return false;
          if (offer.vehicleSize && offer.vehicleSize !== currentUser.vehicleSize) return false;
          return true;
        })
      : available;

    if (compatible.length === 0) {
      return ok({ offers: [] });
    }

    // Compute OSRM ETA for each offer
    const etaResults = await getRouteEtaBatch(
      compatible.map((o) => ({ lat: o.latitude, lng: o.longitude })),
      { lat: userLat, lng: userLng },
    );

    const userIds = [...new Set(compatible.map((o) => o.userId))];
    const rankingRows = await db
      .select({ id: users.id, rankingScore: users.rankingScore })
      .from(users)
      .where(inArray(users.id, userIds));

    const rankingScores = new Map<string, number>(
      rankingRows.map((r) => [r.id, r.rankingScore ?? 0]),
    );

    const scored = scoreOffers(compatible, userLat, userLng, rankingScores);

    // Merge ETA into results and compute time-fit score
    const nowMinutes = Date.now() / 60000;
    const offersWithEta = scored.map((offer, idx) => {
      const eta = etaResults[idx]?.eta;
      let timeFitScore = 0.5;
      if (eta && offer.expectedDeparture) {
        const depMinutes = new Date(offer.expectedDeparture).getTime() / 60000;
        const arrivalMinutes = nowMinutes + eta.durationMinutes;
        timeFitScore = computeTimeFitScore(arrivalMinutes, depMinutes);
      } else if (eta) {
        timeFitScore = 0.75;
      }
      return {
        ...offer,
        etaMinutes: eta?.durationMinutes ?? null,
        etaDistance: eta?.distanceMeters ?? null,
        timeFitScore,
      };
    });

    // Sort by timeFitScore (desc), then compositeScore (asc)
    offersWithEta.sort((a, b) => {
      if (b.timeFitScore !== a.timeFitScore) return b.timeFitScore - a.timeFitScore;
      return a.compositeScore - b.compositeScore;
    });

    return ok({ offers: offersWithEta });
  } catch (error) {
    return handleError(error, "Find spots error");
  }
}
