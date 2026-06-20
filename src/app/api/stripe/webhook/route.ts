import Stripe from "stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { markReferralConverted, handleReferralReward } from "@/lib/referral";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET ?? "",
      );
    } catch {
      return err("Invalid signature", 400);
    }

    const data = event.data.object as any;

    switch (event.type) {
      case "checkout.session.completed": {
        const userId = data.metadata?.userId as string | undefined;
        const subscriptionId = data.subscription as string | undefined;
        const customerId = data.customer as string;

        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
          await db
            .update(users)
            .set({
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: mapStatus(sub.status),
              subscriptionPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
              membershipType: interval === "year" ? "annual" : "monthly",
              isMember: true,
              status: "good-standing",
              updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, userId));
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const subscriptionId = data.subscription as string | undefined;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const subUserId = sub.metadata?.userId as string | undefined;
          const subReferrerId = sub.metadata?.referrerId as string | undefined;
          const invoiceId = data.id as string;

          if (subUserId) {
            await db
              .update(users)
              .set({
                subscriptionStatus: mapStatus(sub.status),
                subscriptionPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
                isMember: true,
                status: "good-standing",
                updatedAt: new Date().toISOString(),
              })
              .where(eq(users.id, subUserId));

            // Referral conversion: first successful payment
            if (subReferrerId && invoiceId) {
              try {
                const converted = await markReferralConverted(
                  subUserId,
                  subscriptionId,
                  invoiceId,
                );

                if (converted && converted.status === "converted") {
                  const reward = await handleReferralReward(subReferrerId);
                  if (reward.rewarded) {
                    try {
                      const [referrer] = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, subReferrerId))
                        .limit(1);

                      if (referrer?.stripeSubscriptionId) {
                        const subEnd = sub.current_period_end;
                        const extendedEnd = subEnd + 30 * 24 * 3600;
                        await stripe.subscriptions.update(
                          referrer.stripeSubscriptionId,
                          {
                            trial_end: extendedEnd,
                            proration_behavior: "none",
                          },
                        );
                        await db
                          .update(users)
                          .set({
                            subscriptionPeriodEnd: new Date(extendedEnd * 1000).toISOString(),
                            updatedAt: new Date().toISOString(),
                          })
                          .where(eq(users.id, subReferrerId));
                      }
                    } catch (stripeErr) {
                      console.error("Failed to extend subscription for referrer:", stripeErr);
                    }
                  }
                }
              } catch (refErr) {
                console.error("Referral processing error:", refErr);
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subUserId = data.metadata?.userId as string | undefined;
        if (subUserId) {
          const isActive = data.status === "active" || data.status === "trialing";
          await db
            .update(users)
            .set({
              subscriptionStatus: mapStatus(data.status),
              subscriptionPeriodEnd: new Date(data.current_period_end * 1000).toISOString(),
              isMember: isActive,
              status: isActive ? "good-standing" : "suspended",
              updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, subUserId));
        }
        break;
      }
    }

    return ok({ received: true });
  } catch (error) {
    return handleError(error, "Webhook error");
  }
}

function mapStatus(status: string): "active" | "past_due" | "canceled" | "incomplete" | "none" {
  const allowed = ["active", "past_due", "canceled", "incomplete", "none"] as const;
  return allowed.includes(status as any) ? (status as any) : "none";
}
