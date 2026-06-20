import { db } from "@/lib/db";
import { users, spotOffers, parkingMatchSchedules, parkingMatches } from "@/lib/db/schema";
import { eq, and, sql, gte, lte, ne, inArray } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const DEFAULT_TOLERANCE_MINUTES = 15;

export function minutesFromMidnight(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function timesOverlap(
  leavingTime: number,
  arrivalLookingTime: number,
  toleranceMinutes: number = DEFAULT_TOLERANCE_MINUTES,
): boolean {
  return Math.abs(leavingTime - arrivalLookingTime) <= toleranceMinutes;
}

export function vehicleCompatible(
  memberVehicleType: string | null | undefined,
  memberVehicleSize: string | null | undefined,
  spotVehicleType: string | null | undefined,
  spotVehicleSize: string | null | undefined,
): boolean {
  if (spotVehicleType && memberVehicleType && spotVehicleType !== memberVehicleType) return false;
  if (spotVehicleSize && memberVehicleSize && spotVehicleSize !== memberVehicleSize) return false;
  return true;
}

function hashMemberId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "Member #" + Math.abs(hash).toString(16).toUpperCase().slice(0, 4);
}

export interface ParkingMatchResult {
  matchId: string;
  leavingMemberId: string;
  arrivingMemberId: string;
  leavingTime: number;
  arrivalLookingTime: number;
  toleranceMinutes: number;
  status: string;
  matchedAt: string;
  anonymousPartner: string;
  partnerVehicleInfo: { type: string | null; size: string | null } | null;
}

export async function runMatchingForAll(): Promise<number> {
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

      if (leaver.neighborhoodId && seeker.neighborhoodId && leaver.neighborhoodId !== seeker.neighborhoodId) continue;

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
        arrivingUser.vehicleType, arrivingUser.vehicleSize,
        leavingUser.vehicleType, leavingUser.vehicleSize,
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
      matchedAt: row.matchedAt,
      anonymousPartner: hashMemberId(partnerId),
      partnerVehicleInfo: partner
        ? { type: partner.vehicleType, size: partner.vehicleSize }
        : null,
    });
  }

  return results;
}
