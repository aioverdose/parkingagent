import { and, eq, inArray, or, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db";
import { preScheduledMatches, schedules, users } from "@/lib/db/schema";
import {
  windowsOverlap, vehicleCompatible, computeNextOccurrence,
  anonymousMemberId, describeSchedulePattern,
} from "./matchingUtils";

export type ScheduleFrequency = "daily" | "weekly" | "biweekly";

export interface VehicleInfo {
  type?: string | null;
  size?: string | null;
}

export interface PotentialScheduleMatch {
  incomingMemberId: string;
  departingMemberId: string;
  neighborhoodId: string | null;
  neighborhoodName: string | null;
  schedulePatternId: string;
  nextOccurrence: string;
}

export async function findMatchesForNeighborhood(
  neighborhoodId: string,
): Promise<PotentialScheduleMatch[]> {
  const rows = await db
    .select({
      schedule: schedules,
      member: {
        id: users.id,
        vehicleType: users.vehicleType,
        vehicleSize: users.vehicleSize,
      },
    })
    .from(schedules)
    .innerJoin(users, eq(users.id, schedules.memberId))
    .where(eq(schedules.neighborhoodId, neighborhoodId));

  const arrivers = rows.filter(({ schedule }) => schedule.role === "arriver" || schedule.role === "both");
  const departors = rows.filter(({ schedule }) => schedule.role === "departor" || schedule.role === "both");
  const matches: PotentialScheduleMatch[] = [];

  for (const incoming of arrivers) {
    for (const departing of departors) {
      if (incoming.schedule.memberId === departing.schedule.memberId) continue;
      if (!incoming.schedule.daysOfWeek.some((day) => departing.schedule.daysOfWeek.includes(day))) continue;
      if (!windowsOverlap(
        incoming.schedule.arrivalWindowStart,
        incoming.schedule.arrivalWindowEnd,
        departing.schedule.departureWindowStart,
        departing.schedule.departureWindowEnd,
      )) continue;
      if (!vehicleCompatible(
        { type: incoming.member.vehicleType, size: incoming.member.vehicleSize },
        { type: departing.member.vehicleType, size: departing.member.vehicleSize },
      )) continue;

      matches.push({
        incomingMemberId: incoming.schedule.memberId,
        departingMemberId: departing.schedule.memberId,
        neighborhoodId: incoming.schedule.neighborhoodId,
        neighborhoodName: incoming.schedule.neighborhoodName,
        schedulePatternId: incoming.schedule.id,
        nextOccurrence: computeNextOccurrence(incoming.schedule.daysOfWeek, incoming.schedule.frequency),
      });
    }
  }

  return matches;
}

export async function activeScheduleNeighborhoods(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ neighborhoodId: schedules.neighborhoodId })
    .from(schedules)
    .where(sql`${schedules.neighborhoodId} IS NOT NULL`);

  return rows.flatMap((row) => row.neighborhoodId ? [row.neighborhoodId] : []);
}

export async function createNovelPreScheduledMatches(
  potentialMatches: PotentialScheduleMatch[],
): Promise<number> {
  let matchesCreated = 0;
  const now = new Date().toISOString();

  for (const match of potentialMatches) {
    const existing = await db
      .select({ id: preScheduledMatches.id })
      .from(preScheduledMatches)
      .where(and(
        eq(preScheduledMatches.incomingMemberId, match.incomingMemberId),
        eq(preScheduledMatches.departingMemberId, match.departingMemberId),
        eq(preScheduledMatches.schedulePatternId, match.schedulePatternId),
        inArray(preScheduledMatches.status, ["pending", "confirmed"]),
      ))
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(preScheduledMatches).values({
      id: uuid(),
      incomingMemberId: match.incomingMemberId,
      departingMemberId: match.departingMemberId,
      neighborhoodId: match.neighborhoodId,
      neighborhoodName: match.neighborhoodName,
      schedulePatternId: match.schedulePatternId,
      status: "pending",
      nextOccurrence: match.nextOccurrence,
      createdAt: now,
      updatedAt: now,
    });
    matchesCreated++;
  }

  return matchesCreated;
}

export async function preScheduledConnectionsForMember(memberId: string) {
  const rows = await db
    .select({
      match: preScheduledMatches,
      schedule: schedules,
    })
    .from(preScheduledMatches)
    .innerJoin(schedules, eq(schedules.id, preScheduledMatches.schedulePatternId))
    .where(or(
      eq(preScheduledMatches.incomingMemberId, memberId),
      eq(preScheduledMatches.departingMemberId, memberId),
    ))
    .orderBy(sql`${preScheduledMatches.createdAt} DESC`);

  const connections = [];
  for (const row of rows) {
    const isIncoming = row.match.incomingMemberId === memberId;
    const partnerId = isIncoming ? row.match.departingMemberId : row.match.incomingMemberId;
    const [partner] = await db
      .select({
        vehicleType: users.vehicleType,
        vehicleSize: users.vehicleSize,
      })
      .from(users)
      .where(eq(users.id, partnerId))
      .limit(1);

    connections.push({
      id: row.match.id,
      neighborhoodName: row.match.neighborhoodName || row.schedule.neighborhoodName || "Unknown neighborhood",
      schedulePattern: describeSchedulePattern(
        row.schedule.daysOfWeek,
        row.schedule.arrivalWindowStart,
        row.schedule.arrivalWindowEnd,
      ),
      yourRole: isIncoming ? "arriver" : "departor",
      status: row.match.status,
      nextOccurrence: row.match.nextOccurrence,
      anonymousPartner: anonymousMemberId(partnerId),
      partnerVehicleInfo: partner
        ? { type: partner.vehicleType, size: partner.vehicleSize }
        : null,
    });
  }

  return connections;
}
