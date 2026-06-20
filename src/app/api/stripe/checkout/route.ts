import { db } from "@/lib/db";
import { users, referrals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { stripe, createCheckoutSession, PRICES } from "@/lib/stripe";
import { validate, stripeCheckoutSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { priceType } = validate(stripeCheckoutSchema, await req.json());

    const priceId = PRICES[priceType];
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return err("User not found", 404);
    }

    // Find referrer from referral record (pending status = signed up but not yet paid)
    const [referral] = await db
      .select()
      .from(referrals)
      .where(
        eq(referrals.referredId, user.id),
      )
      .limit(1);

    const checkoutSession = await createCheckoutSession(
      user.stripeCustomerId,
      user.email,
      priceId,
      user.id,
      referral?.referrerId,
    );

    return ok({ url: checkoutSession.url });
  } catch (error) {
    return handleError(error, "Checkout error");
  }
}
