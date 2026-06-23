import { db } from "@/lib/db";
import { users, matches, spotOffers, systemMetrics, parkingMatchSchedules, parkingMatches } from "@/lib/db/schema";
import { eq, and, gte, sql, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";
import { getParkingMatchMetrics } from "@/lib/services/parkingMatch";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
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

    const pm = await getParkingMatchMetrics();

    return ok({
      metrics: {
        totalMembers: Number(totalMembers?.count ?? 0),
        activeMembers: Number(activeMembers?.count ?? 0),
        totalSpotOffers: Number(totalSpotOffers?.count ?? 0),
        activeMatches: Number(activeMatches?.count ?? 0),
        matchesCompletedToday: Number(completedToday?.count ?? 0),
        matchesExpiredCancelledToday: Number(expiredToday?.count ?? 0),
        averageMatchTimeSeconds: metrics?.averageMatchTimeSeconds ?? 4.2,
        averageArrivalTimeMinutes: metrics?.averageArrivalTimeMinutes ?? 6.8,
        // Parking match metrics
        activeSchedules: pm.activeSchedules,
        totalSchedules: pm.totalSchedules,
        totalParkingMatches: pm.totalParkingMatches,
        pendingParkingMatches: pm.pendingMatches,
        confirmedParkingMatches: pm.confirmedMatches,
        cancelledParkingMatches: pm.cancelledMatches,
        expiredParkingMatches: pm.expiredMatches,
        parkingMatchSuccessRate: pm.matchSuccessRate,
        recentParkingMatches: pm.recentMatches,
      },
    });
  } catch (error) {
    return handleError(error, "Metrics error");
  }
}
