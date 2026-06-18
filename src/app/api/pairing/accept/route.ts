import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matches, spotOffers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matchId, action } = await req.json();

    if (!matchId || !["accept", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "matchId and action are required" },
        { status: 400 },
      );
    }

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (action === "accept") {
      const now = new Date().toISOString();
      await db
        .update(matches)
        .set({ status: "completed", arrivalAt: now })
        .where(eq(matches.id, matchId));

      if (match.spotOfferId) {
        await db
          .update(spotOffers)
          .set({ status: "completed" })
          .where(eq(spotOffers.id, match.spotOfferId));
      }
    } else {
      await db
        .update(matches)
        .set({ status: "cancelled" })
        .where(eq(matches.id, matchId));

      if (match.spotOfferId) {
        await db
          .update(spotOffers)
          .set({ status: "available" })
          .where(eq(spotOffers.id, match.spotOfferId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pairing accept error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
