import { db } from "@/lib/db";
import { users, matches, spotOffers, pushSubscriptions } from "@/lib/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { sendMatchNotification } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";
import { scoreOffers } from "@/lib/services/pairing";
import { getRouteEta } from "@/lib/services/osrm";
import { validate, pairingMatchSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 20);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const body = validate(pairingMatchSchema, await req.json());
    const { offerId, arrivingUserId, mode, lat, lng } = body;

    const userLat = lat ?? 33.77;
    const userLng = lng ?? -118.19;

    let targetOffer: typeof spotOffers.$inferSelect | null = null;

    if (offerId) {
      const [offer] = await db
        .select()
        .from(spotOffers)
        .where(
          and(eq(spotOffers.id, offerId), eq(spotOffers.status, "available")),
        )
        .limit(1);

      if (!offer) {
        return err("Spot offer not found or already taken", 404);
      }

      if (offer.userId === arrivingUserId) {
        return err("Cannot match with yourself", 400);
      }

      targetOffer = offer;
    } else if (mode === "auto" || (!offerId && lat !== undefined && lng !== undefined)) {
      const available = await db
        .select()
        .from(spotOffers)
        .where(
          and(
            eq(spotOffers.status, "available"),
            ne(spotOffers.userId, arrivingUserId),
          ),
        );

      if (available.length === 0) {
        return err("No available spots found", 404);
      }

      const userIds = [...new Set(available.map((o) => o.userId))];
      const rankingRows = await db
        .select({ id: users.id, rankingScore: users.rankingScore })
        .from(users)
        .where(inArray(users.id, userIds));

      const rankingScores = new Map<string, number>(
        rankingRows.map((r) => [r.id, r.rankingScore ?? 0]),
      );

      const scored = scoreOffers(available, userLat, userLng, rankingScores);

      targetOffer = scored[0] as typeof spotOffers.$inferSelect;
    } else {
      return err("Provide offerId or lat/lng for auto-matching", 400);
    }

    // Compute ETA via OSRM
    let etaMinutes: number | null = null;
    try {
      const eta = await getRouteEta(
        userLat,
        userLng,
        targetOffer.latitude,
        targetOffer.longitude,
      );
      etaMinutes = eta?.durationMinutes ?? null;
    } catch {
      // ETA is optional
    }

    const now = new Date().toISOString();

    const match = {
      id: uuid(),
      spotOfferId: targetOffer.id,
      departingUserId: targetOffer.userId,
      arrivingUserId,
      status: "active" as const,
      matchedAt: now,
      arrivalAt: null,
      etaMinutes,
      spotLatitude: targetOffer.latitude,
      spotLongitude: targetOffer.longitude,
    };

    await db.insert(matches).values(match);

    await db
      .update(spotOffers)
      .set({ status: "matched" })
      .where(eq(spotOffers.id, targetOffer.id));

    // Send email + push notifications
    try {
      const [departingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, targetOffer.userId))
        .limit(1);
      const [arrivingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, arrivingUserId))
        .limit(1);

      if (departingUser) {
        await sendMatchNotification(
          departingUser.email,
          departingUser.name,
          "departing",
          targetOffer.address ?? undefined,
        );
        const subs = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, departingUser.id));
        for (const sub of subs) {
          const result = await sendPushNotification(
            sub,
            "Someone is coming!",
            "A member is heading to your parking spot.",
            "/dashboard",
          );
          if (result === "expired") {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          }
        }
      }
      if (arrivingUser) {
        await sendMatchNotification(
          arrivingUser.email,
          arrivingUser.name,
          "arriving",
          targetOffer.address ?? undefined,
        );
        const subs = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, arrivingUser.id));
        for (const sub of subs) {
          const result = await sendPushNotification(
            sub,
            "Spot Found!",
            "A parking spot has been matched for you. Head there now.",
            "/dashboard",
          );
          if (result === "expired") {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          }
        }
      }
    } catch {
      // Notification failures are non-blocking
    }

    return ok({ match });
  } catch (error) {
    return handleError(error, "Pairing match error");
  }
}
