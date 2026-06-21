import { db } from "@/lib/db";
import { parkingMatches } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

const completeExchangeSchema = z.object({
  matchId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const { matchId } = validate(completeExchangeSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(and(eq(parkingMatches.id, matchId), eq(parkingMatches.status, "confirmed")))
      .limit(1);

    if (!match) return err("Match not found or not confirmed", 404);
    if (match.leavingMemberId !== session.userId && match.arrivingMemberId !== session.userId) {
      return err("Not a participant in this match", 403);
    }
    if (match.matchState !== "departing") {
      return err(`Cannot complete exchange in current state: ${match.matchState}`, 400);
    }

    await db
      .update(parkingMatches)
      .set({ matchState: "complete" })
      .where(eq(parkingMatches.id, matchId));

    return ok({ matchState: "complete", message: "Exchange complete! Enjoy your spot." });
  } catch (error) {
    return handleError(error, "Complete exchange error");
  }
}
