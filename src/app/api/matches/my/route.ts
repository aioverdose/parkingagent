import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matches, users } from "@/lib/db/schema";
import { or, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userMatches = await db
      .select({
        id: matches.id,
        status: matches.status,
        matchedAt: matches.matchedAt,
        arrivalAt: matches.arrivalAt,
        spotLatitude: matches.spotLatitude,
        spotLongitude: matches.spotLongitude,
        departingUserId: matches.departingUserId,
        arrivingUserId: matches.arrivingUserId,
      })
      .from(matches)
      .where(
        or(
          eq(matches.departingUserId, session.userId),
          eq(matches.arrivingUserId, session.userId),
        ),
      )
      .orderBy(matches.matchedAt);

    return NextResponse.json({ matches: userMatches });
  } catch (error) {
    console.error("My matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
