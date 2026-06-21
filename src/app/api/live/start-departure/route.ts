import { db } from "@/lib/db";
import { parkingMatches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

const startDepartureSchema = z.object({
  matchId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const { matchId } = validate(startDepartureSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(and(eq(parkingMatches.id, matchId), eq(parkingMatches.status, "confirmed")))
      .limit(1);

    if (!match) return err("Match not found or not confirmed", 404);
    if (match.leavingMemberId !== session.userId) return err("Only the departing user can start departure", 403);
    if (match.matchState !== "arrived") {
      return err(`Cannot start departure in current state: ${match.matchState}. Wait for the arriving user to position first.`, 400);
    }

    await db
      .update(parkingMatches)
      .set({ matchState: "departing" })
      .where(eq(parkingMatches.id, matchId));

    return ok({ matchState: "departing", message: "Departure started! The arriving user has been notified." });
  } catch (error) {
    return handleError(error, "Start departure error");
  }
}
