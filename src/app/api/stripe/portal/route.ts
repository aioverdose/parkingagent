import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    const portalSession = await createBillingPortalSession(user.stripeCustomerId);
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
