import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set");
}

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
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : email,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://parking-agent.vercel.app"}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://parking-agent.vercel.app"}/pricing?checkout=canceled`,
    subscription_data: {
      metadata: { userId },
    },
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://parking-agent.vercel.app"}/dashboard`,
  });

  return session;
}
