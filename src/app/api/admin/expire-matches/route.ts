import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { matches, spotOffers } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const cronSecret = req.headers.get("x-cron-secret");
    const isAuthorized =
      (session && session.role === "admin") ||
      (cronSecret && cronSecret === process.env.CRON_SECRET);

    if (!isAuthorized) {
      return err("Unauthorized", 401);
    }

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const staleMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.status, "active"),
          lt(matches.matchedAt, thirtyMinAgo),
        ),
      );

    let expired = 0;
    for (const match of staleMatches) {
      await db
        .update(matches)
        .set({ status: "expired" })
        .where(eq(matches.id, match.id));

      if (match.spotOfferId) {
        await db
          .update(spotOffers)
          .set({ status: "available" })
          .where(eq(spotOffers.id, match.spotOfferId));
      }
      expired++;
    }

    return ok({ expired });
  } catch (error) {
    return handleError(error, "Expire matches error");
  }
}
