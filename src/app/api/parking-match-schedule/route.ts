import { db } from "@/lib/db";
import { parkingMatchSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { minutesFromMidnight } from "@/lib/services/matchingUtils";
import { runMatchingForAll } from "@/lib/services/parkingMatch";
import { z } from "zod";
import { validate, parkingMatchScheduleSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 10);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { leavingTime, arrivalLookingTime, neighborhoodId, latitude, longitude, carType } = validate(parkingMatchScheduleSchema, await req.json());

    const now = new Date().toISOString();

    // Deactivate existing schedules for this member
    await db
      .update(parkingMatchSchedules)
      .set({ isActive: false, updatedAt: now })
      .where(eq(parkingMatchSchedules.memberId, session.userId));

    const schedule = {
      id: uuid(),
      memberId: session.userId,
      leavingTime: minutesFromMidnight(leavingTime),
      arrivalLookingTime: minutesFromMidnight(arrivalLookingTime),
      neighborhoodId: neighborhoodId ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      carType: carType ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(parkingMatchSchedules).values(schedule);

    // Trigger matching
    let matchesCreated = 0;
    try {
      matchesCreated = await runMatchingForAll();
    } catch {
      // Matching failures are non-blocking
    }

    return ok({
      schedule,
      matchesCreated,
      message: "Your schedule has been submitted. We'll start searching for matches.",
    });
  } catch (error) {
    return handleError(error, "Parking match schedule error");
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const schedules = await db
      .select()
      .from(parkingMatchSchedules)
      .where(
        eq(parkingMatchSchedules.memberId, session.userId),
      )
      .orderBy(parkingMatchSchedules.createdAt);

    return ok({ schedules });
  } catch (error) {
    return handleError(error, "Parking match schedules GET error");
  }
}

const updateSpotSchema = z.object({
  scheduleId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function PATCH(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { scheduleId, latitude, longitude } = validate(updateSpotSchema, await req.json());

    const [schedule] = await db
      .select()
      .from(parkingMatchSchedules)
      .where(
        and(
          eq(parkingMatchSchedules.id, scheduleId),
          eq(parkingMatchSchedules.memberId, session.userId),
        ),
      )
      .limit(1);

    if (!schedule) {
      return err("Schedule not found", 404);
    }

    await db
      .update(parkingMatchSchedules)
      .set({
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(parkingMatchSchedules.id, scheduleId));

    return ok({ message: "Spot location updated" });
  } catch (error) {
    return handleError(error, "Update spot error");
  }
}
