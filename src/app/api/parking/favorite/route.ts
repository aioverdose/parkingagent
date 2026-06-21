import { db } from "@/lib/db";
import { parkingMatches } from "@/lib/db/schema";
import { pgTable, text, index } from "drizzle-orm/pg-core";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

const favoriteMembers = pgTable(
  "favorite_members",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    memberId: text("member_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    userIdx: index("fm_user_idx").on(table.userId),
    memberIdx: index("fm_member_idx").on(table.memberId),
  }),
);

const parkingFavoriteSchema = z.object({
  matchId: z.string().min(1, "matchId is required"),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { matchId } = validate(parkingFavoriteSchema, await req.json());

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
      return err("Match not found or not confirmed", 404);
    }

    const otherMemberId =
      match.leavingMemberId === session.userId
        ? match.arrivingMemberId
        : match.leavingMemberId;

    await db.insert(favoriteMembers).values({
      id: uuid(),
      userId: session.userId,
      memberId: otherMemberId,
      createdAt: new Date().toISOString(),
    });

    return ok({ favorited: true });
  } catch (error) {
    return handleError(error, "Parking favorite error");
  }
}
