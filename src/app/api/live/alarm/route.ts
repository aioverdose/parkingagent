import { db } from "@/lib/db";
import { parkingMatches } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

const setAlarmSchema = z.object({
  matchId: z.string().min(1),
  alarmMinutes: z.number().int().min(0).max(30),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const { matchId, alarmMinutes } = validate(setAlarmSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(
        and(
          eq(parkingMatches.id, matchId),
          eq(parkingMatches.status, "confirmed"),
          or(
            eq(parkingMatches.leavingMemberId, session.userId),
            eq(parkingMatches.arrivingMemberId, session.userId),
          ),
        ),
      )
      .limit(1);

    if (!match) return err("Match not found", 404);
    if (match.leavingMemberId !== session.userId) return err("Only the departing user can set the alarm", 403);

    await db
      .update(parkingMatches)
      .set({ alarmMinutes })
      .where(eq(parkingMatches.id, matchId));

    return ok({ alarmMinutes, message: `We'll notify you ${alarmMinutes} minutes before arrival` });
  } catch (error) {
    return handleError(error, "Alarm error");
  }
}
