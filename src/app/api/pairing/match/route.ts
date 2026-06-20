import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, matches, spotOffers, pushSubscriptions } from "@/lib/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { sendMatchNotification } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";
import { scoreOffers } from "@/lib/services/pairing";
import { getRouteEta } from "@/lib/services/osrm";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offerId, arrivingUserId, mode, lat, lng } = body;

    if (!arrivingUserId) {
      return NextResponse.json(
        { error: "arrivingUserId is required" },
        { status: 400 },
      );
    }

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
        return NextResponse.json(
          { error: "Spot offer not found or already taken" },
          { status: 404 },
        );
      }

      if (offer.userId === arrivingUserId) {
        return NextResponse.json(
          { error: "Cannot match with yourself" },
          { status: 400 },
        );
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
        return NextResponse.json(
          { error: "No available spots found" },
          { status: 404 },
        );
      }

      const userIds = [...new Set(available.map((o) => o.userId))];
      const rankingRows = await db
        .select({ id: users.id, rankingScore: users.rankingScore })
        .from(users)
        .where(inArray(users.id, userIds));

      const rankingScores = new Map<string, number>(
        rankingRows.map((r) => [r.id, r.rankingScore ?? 0]),
      );

      const userLat = lat ?? 33.77;
      const userLng = lng ?? -118.19;
      const scored = scoreOffers(available, userLat, userLng, rankingScores);

      targetOffer = scored[0] as typeof spotOffers.$inferSelect;
    } else {
      return NextResponse.json(
        { error: "Provide offerId or lat/lng for auto-matching" },
        { status: 400 },
      );
    }

    // Compute ETA via OSRM
    let etaMinutes: number | null = null;
    try {
      const eta = await getRouteEta(
        body.lat ?? 33.77,
        body.lng ?? -118.19,
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

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Pairing match error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
