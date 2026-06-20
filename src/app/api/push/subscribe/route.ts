import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { validate, pushSubscribeSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 10);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { endpoint, auth, p256dh, userAgent } = validate(pushSubscribeSchema, await req.json());

    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, session.userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      )
      .limit(1);

    if (existing) {
      return ok({ ok: true });
    }

    await db.insert(pushSubscriptions).values({
      id: uuid(),
      userId: session.userId,
      endpoint,
      auth,
      p256dh,
      userAgent: userAgent ?? null,
      createdAt: new Date().toISOString(),
    });

    return ok({ ok: true });
  } catch (error) {
    return handleError(error, "Push subscribe error");
  }
}
