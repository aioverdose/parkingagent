import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { spotOffers, users, matches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { haversineDistanceMiles } from "@/lib/geo";
import { validate, realtimeArrivalSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

const BLOCK_SIZE_MILES = 0.1;

const RADII_BLOCKS = [5, 10, 15, 20];

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, 20);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    if (currentUser.tier !== "premium" && !currentUser.isPremium) {
      return err("Premium subscription required", 403);
    }

    const { latitude, longitude, expandRadius } = validate(realtimeArrivalSchema, await req.json());

    const radiusIndex = expandRadius;
    const currentRadiusBlocks = RADII_BLOCKS[Math.min(radiusIndex, RADII_BLOCKS.length - 1)];
    const currentRadiusMiles = currentRadiusBlocks * BLOCK_SIZE_MILES;

    const availableOffers = await db
      .select()
      .from(spotOffers)
      .where(eq(spotOffers.status, "available"));

    const nearbyOffers = availableOffers.filter((o) => {
      const dist = haversineDistanceMiles(
        Number(latitude), Number(longitude),
        o.latitude, o.longitude,
      );
      return dist <= currentRadiusMiles;
    });

    nearbyOffers.sort((a, b) => {
      const distA = haversineDistanceMiles(
        Number(latitude), Number(longitude),
        a.latitude, a.longitude,
      );
      const distB = haversineDistanceMiles(
        Number(latitude), Number(longitude),
        b.latitude, b.longitude,
      );
      return distA - distB;
    });

    const hasMoreRadii = radiusIndex < RADII_BLOCKS.length - 1;
    const found = nearbyOffers.length > 0;

    let match = null;
    if (found) {
      const bestOffer = nearbyOffers[0];
      const matchId = uuid();
      const now = new Date().toISOString();
      const etaMinutes = Math.round(
        haversineDistanceMiles(
          Number(latitude), Number(longitude),
          bestOffer.latitude, bestOffer.longitude,
        ) * 30,
      );

      const [departingUser] = await db
        .select({ name: users.name, vehicleType: users.vehicleType, vehicleSize: users.vehicleSize })
        .from(users)
        .where(eq(users.id, bestOffer.userId))
        .limit(1);

      await db.insert(matches).values({
        id: matchId,
        spotOfferId: bestOffer.id,
        departingUserId: bestOffer.userId,
        arrivingUserId: currentUser.id,
        status: "active",
        matchedAt: now,
        etaMinutes: Math.max(1, etaMinutes),
        spotLatitude: bestOffer.latitude,
        spotLongitude: bestOffer.longitude,
      });

      await db
        .update(spotOffers)
        .set({ status: "matched" })
        .where(eq(spotOffers.id, bestOffer.id));

      match = {
        matchId,
        departingMemberId: bestOffer.userId,
        departingMemberNumber: `Member #${bestOffer.userId.slice(0, 4).toUpperCase()}`,
        vehicleType: departingUser?.vehicleType || "car",
        vehicleSize: departingUser?.vehicleSize || "standard",
        spotLatitude: bestOffer.latitude,
        spotLongitude: bestOffer.longitude,
        etaMinutes: Math.max(1, etaMinutes),
        address: bestOffer.address || null,
      };
    }

    return ok({
      found,
      match,
      radiusBlocks: currentRadiusBlocks,
      canExpand: hasMoreRadii && !found,
      nextRadiusIndex: hasMoreRadii ? radiusIndex + 1 : null,
      message: found
        ? "Match found!"
        : hasMoreRadii
          ? "No match found in this radius. Try expanding."
          : "No match found in your area. Try using preliminary schedule matching.",
    });
  } catch (error) {
    return handleError(error, "Realtime arrival error");
  }
}
