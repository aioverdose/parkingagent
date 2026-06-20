import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  typescript: true,
});

export const PRICES: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "price_monthly",
  annual: process.env.STRIPE_PRICE_ANNUAL ?? "price_annual",
};

export async function createCheckoutSession(
  customerId: string | null,
  email: string,
  priceId: string,
  userId: string,
  referrerId?: string | null,
) {
  const metadata: Record<string, string> = { userId };
  if (referrerId) {
    metadata.referrerId = referrerId;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : email,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?checkout=canceled`,
    subscription_data: {
      metadata,
    },
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
  });

  return session;
}
