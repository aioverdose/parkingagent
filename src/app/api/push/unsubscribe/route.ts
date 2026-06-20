import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { validate, pushUnsubscribeSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { endpoint } = validate(pushUnsubscribeSchema, await req.json());

    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, session.userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      );

    return ok({ ok: true });
  } catch (error) {
    return handleError(error, "Push unsubscribe error");
  }
}
