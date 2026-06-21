import { db } from "@/lib/db";
import { users, parkingMatches } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

const parkingRateSchema = z.object({
  matchId: z.string().min(1, "matchId is required"),
  rating: z.number().int().min(1).max(5),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { matchId, rating } = validate(parkingRateSchema, await req.json());

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

    if (!match) {
      return err("Match not found or not yet confirmed", 404);
    }

    if (match.rated) {
      return err("Match already rated", 400);
    }

    const now = new Date().toISOString();

    await db
      .update(parkingMatches)
      .set({ rated: true, rating })
      .where(eq(parkingMatches.id, matchId));

    const currentUserId = session.userId;
    const otherUserId =
      match.leavingMemberId === currentUserId
        ? match.arrivingMemberId
        : match.leavingMemberId;

    if (rating >= 4) {
      for (const uid of [currentUserId, otherUserId]) {
        const [member] = await db
          .select({ rankingScore: users.rankingScore })
          .from(users)
          .where(eq(users.id, uid))
          .limit(1);

        if (member) {
          await db
            .update(users)
            .set({
              rankingScore: (member.rankingScore || 0) + 10,
              updatedAt: now,
            })
            .where(eq(users.id, uid));
        }
      }
    }

    if (rating <= 2) {
      const [other] = await db
        .select({ rankingScore: users.rankingScore, status: users.status })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      if (other) {
        await db
          .update(users)
          .set({
            rankingScore: Math.max(0, (other.rankingScore || 0) - 10),
            status: "suspended",
            updatedAt: now,
          })
          .where(eq(users.id, otherUserId));
      }
    }

    return ok({ rated: true });
  } catch (error) {
    return handleError(error, "Parking rate error");
  }
}
