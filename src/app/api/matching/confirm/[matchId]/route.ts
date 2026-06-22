import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { preScheduledMatches } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth-server";
import { err, handleError, ok } from "@/lib/apiResponse";

export async function POST(_req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const { matchId } = await params;
    const [match] = await db
      .select()
      .from(preScheduledMatches)
      .where(and(
        eq(preScheduledMatches.id, matchId),
        eq(preScheduledMatches.status, "pending"),
        or(
          eq(preScheduledMatches.incomingMemberId, session.userId),
          eq(preScheduledMatches.departingMemberId, session.userId),
        ),
      ))
      .limit(1);

    if (!match) return err("Match not found or already processed", 404);

    await db
      .update(preScheduledMatches)
      .set({ status: "confirmed", updatedAt: new Date().toISOString() })
      .where(eq(preScheduledMatches.id, matchId));

    return ok({ success: true, status: "confirmed" });
  } catch (error) {
    return handleError(error, "Pre-scheduled match confirm error");
  }
}
