import { db } from "@/lib/db";
import { matches, spotOffers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { validate, pairingAcceptSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 20);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { matchId, action } = validate(pairingAcceptSchema, await req.json());

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match) {
      return err("Match not found", 404);
    }

    if (action === "accept") {
      const now = new Date().toISOString();
      await db
        .update(matches)
        .set({ status: "completed", arrivalAt: now })
        .where(eq(matches.id, matchId));

      if (match.spotOfferId) {
        await db
          .update(spotOffers)
          .set({ status: "completed" })
          .where(eq(spotOffers.id, match.spotOfferId));
      }
    } else {
      await db
        .update(matches)
        .set({ status: "cancelled" })
        .where(eq(matches.id, matchId));

      if (match.spotOfferId) {
        await db
          .update(spotOffers)
          .set({ status: "available" })
          .where(eq(spotOffers.id, match.spotOfferId));
      }
    }

    return ok({ success: true });
  } catch (error) {
    return handleError(error, "Pairing accept error");
  }
}
