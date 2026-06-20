import { db } from "@/lib/db";
import { parkingMatches } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { validate, parkingMatchActionSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { matchId } = validate(parkingMatchActionSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(
        and(
          eq(parkingMatches.id, matchId),
          or(
            eq(parkingMatches.leavingMemberId, session.userId),
            eq(parkingMatches.arrivingMemberId, session.userId),
          ),
        ),
      )
      .limit(1);

    if (!match) {
      return err("Match not found", 404);
    }

    await db
      .update(parkingMatches)
      .set({ status: "cancelled" })
      .where(eq(parkingMatches.id, matchId));

    return ok({ success: true, status: "cancelled" });
  } catch (error) {
    return handleError(error, "Parking match cancel error");
  }
}
