import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { webPush } from "@/lib/push";
import { z } from "zod";
import { validate } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

const pushSendSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  title: z.string().min(1, "title is required"),
  body: z.string().min(1, "body is required"),
});

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 30);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    if (session.role !== "admin") {
      return err("Forbidden", 403);
    }

    const { userId, title, body } = validate(pushSendSchema, await req.json());

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      return ok({ sent: false, reason: "No subscriptions found" });
    }

    let sentCount = 0;
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.auth, p256dh: sub.p256dh },
          },
          JSON.stringify({ title, body }),
        );
        sentCount++;
      } catch {
        // subscription expired or invalid — skip
      }
    }

    return ok({ sent: true, sentCount });
  } catch (error) {
    return handleError(error, "Push send error");
  }
}
