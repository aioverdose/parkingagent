import { db } from "@/lib/db";
import { referralCodes, referrals } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "PA-";
  for (let i = 0; i < 6; i++) {
    code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return code;
}

export async function generateReferralCode(userId: string): Promise<string> {
  let code: string;
  let attempts = 0;
  do {
    code = generateCode();
    const [existing] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  await db.insert(referralCodes).values({
    id: uuid(),
    userId,
    code,
    createdAt: new Date().toISOString(),
  });

  return code;
}

export async function getReferralCode(userId: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);
  return row?.code ?? null;
}

export async function lookupReferrerByCode(code: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, code))
    .limit(1);
  return row?.userId ?? null;
}

export async function createReferral(
  referrerId: string,
  referredId: string,
  codeUsed: string,
) {
  await db.insert(referrals).values({
    id: uuid(),
    referrerId,
    referredId,
    codeUsed,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

export async function getReferralStats(userId: string) {
  const [totalResult] = await db
    .select({ total: count() })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

  const [convertedResult] = await db
    .select({ total: count() })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, userId),
        sql`${referrals.status} IN ('converted', 'rewarded')`,
      ),
    );

  const [rewardedResult] = await db
    .select({ total: count() })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, userId),
        eq(referrals.status, "rewarded"),
      ),
    );

  const totalReferred = totalResult?.total ?? 0;
  const converted = convertedResult?.total ?? 0;
  const rewarded = rewardedResult?.total ?? 0;
  const freeMonthsEarned = Math.floor(rewarded / 3) * 1;
  const nextMilestone = (Math.floor(converted / 3) + 1) * 3;
  const remainingForNext = Math.max(0, nextMilestone - converted);
  const hasRecentFraudFlag = await detectFraud(userId);

  return {
    totalReferred,
    converted,
    rewarded,
    freeMonthsEarned,
    remainingForNext,
    totalConvertedNeeded: nextMilestone,
    hasRecentFraudFlag,
  };
}

async function detectFraud(userId: string): Promise<boolean> {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const [recent] = await db
    .select({ total: count() })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, userId),
        sql`${referrals.createdAt} >= ${fiveMinAgo}`,
      ),
    );
  return (recent?.total ?? 0) >= 3;
}

export async function markReferralConverted(
  referredId: string,
  stripeSubscriptionId: string,
  invoiceId: string,
) {
  const [referral] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredId, referredId))
    .limit(1);

  if (!referral) return null;
  if (referral.status !== "pending") return referral;

  await db
    .update(referrals)
    .set({
      status: "converted",
      convertedAt: new Date().toISOString(),
      stripeSubscriptionId,
      invoiceId,
    })
    .where(eq(referrals.id, referral.id));

  return { ...referral, status: "converted" as const };
}

export async function handleReferralReward(referrerId: string) {
  const [unrewarded] = await db
    .select({ total: count() })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, referrerId),
        eq(referrals.status, "converted"),
      ),
    );

  const unrewardedCount = unrewarded?.total ?? 0;
  const rewardBatches = Math.floor(unrewardedCount / 3);
  if (rewardBatches === 0) {
    return { rewarded: false, reason: "No new reward due" };
  }

  const toReward = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, referrerId),
        eq(referrals.status, "converted"),
      ),
    )
    .limit(rewardBatches * 3);

  for (const r of toReward) {
    await db
      .update(referrals)
      .set({
        status: "rewarded",
        rewardedAt: new Date().toISOString(),
      })
      .where(eq(referrals.id, r.id));
  }

  return { rewarded: true, count: rewardBatches };
}

export const REFERRAL_COOKIE = "pa_ref";
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
