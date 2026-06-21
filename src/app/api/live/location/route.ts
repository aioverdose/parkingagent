import { db } from "@/lib/db";
import { liveLocations, parkingMatches } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

const pushLocationSchema = z.object({
  matchId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().optional(),
  speed: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 30);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const { matchId, latitude, longitude, heading, speed } = validate(pushLocationSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(and(eq(parkingMatches.id, matchId), eq(parkingMatches.status, "confirmed")))
      .limit(1);

    if (!match) return err("Match not found or not confirmed", 404);
    if (match.arrivingMemberId !== session.userId) return err("Only the arriving user can share location", 403);

    await db.insert(liveLocations).values({
      id: uuid(),
      matchId,
      userId: session.userId,
      latitude,
      longitude,
      heading: heading ?? null,
      speed: speed ?? null,
      timestamp: new Date().toISOString(),
    });

    return ok({ recorded: true });
  } catch (error) {
    return handleError(error, "Live location error");
  }
}

const getLocationSchema = z.object({
  matchId: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const url = new URL(req.url);
    const { matchId } = validate(getLocationSchema, Object.fromEntries(url.searchParams.entries()));

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(and(eq(parkingMatches.id, matchId), eq(parkingMatches.status, "confirmed")))
      .limit(1);

    if (!match) return err("Match not found or not confirmed", 404);
    if (match.leavingMemberId !== session.userId && match.arrivingMemberId !== session.userId) {
      return err("Not a participant in this match", 403);
    }

    const isArriving = match.arrivingMemberId === session.userId;
    const targetUserId = isArriving ? match.leavingMemberId : match.arrivingMemberId;

    const [location] = await db
      .select()
      .from(liveLocations)
      .where(and(eq(liveLocations.matchId, matchId), eq(liveLocations.userId, targetUserId)))
      .orderBy(desc(liveLocations.timestamp))
      .limit(1);

    return ok({
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading,
            speed: location.speed,
            timestamp: location.timestamp,
          }
        : null,
      match: {
        id: match.id,
        status: match.status,
        confirmed: match.confirmed,
        alarmMinutes: match.alarmMinutes,
      },
    });
  } catch (error) {
    return handleError(error, "Live location GET error");
  }
}
