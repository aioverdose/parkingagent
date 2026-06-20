import { db } from "@/lib/db";
import { parkingMatchSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { minutesFromMidnight, runMatchingForAll } from "@/lib/services/parkingMatch";
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

    const { leavingTime, arrivalLookingTime, neighborhoodId } = validate(parkingMatchScheduleSchema, await req.json());

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
