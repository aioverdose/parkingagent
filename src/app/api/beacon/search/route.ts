import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { parkingBeacons, parkingMatchSchedules, users } from "@/lib/db/schema";
import { eq, and, gt, lte, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";
import { haversineDistanceMiles } from "@/lib/geo";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    if (currentUser.tier !== "premium" && !currentUser.isPremium) {
      return err("Premium subscription required", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { beaconId } = body;

    if (!beaconId) {
      return err("beaconId is required", 400);
    }

    const [beacon] = await db
      .select()
      .from(parkingBeacons)
      .where(eq(parkingBeacons.id, beaconId))
      .limit(1);

    if (!beacon) {
      return err("Beacon not found", 404);
    }

    const blockSizeMiles = 0.1;
    const currentRadiusMiles = beacon.radius * blockSizeMiles;

    const allSchedules = await db
      .select({
        id: parkingMatchSchedules.id,
        memberId: parkingMatchSchedules.memberId,
        arrivalLookingTime: parkingMatchSchedules.arrivalLookingTime,
        latitude: users.latitude,
        longitude: users.longitude,
        ranking: users.ranking,
      })
      .from(parkingMatchSchedules)
      .innerJoin(users, eq(parkingMatchSchedules.memberId, users.id))
      .where(
        and(
          eq(parkingMatchSchedules.isActive, true),
          eq(users.isMember, true),
        ),
      );

    const matches = allSchedules.filter((s) => {
      if (!s.latitude || !s.longitude) return false;
      const dist = haversineDistanceMiles(
        beacon.latitude, beacon.longitude,
        s.latitude, s.longitude,
      );
      return dist <= currentRadiusMiles;
    });

    matches.sort((a, b) => (b.ranking || 5) - (a.ranking || 5));

    const maxRadius = 20;
    const expanded = beacon.radius < maxRadius && matches.length === 0;

    if (expanded) {
      const newRadius = Math.min(beacon.radius + 5, maxRadius);
      await db
        .update(parkingBeacons)
        .set({ radius: newRadius })
        .where(eq(parkingBeacons.id, beaconId));
    }

    if (matches.length > 0) {
      await db
        .update(parkingBeacons)
        .set({
          status: "matched",
          matchedMemberId: matches[0].memberId,
          matchedAt: new Date().toISOString(),
        })
        .where(eq(parkingBeacons.id, beaconId));
    }

    return ok({
      matches: matches.map((m) => ({
        memberId: m.memberId,
        memberNumber: `Member #${m.memberId.slice(0, 4).toUpperCase()}`,
        ranking: m.ranking || 5,
      })),
      radius: beacon.radius,
      expanded,
      totalFound: matches.length,
      status: matches.length > 0 ? "matched" : "searching",
    });
  } catch (error) {
    return handleError(error, "Beacon search error");
  }
}
