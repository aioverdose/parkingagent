import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, referrals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { stripe, createCheckoutSession, PRICES } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceType } = await req.json();
    if (!priceType || !["monthly", "annual"].includes(priceType)) {
      return NextResponse.json({ error: "Invalid price type" }, { status: 400 });
    }

    const priceId = PRICES[priceType];
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
