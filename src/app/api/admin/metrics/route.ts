import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, matches, spotOffers, systemMetrics } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const [totalMembers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [activeMembers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isMember, true));

    const [totalSpotOffers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(spotOffers);

    const [activeMatches] = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(eq(matches.status, "active"));

    const [completedToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(
        and(
          eq(matches.status, "completed"),
          gte(matches.matchedAt, today),
        ),
      );

    const [expiredToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(
        and(
          sql`${matches.status} IN ('cancelled', 'expired')`,
          gte(matches.matchedAt, today),
        ),
      );

    const [metrics] = await db
      .select()
      .from(systemMetrics)
      .where(eq(systemMetrics.id, "default"))
      .limit(1);

    return NextResponse.json({
      metrics: {
        totalMembers: Number(totalMembers?.count ?? 0),
        activeMembers: Number(activeMembers?.count ?? 0),
        totalSpotOffers: Number(totalSpotOffers?.count ?? 0),
        activeMatches: Number(activeMatches?.count ?? 0),
        matchesCompletedToday: Number(completedToday?.count ?? 0),
        matchesExpiredCancelledToday: Number(expiredToday?.count ?? 0),
        averageMatchTimeSeconds: metrics?.averageMatchTimeSeconds ?? 4.2,
        averageArrivalTimeMinutes: metrics?.averageArrivalTimeMinutes ?? 6.8,
      },
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
