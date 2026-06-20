import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { createBillingPortalSession } from "@/lib/stripe";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST() {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user?.stripeCustomerId) {
      return err("No active subscription", 400);
    }

    const portalSession = await createBillingPortalSession(user.stripeCustomerId);
    return ok({ url: portalSession.url });
  } catch (error) {
    return handleError(error, "Portal error");
  }
}
