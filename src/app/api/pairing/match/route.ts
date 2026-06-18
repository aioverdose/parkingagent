import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, matches, spotOffers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { sendMatchNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { offerId, arrivingUserId } = await req.json();

    if (!offerId || !arrivingUserId) {
      return NextResponse.json(
        { error: "offerId and arrivingUserId are required" },
        { status: 400 },
      );
    }

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

    const now = new Date().toISOString();

    const match = {
      id: uuid(),
      spotOfferId: offer.id,
      departingUserId: offer.userId,
      arrivingUserId,
      status: "active" as const,
      matchedAt: now,
      arrivalAt: null,
      spotLatitude: offer.latitude,
      spotLongitude: offer.longitude,
    };

    await db.insert(matches).values(match);

    await db
      .update(spotOffers)
      .set({ status: "matched" })
      .where(eq(spotOffers.id, offer.id));

    // Send email notifications
    try {
      const [departingUser] = await db.select().from(users).where(eq(users.id, offer.userId)).limit(1);
      const [arrivingUser] = await db.select().from(users).where(eq(users.id, arrivingUserId)).limit(1);

      if (departingUser) {
        await sendMatchNotification(departingUser.email, departingUser.name, "departing", offer.address ?? undefined);
      }
      if (arrivingUser) {
        await sendMatchNotification(arrivingUser.email, arrivingUser.name, "arriving", offer.address ?? undefined);
      }
    } catch {
      // Email failures are non-blocking
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Pairing match error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
