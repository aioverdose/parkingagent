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

    const departingAlias = db.select({
      id: users.id,
      name: users.name,
    }).from(users).as("departing_user");

    const arrivingAlias = db.select({
      id: users.id,
      name: users.name,
    }).from(users).as("arriving_user");

    const raw = await db
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

    const userIds = [...new Set(raw.flatMap((m) => [m.departingUserId, m.arrivingUserId]))];
    const userRows = await db
      .select({ id: users.id, name: users.name })
      .from(users);

    const userMap = new Map(userRows.map((u) => [u.id, u.name]));

    const enriched = raw.map((m) => ({
      ...m,
      role: m.departingUserId === session.userId ? "departing" : "arriving",
      otherUserName: userMap.get(
        m.departingUserId === session.userId ? m.arrivingUserId : m.departingUserId,
      ) ?? "Unknown",
    }));

    return NextResponse.json({ matches: enriched });
  } catch (error) {
    console.error("My matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
