import { db } from "@/lib/db";
import { users, parkingMatches } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

const parkingConfirmSchema = z.object({
  matchId: z.string().min(1, "matchId is required"),
  success: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { matchId, success } = validate(parkingConfirmSchema, await req.json());

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(
        and(
          eq(parkingMatches.id, matchId),
          eq(parkingMatches.status, "pending"),
          or(
            eq(parkingMatches.leavingMemberId, session.userId),
            eq(parkingMatches.arrivingMemberId, session.userId),
          ),
        ),
      )
      .limit(1);

    if (!match) {
      return err("Match not found or already processed", 404);
    }

    const now = new Date().toISOString();

    if (success) {
      await db
        .update(parkingMatches)
        .set({ confirmed: true, confirmedAt: now, status: "confirmed" })
        .where(eq(parkingMatches.id, matchId));

      const currentUserId = session.userId;
      const otherUserId =
        match.leavingMemberId === currentUserId
          ? match.arrivingMemberId
          : match.leavingMemberId;

      for (const uid of [currentUserId, otherUserId]) {
        const [member] = await db
          .select({ ranking: users.ranking, matchCount: users.matchCount, rankingScore: users.rankingScore })
          .from(users)
          .where(eq(users.id, uid))
          .limit(1);

        if (member) {
          await db
            .update(users)
            .set({
              ranking: Math.min(5, (member.ranking || 5) + 1),
              matchCount: (member.matchCount || 0) + 1,
              rankingScore: (member.rankingScore || 0) + 10,
              updatedAt: now,
            })
            .where(eq(users.id, uid));
        }
      }
    } else {
      await db
        .update(parkingMatches)
        .set({ confirmed: false, failedAt: now, status: "cancelled" })
        .where(eq(parkingMatches.id, matchId));

      const currentUserId = session.userId;
      const otherUserId =
        match.leavingMemberId === currentUserId
          ? match.arrivingMemberId
          : match.leavingMemberId;

      const [other] = await db
        .select({ noShowCount: users.noShowCount, rankingScore: users.rankingScore })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      if (other) {
        await db
          .update(users)
          .set({
            noShowCount: (other.noShowCount || 0) + 1,
            rankingScore: Math.max(0, (other.rankingScore || 0) - 10),
            updatedAt: now,
          })
          .where(eq(users.id, otherUserId));
      }
    }

    return ok({ confirmed: true });
  } catch (error) {
    return handleError(error, "Parking confirm error");
  }
}
