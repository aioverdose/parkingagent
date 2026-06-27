import { db } from "@/lib/db";
import { users, spotOffers, parkingMatchSchedules, parkingMatches } from "@/lib/db/schema";
import { eq, and, sql, gte, lte, ne, inArray, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { haversineDistanceKm } from "@/lib/geo";
import { minutesFromMidnight, formatMinutes, timesOverlap, vehicleCompatible, anonymousMemberId } from "./matchingUtils";

export const DEFAULT_TOLERANCE_MINUTES = 15;
export const DEFAULT_PROXIMITY_KM = 0.5;

export interface ParkingMatchResult {
  matchId: string;
  leavingMemberId: string;
  arrivingMemberId: string;
  leavingTime: number;
  arrivalLookingTime: number;
  toleranceMinutes: number;
  status: string;
  matchState: string;
  matchedAt: string;
  anonymousPartner: string;
  partnerVehicleInfo: { type: string | null; size: string | null } | null;
  spotLatitude: number | null;
  spotLongitude: number | null;
  alarmMinutes: number;
}

export async function runMatchingForAll(
  proximityKm: number = DEFAULT_PROXIMITY_KM,
): Promise<number> {
  const schedules = await db
    .select()
    .from(parkingMatchSchedules)
    .where(eq(parkingMatchSchedules.isActive, true));

  const leavers = schedules.filter((s) => s.leavingTime > 0);
  const seekers = schedules.filter((s) => s.arrivalLookingTime > 0);

  let matchesCreated = 0;

  for (const leaver of leavers) {
    for (const seeker of seekers) {
      if (leaver.memberId === seeker.memberId) continue;

      if (!timesOverlap(leaver.leavingTime, seeker.arrivalLookingTime)) continue;

      // Proximity check: if both have lat/lng, compute distance
      if (leaver.latitude != null && leaver.longitude != null &&
          seeker.latitude != null && seeker.longitude != null) {
        const dist = haversineDistanceKm(
          leaver.latitude, leaver.longitude,
          seeker.latitude, seeker.longitude,
        );
        if (dist > proximityKm) continue;
      } else if (leaver.neighborhoodId && seeker.neighborhoodId &&
                 leaver.neighborhoodId !== seeker.neighborhoodId) {
        continue;
      }

      const [leavingUser] = await db
        .select({
          vehicleType: users.vehicleType,
          vehicleSize: users.vehicleSize,
        })
        .from(users)
        .where(eq(users.id, leaver.memberId))
        .limit(1);

      const [arrivingUser] = await db
        .select({
          vehicleType: users.vehicleType,
          vehicleSize: users.vehicleSize,
        })
        .from(users)
        .where(eq(users.id, seeker.memberId))
        .limit(1);

      if (leavingUser && arrivingUser && !vehicleCompatible(
        { type: arrivingUser.vehicleType, size: arrivingUser.vehicleSize },
        { type: leavingUser.vehicleType, size: leavingUser.vehicleSize },
      )) continue;

      // Check not already matched
      const existing = await db
        .select()
        .from(parkingMatches)
        .where(and(
          eq(parkingMatches.leavingMemberId, leaver.memberId),
          eq(parkingMatches.arrivingMemberId, seeker.memberId),
          inArray(parkingMatches.status, ["pending", "confirmed"]),
        ))
        .limit(1);

      if (existing.length > 0) continue;

      const now = new Date().toISOString();
      await db.insert(parkingMatches).values({
        id: uuid(),
        leavingMemberId: leaver.memberId,
        arrivingMemberId: seeker.memberId,
        leavingScheduleId: leaver.id,
        arrivingScheduleId: seeker.id,
        status: "pending",
        toleranceMinutes: DEFAULT_TOLERANCE_MINUTES,
        matchedAt: now,
      });

      matchesCreated++;
    }
  }

  return matchesCreated;
}

export async function getMatchesForMember(
  memberId: string,
): Promise<ParkingMatchResult[]> {
  const rows = await db
    .select()
    .from(parkingMatches)
    .where(
      sql`${parkingMatches.leavingMemberId} = ${memberId} OR ${parkingMatches.arrivingMemberId} = ${memberId}`,
    )
    .orderBy(sql`${parkingMatches.matchedAt} DESC`);

  const results: ParkingMatchResult[] = [];

  for (const row of rows) {
    const isLeaver = row.leavingMemberId === memberId;
    const partnerId = isLeaver ? row.arrivingMemberId : row.leavingMemberId;

    const [partner] = await db
      .select({
        vehicleType: users.vehicleType,
        vehicleSize: users.vehicleSize,
      })
      .from(users)
      .where(eq(users.id, partnerId))
      .limit(1);

    const ls = isLeaver
      ? await db.select().from(parkingMatchSchedules).where(eq(parkingMatchSchedules.id, row.leavingScheduleId)).limit(1)
      : await db.select().from(parkingMatchSchedules).where(eq(parkingMatchSchedules.id, row.arrivingScheduleId)).limit(1);

    // Get spot location from the leaving member's schedule
    const [leavingSchedule] = await db
      .select({ latitude: parkingMatchSchedules.latitude, longitude: parkingMatchSchedules.longitude })
      .from(parkingMatchSchedules)
      .where(eq(parkingMatchSchedules.id, row.leavingScheduleId))
      .limit(1);

    results.push({
      matchId: row.id,
      leavingMemberId: row.leavingMemberId,
      arrivingMemberId: row.arrivingMemberId,
      leavingTime: row.leavingMemberId === memberId
        ? (ls[0]?.leavingTime ?? 0)
        : (ls[0]?.arrivalLookingTime ?? 0),
      arrivalLookingTime: row.arrivingMemberId === memberId
        ? (ls[0]?.arrivalLookingTime ?? 0)
        : (ls[0]?.leavingTime ?? 0),
      toleranceMinutes: row.toleranceMinutes,
      status: row.status,
      matchState: row.matchState ?? "matched",
      matchedAt: row.matchedAt,
      anonymousPartner: anonymousMemberId(partnerId),
      partnerVehicleInfo: partner
        ? { type: partner.vehicleType, size: partner.vehicleSize }
        : null,
      spotLatitude: leavingSchedule?.latitude ?? null,
      spotLongitude: leavingSchedule?.longitude ?? null,
      alarmMinutes: row.alarmMinutes,
    });
  }

  return results;
}

export interface ParkingMatchMetrics {
  activeSchedules: number;
  totalSchedules: number;
  totalParkingMatches: number;
  pendingMatches: number;
  confirmedMatches: number;
  cancelledMatches: number;
  expiredMatches: number;
  matchSuccessRate: number;
  recentMatches: number;
}

export async function getParkingMatchMetrics(): Promise<ParkingMatchMetrics> {
  const [activeSchedules] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatchSchedules)
    .where(eq(parkingMatchSchedules.isActive, true));

  const [totalSchedules] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatchSchedules);

  const [totalMatches] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatches);

  const [pending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatches)
    .where(eq(parkingMatches.status, "pending"));

  const [confirmed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatches)
    .where(eq(parkingMatches.status, "confirmed"));

  const [cancelled] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatches)
    .where(eq(parkingMatches.status, "cancelled"));

  const [expired] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatches)
    .where(eq(parkingMatches.status, "expired"));

  const total = Number(confirmed?.count ?? 0) + Number(cancelled?.count ?? 0) + Number(expired?.count ?? 0);

  const today = new Date().toISOString().split("T")[0];
  const [recent] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parkingMatches)
    .where(
      and(
        gte(parkingMatches.matchedAt, today),
        inArray(parkingMatches.status, ["pending", "confirmed"]),
      ),
    );

  return {
    activeSchedules: Number(activeSchedules?.count ?? 0),
    totalSchedules: Number(totalSchedules?.count ?? 0),
    totalParkingMatches: Number(totalMatches?.count ?? 0),
    pendingMatches: Number(pending?.count ?? 0),
    confirmedMatches: Number(confirmed?.count ?? 0),
    cancelledMatches: Number(cancelled?.count ?? 0),
    expiredMatches: Number(expired?.count ?? 0),
    matchSuccessRate: total > 0 ? Math.round((Number(confirmed.count ?? 0) / total) * 100) : 0,
    recentMatches: Number(recent?.count ?? 0),
  };
}
