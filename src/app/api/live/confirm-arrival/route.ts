import { db } from "@/lib/db";
import { parkingMatches, parkingMatchSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";
import { isInsideGeofence } from "@/lib/geo";

const confirmArrivalSchema = z.object({
  matchId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const GEOFENCE_RADIUS_M = 75;

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const { matchId, latitude, longitude } = validate(confirmArrivalSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(and(eq(parkingMatches.id, matchId), eq(parkingMatches.status, "confirmed")))
      .limit(1);

    if (!match) return err("Match not found or not confirmed", 404);
    if (match.arrivingMemberId !== session.userId) return err("Only the arriving user can confirm arrival", 403);
    if (match.matchState !== "matched" && match.matchState !== "waiting_arrival") {
      return err(`Cannot confirm arrival in current state: ${match.matchState}`, 400);
    }

    // Get spot location from leaving schedule
    const [schedule] = await db
      .select({ latitude: parkingMatchSchedules.latitude, longitude: parkingMatchSchedules.longitude })
      .from(parkingMatchSchedules)
      .where(eq(parkingMatchSchedules.id, match.leavingScheduleId))
      .limit(1);

    const spotLat = schedule?.latitude;
    const spotLng = schedule?.longitude;

    if (!spotLat || !spotLng) return err("Spot location not set on schedule", 400);

    const inside = isInsideGeofence(latitude, longitude, spotLat, spotLng, GEOFENCE_RADIUS_M);

    if (!inside) return err("You are not yet within the geofence area", 400);

    await db
      .update(parkingMatches)
      .set({ matchState: "arrived" })
      .where(eq(parkingMatches.id, matchId));

    return ok({ matchState: "arrived", message: "Arrival confirmed! The departing member has been notified." });
  } catch (error) {
    return handleError(error, "Confirm arrival error");
  }
}
